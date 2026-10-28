import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;

  const LoginUseCase(this.repository);

  Future<User> call({
    required String phone,
    required String password,
  }) {
    return repository.login(phone: phone, password: password);
  }
}
