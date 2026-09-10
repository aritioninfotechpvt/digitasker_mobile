import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();

  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  String? get errorMessage => _errorMessage;

  Future<bool> initAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await _storage.getToken();
      if (token != null) {
        final data = await _api.get('/auth/me');
        if (data != null && data['user'] != null) {
          _user = UserModel.fromJson(data['user']);
          await _storage.saveUserData(jsonEncode(_user!.toJson()));
          _isLoading = false;
          notifyListeners();
          return true;
        }
      }
    } catch (_) {
      await _storage.clearAll();
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await _api.post('/auth/login', {
        'email': email,
        'password': password,
      });

      final token = data['access_token'] ?? data['token'];
      if (token != null) {
        await _storage.saveToken(token.toString());
        _user = UserModel.fromJson(data['user']);
        await _storage.saveUserData(jsonEncode(_user!.toJson()));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
    String? phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await _api.post('/auth/register', {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        if (phone != null) 'phone': phone,
      });

      final token = data['access_token'] ?? data['token'];
      if (token != null) {
        await _storage.saveToken(token.toString());
        _user = UserModel.fromJson(data['user']);
        await _storage.saveUserData(jsonEncode(_user!.toJson()));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout', {});
    } catch (_) {}
    await _storage.clearAll();
    _user = null;
    notifyListeners();
  }
}
