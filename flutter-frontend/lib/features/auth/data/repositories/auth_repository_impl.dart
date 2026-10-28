import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final FlutterSecureStorage secureStorage;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.secureStorage,
  });

  @override
  Future<User> login({
    required String phone,
    required String password,
  }) async {
    final tokenData = await remoteDataSource.login(phone: phone, password: password);
    final accessToken = tokenData['access_token'] as String;
    final refreshToken = tokenData['refresh_token'] as String;

    await secureStorage.write(key: 'access_token', value: accessToken);
    await secureStorage.write(key: 'refresh_token', value: refreshToken);

    return remoteDataSource.getMe();
  }

  @override
  Future<User> register({
    required String phone,
    required String name,
    required String password,
    required String role,
  }) async {
    return remoteDataSource.register(
      phone: phone,
      name: name,
      password: password,
      role: role,
    );
  }

  @override
  Future<User> getMe() async {
    return remoteDataSource.getMe();
  }

  @override
  Future<void> logout() async {
    await secureStorage.delete(key: 'access_token');
    await secureStorage.delete(key: 'refresh_token');
  }
}
