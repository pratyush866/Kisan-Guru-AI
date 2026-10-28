import '../entities/user.dart';

abstract class AuthRepository {
  Future<User> login({
    required String phone,
    required String password,
  });

  Future<User> register({
    required String phone,
    required String name,
    required String password,
    required String role,
  });

  Future<User> getMe();

  Future<void> logout();
}
