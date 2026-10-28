import '../entities/rental_listing.dart';

abstract class RentalRepository {
  Future<List<RentalListing>> getListings({
    required double latitude,
    required double longitude,
    required double radiusInKm,
  });

  Future<RentalListing> createListing({
    required String title,
    required String description,
    required double pricePerHour,
    required double latitude,
    required double longitude,
  });

  Future<void> bookListing({
    required String listingId,
    required DateTime startTime,
    required DateTime endTime,
  });
}
