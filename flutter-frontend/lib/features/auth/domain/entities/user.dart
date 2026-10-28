class User {
  final String id;
  final String phone;
  final String name;
  final String role;
  final DateTime createdAt;

  const User({
    required this.id,
    required this.phone,
    required this.name,
    required this.role,
    required this.createdAt,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is User &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          phone == other.phone &&
          name == other.name &&
          role == other.role;

  @override
  int get hashCode => id.hashCode ^ phone.hashCode ^ name.hashCode ^ role.hashCode;
}
