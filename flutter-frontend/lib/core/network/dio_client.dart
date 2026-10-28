import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  DioClient({required String baseUrl})
      : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
            contentType: Headers.jsonContentType,
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Retrieve secure access token from system keychain
          final accessToken = await _secureStorage.read(key: 'access_token');
          if (accessToken != null) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Intercept 401 errors to trigger token refresh rotation lifecycle
          if (error.response?.statusCode == 401) {
            final refreshToken = await _secureStorage.read(key: 'refresh_token');
            if (refreshToken != null) {
              try {
                // Request token swap from authorization endpoint
                final response = await Dio().post(
                  '${error.requestOptions.baseUrl}/auth/refresh',
                  data: {'refresh_token': refreshToken},
                );
                
                final newAccessToken = response.data['access_token'];
                final newRefreshToken = response.data['refresh_token'];
                
                await _secureStorage.write(key: 'access_token', value: newAccessToken);
                await _secureStorage.write(key: 'refresh_token', value: newRefreshToken);
                
                // Retry initial network request with updated auth header
                error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                final clonedRequest = await _dio.fetch(error.requestOptions);
                return handler.resolve(clonedRequest);
              } catch (e) {
                // Wipe credentials and redirect to login panel if refresh token is expired
                await _secureStorage.delete(key: 'access_token');
                await _secureStorage.delete(key: 'refresh_token');
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
