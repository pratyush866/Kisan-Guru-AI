from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import math
from datetime import datetime, timezone
import uuid

from app.core.database import get_db_session
from app.core.models import RentalListing, RentalBooking, User
from app.modules.auth.router import get_current_user
from app.modules.schemas import RentalListingCreate, RentalListingOut, RentalBookingCreate, RentalBookingOut

router = APIRouter(prefix="/rental", tags=["Machinery Rental Marketplace"])

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
  """
  Calculates distance in kilometers between two GPS coordinates using the Haversine formula.
  """
  R = 6371.0  # Earth's radius in km
  d_lat = math.radians(lat2 - lat1)
  d_lon = math.radians(lon2 - lon1)
  a = (math.sin(d_lat / 2) ** 2 +
       math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
  c = 2 * math.asin(math.sqrt(a))
  return R * c

@router.post("/listings", response_model=RentalListingOut, status_code=status.HTTP_201_CREATED)
async def create_listing(
  listing_in: RentalListingCreate,
  current_user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_db_session)
):
  # Restrict to verified role classes (e.g. owners, admins, farmers)
  if current_user.role not in ["owner", "farmer", "admin"]:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Only owners, farmers, and admins can create machine rental listings."
    )
  
  new_listing = RentalListing(
    owner_id=current_user.id,
    title=listing_in.title,
    description=listing_in.description,
    price_per_hour=listing_in.price_per_hour,
    latitude=listing_in.latitude,
    longitude=listing_in.longitude
  )
  if not new_listing.id:
    new_listing.id = str(uuid.uuid4())
  if not new_listing.created_at:
    new_listing.created_at = datetime.now(timezone.utc)
  db.add(new_listing)
  await db.flush()
  return new_listing

@router.get("/listings", response_model=List[RentalListingOut])
async def search_listings(
  lat: Optional[float] = Query(None, description="Current latitude"),
  lon: Optional[float] = Query(None, description="Current longitude"),
  radius: Optional[float] = Query(25.0, description="Geofence radius search in km"),
  db: AsyncSession = Depends(get_db_session)
):
  """
  Retrieves active listings, optionally filtering within a geospatial bounding box and calculating
  distances to match machines within the radius.
  """
  result = await db.execute(select(RentalListing))
  listings = result.scalars().all()

  if lat is not None and lon is not None:
    filtered_listings = []
    for item in listings:
      dist = calculate_haversine_distance(lat, lon, item.latitude, item.longitude)
      if dist <= radius:
        filtered_listings.append(item)
    return filtered_listings

  return listings

@router.post("/bookings", response_model=RentalBookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
  booking_in: RentalBookingCreate,
  current_user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_db_session)
):
  # Check if listing exists
  result = await db.execute(select(RentalListing).filter(RentalListing.id == booking_in.listing_id))
  listing = result.scalars().first()
  if not listing:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Rental machinery listing not found."
    )
  
  # Prevent booking own machine
  if listing.owner_id == current_user.id:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="You cannot rent your own machinery listing."
    )

  # Check times
  if booking_in.start_time >= booking_in.end_time:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Booking start time must occur before end time."
    )
  
  duration_seconds = (booking_in.end_time - booking_in.start_time).total_seconds()
  duration_hours = max(1.0, duration_seconds / 3600.0)
  total_price = duration_hours * listing.price_per_hour

  new_booking = RentalBooking(
    listing_id=booking_in.listing_id,
    tenant_id=current_user.id,
    status="created",
    start_time=booking_in.start_time,
    end_time=booking_in.end_time,
    total_price=total_price
  )
  if not new_booking.id:
    new_booking.id = str(uuid.uuid4())
  if not new_booking.created_at:
    new_booking.created_at = datetime.now(timezone.utc)
  db.add(new_booking)
  await db.flush()
  return new_booking

@router.get("/bookings", response_model=List[RentalBookingOut])
async def list_bookings(
  current_user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_db_session)
):
  # Display tenant's bookings
  result = await db.execute(select(RentalBooking).filter(RentalBooking.tenant_id == current_user.id))
  return result.scalars().all()

@router.patch("/bookings/{booking_id}/status", response_model=RentalBookingOut)
async def update_booking_status(
  booking_id: str,
  status: str = Query(..., description="Target status: approved, paid, active, completed, reviewed"),
  current_user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_db_session)
):
  result = await db.execute(select(RentalBooking).filter(RentalBooking.id == booking_id))
  booking = result.scalars().first()
  if not booking:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Booking registry code not found."
    )
  
  # Fetch listing to verify ownership
  listing_res = await db.execute(select(RentalListing).filter(RentalListing.id == booking.listing_id))
  listing = listing_res.scalars().first()

  # Check permission (Tenant or Owner can modify depending on state)
  is_owner = listing.owner_id == current_user.id
  is_tenant = booking.tenant_id == current_user.id

  if not is_owner and not is_tenant:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Unauthorized to update booking status."
    )

  valid_statuses = ["created", "approved", "paid", "active", "completed", "reviewed"]
  if status not in valid_statuses:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"Invalid status state. Use one of: {', '.join(valid_statuses)}"
    )

  # State workflow validations
  if status == "approved" and not is_owner:
    raise HTTPException(status_code=403, detail="Only machinery owner can approve bookings.")
  if status == "paid" and not is_tenant:
    raise HTTPException(status_code=403, detail="Only tenant can complete payment deposits.")
  
  booking.status = status
  await db.flush()
  return booking
