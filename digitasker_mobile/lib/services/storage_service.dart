import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  final _storage = const FlutterSecureStorage();

  static const String _keyToken = 'insightloop_token';
  static const String _keyUserData = 'insightloop_user';

  Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _keyToken);
  }

  Future<void> saveUserData(String jsonString) async {
    await _storage.write(key: _keyUserData, value: jsonString);
  }

  Future<String?> getUserData() async {
    return await _storage.read(key: _keyUserData);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
