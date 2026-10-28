import '../entities/crop.dart';
import '../../../pest_management/domain/entities/pest_report.dart';

abstract class CropRepository {
  Future<List<Crop>> getCrops();

  Future<Crop> registerCrop({
    required String name,
    String? variety,
    required DateTime sowingDate,
  });

  Future<PestReport> diagnoseCropDisease({
    required List<int> imageBytes,
    required String filename,
    double? latitude,
    double? longitude,
  });
}
