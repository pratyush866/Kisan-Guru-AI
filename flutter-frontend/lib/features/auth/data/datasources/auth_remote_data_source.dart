import 'package:dio/dio.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login({
    required String phone,
    required String password,
  });

  Future<UserModel> register({
    required String phone,
    required String name,
    required String password,
    required String role,
  });

  Future<UserModel> getMe();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio client;

  AuthRemoteDataSourceImpl(this.client);

  @override
  Future<Map<String, dynamic>> login({
    required String phone,
    required String password,
  }) async {
    final response = await client.post(
      '/auth/login',
      data: {
        'phone': phone,
        'password': password,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  @override
  Future<UserModel> register({
    required String phone,
    required String name,
    required String password,
    required String role,
  }) async {
    final response = await client.post(
      '/auth/register',
      data: {
        'phone': phone,
        'name': name,
        'password': password,
        'role': role,
      },
    );
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<UserModel> getMe() async {
    final response = await client.get('/auth/me');
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }
}
