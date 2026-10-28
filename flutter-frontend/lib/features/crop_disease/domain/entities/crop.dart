class Crop {
  final String id;
  final String userId;
  final String name;
  final String? variety;
  final DateTime sowingDate;
  final DateTime createdAt;

  const Crop({
    required this.id,
    required this.userId,
    required this.name,
    this.variety,
    required this.sowingDate,
    required this.createdAt,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Crop &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          userId == other.userId &&
          name == other.name;

  @override
  int get hashCode => id.hashCode ^ userId.hashCode ^ name.hashCode;
}
