import json
import random
import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db_session
from app.modules.auth.router import get_current_user
from app.core.models import User
from app.modules.pest.models import PestReport, PestLibraryItem
from app.modules.pest.schemas import (
    PestReportOut,
    PestUpdate,
    PestFavoriteIn,
    PestLibraryItemOut,
    PestAnalyticsSummary
)
from app.modules.pest.service import PestAIProcessor, PEST_LIBRARY_SEED

router = APIRouter(prefix="/pest", tags=["AI Pest Detection & Management"])

@router.post("/detect", response_model=PestReportOut, status_code=status.HTTP_201_CREATED)
async def detect_pest(
    crop_name: str = Form("Maize"),
    model_arch: str = Form("yolo"), # 'cnn', 'resnet', 'efficientnet', 'yolo', 'vit'
    location_lat: Optional[float] = Form(None),
    location_lon: Optional[float] = Form(None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Accepts an uploaded insect photo, runs image quality check, runs YOLO/ViT mock models
    to compile object tags, stores in database, and returns the detailed pest advisory card.
    """
    # 1. Read bytes and run auto quality checks
    contents = await image.read()
    file_size = len(contents)
    await image.seek(0)
    
    quality_result = PestAIProcessor.analyze_image_quality(image.filename, file_size)
    if not quality_result["passed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=quality_result["error"]
        )

    # 2. Execute deep learning mock pipeline
    detection = PestAIProcessor.run_detection(crop_name, image.filename, model_arch)
    
    # Store complete metadata in treatment plan string
    meta_details = {
        "inference_time_ms": detection["inference_time_ms"],
        "model_architecture": detection["model_architecture"],
        "bounding_boxes": detection["bounding_boxes"],
        "top_5_predictions": detection["top_5_predictions"],
        "predictions_forecast": detection["predictions_forecast"],
        "treatment_plan": detection["treatment_plan"],
        "image_quality": {
            "brightness": quality_result.get("brightness", 0.65),
            "contrast": quality_result.get("contrast", 0.70),
            "blur_index": quality_result.get("blur_index", 35.0),
            "format": quality_result.get("format", "JPG")
        }
    }
    
    # Mock upload path
    mock_filename = f"{uuid.uuid4()}_{image.filename}"
    mock_storage_url = f"/static/pest_uploads/{mock_filename}"

    new_report = PestReport(
        user_id=current_user.id,
        image_url=mock_storage_url,
        pest_detected=detection["pest_detected"],
        confidence=detection["confidence"],
        severity=detection["severity"],
        damage_description=detection["damage_description"],
        spread_risk_percentage=detection["spread_risk_percentage"],
        treatment_plan_json=json.dumps(meta_details),
        crop_loss_percentage=detection["crop_loss_percentage"],
        urgency_level=detection["urgency_level"],
        location_latitude=location_lat,
        location_longitude=location_lon,
        is_favorite=False,
        notes=""
    )
    if not new_report.id:
        new_report.id = str(uuid.uuid4())
    if not new_report.created_at:
        new_report.created_at = datetime.now(timezone.utc)
    
    db.add(new_report)
    await db.flush()
    return new_report

@router.get("/history", response_model=List[PestReportOut])
async def get_pest_history(
    pest: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    favorites_only: bool = Query(False),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Retrieves the farmer's pest detection records ledger.
    """
    stmt = select(PestReport).filter(PestReport.user_id == current_user.id)
    
    if pest:
        stmt = stmt.filter(PestReport.pest_detected.ilike(f"%{pest}%"))
    if severity:
        stmt = stmt.filter(PestReport.severity == severity)
    if favorites_only:
        stmt = stmt.filter(PestReport.is_favorite == True)
    if search:
        stmt = stmt.filter(
            (PestReport.pest_detected.ilike(f"%{search}%")) |
            (PestReport.damage_description.ilike(f"%{search}%")) |
            (PestReport.notes.ilike(f"%{search}%"))
        )
        
    stmt = stmt.order_by(PestReport.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/history/{report_id}", response_model=PestReportOut)
async def get_single_pest_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Retrieves details for a specific pest scan.
    """
    stmt = select(PestReport).filter(
        PestReport.id == report_id,
        PestReport.user_id == current_user.id
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pest report not found."
        )
    return report

@router.patch("/history/{report_id}", response_model=PestReportOut)
async def update_pest_report(
    report_id: str,
    update_data: PestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Updates comments or sets a favorite flag in the history scan records.
    """
    stmt = select(PestReport).filter(
        PestReport.id == report_id,
        PestReport.user_id == current_user.id
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pest report not found."
        )
        
    if update_data.notes is not None:
        report.notes = update_data.notes
    if update_data.is_favorite is not None:
        report.is_favorite = update_data.is_favorite
        
    await db.flush()
    return report

@router.delete("/history/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pest_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Removes a scan from the chronological history.
    """
    stmt = select(PestReport).filter(
        PestReport.id == report_id,
        PestReport.user_id == current_user.id
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pest report not found."
        )
        
    await db.delete(report)
    await db.flush()
    return None

@router.get("/library", response_model=List[PestLibraryItemOut])
async def get_pest_library(
    db: AsyncSession = Depends(get_db_session)
):
    """
    Returns the dynamic database catalog of all pests, symptoms, and organic controls.
    """
    stmt = select(PestLibraryItem).order_by(PestLibraryItem.pest_name)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/analytics", response_model=PestAnalyticsSummary)
async def get_pest_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Compiles summary statistics, outbreak warnings, and trend charts.
    """
    stmt = select(PestReport).filter(PestReport.user_id == current_user.id)
    result = await db.execute(stmt)
    reports = result.scalars().all()
    
    total = len(reports)
    critical_cnt = sum(1 for r in reports if r.severity in ["Critical", "High"])
    warning_cnt = sum(1 for r in reports if r.severity == "Medium")
    avg_conf = (sum(r.confidence for r in reports) / total) if total > 0 else 0.0
    
    pest_counts = {}
    severity_counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0, "Healthy": 0}
    crop_distribution = {}
    
    for r in reports:
        pest_counts[r.pest_detected] = pest_counts.get(r.pest_detected, 0) + 1
        severity_counts[r.severity] = severity_counts.get(r.severity, 0) + 1
        
        # Read crop from json metadata
        try:
            plan = json.loads(r.treatment_plan_json)
            # Match standard crops
            c_vulnerability = plan.get("predictions_forecast", {}).get("crop_vulnerability_index", "Other")
            primary_crop = c_vulnerability.split(" (")[0]
        except Exception:
            primary_crop = "Other"
            
        crop_distribution[primary_crop] = crop_distribution.get(primary_crop, 0) + 1

    # Outbreak warnings alerts list simulation
    recent_alerts = [
        {"id": "pa1", "pest": "Fall Armyworm", "crop": "Maize", "distance": "5.4 km", "village": "Saran", "level": "High"},
        {"id": "pa2", "pest": "Locust Swarm", "crop": "Wheat", "distance": "22.1 km", "village": "Gopalganj", "level": "Critical"},
        {"id": "pa3", "pest": "Aphids", "crop": "Mustard", "distance": "7.8 km", "village": "Siwan", "level": "Medium"}
    ]

    # Weekly trend line graph data
    trend_data = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%b %d")
        scans = sum(1 for r in reports if r.created_at.date() == day.date())
        # Visual filler if history is thin
        if scans == 0 and total > 0:
            scans = random.randint(0, 2)
        trend_data.append({
            "date": day_str,
            "scans": scans,
            "infestations": max(0, scans - random.choice([0, 1]))
        })

    return PestAnalyticsSummary(
        total_scans=total,
        critical_count=critical_cnt,
        warning_count=warning_cnt,
        average_confidence=round(avg_conf, 2),
        pest_counts=pest_counts,
        severity_counts=severity_counts,
        crop_distribution=crop_distribution,
        recent_alerts=recent_alerts,
        trend_data=trend_data
    )
