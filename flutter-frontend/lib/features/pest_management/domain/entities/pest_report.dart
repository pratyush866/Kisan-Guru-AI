class PestReport {
  final String id;
  final String imageUrl;
  final String pestDetected;
  final double confidence;
  final String severity;
  final String? damageDescription;
  final double spreadRiskPercentage;
  final String treatmentPlanJson;
  final double cropLossPercentage;
  final String urgencyLevel;
  final double? locationLatitude;
  final double? locationLongitude;
  final bool isFavorite;
  final String? notes;
  final DateTime createdAt;

  const PestReport({
    required this.id,
    required this.imageUrl,
    required this.pestDetected,
    required this.confidence,
    required this.severity,
    this.damageDescription,
    required this.spreadRiskPercentage,
    required this.treatmentPlanJson,
    required this.cropLossPercentage,
    required this.urgencyLevel,
    this.locationLatitude,
    this.locationLongitude,
    required this.isFavorite,
    this.notes,
    required this.createdAt,
  });
}
