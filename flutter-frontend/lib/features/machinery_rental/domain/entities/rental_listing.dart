class RentalListing {
  final String id;
  final String ownerId;
  final String title;
  final String description;
  final double pricePerHour;
  final double latitude;
  final double longitude;
  final DateTime createdAt;

  const RentalListing({
    required this.id,
    required this.ownerId,
    required this.title,
    required this.description,
    required this.pricePerHour,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is RentalListing &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          ownerId == other.ownerId &&
          title == other.title &&
          pricePerHour == other.pricePerHour;

  @override
  int get hashCode =>
      id.hashCode ^ ownerId.hashCode ^ title.hashCode ^ pricePerHour.hashCode;
}
