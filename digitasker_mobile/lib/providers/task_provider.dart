import 'package:flutter/material.dart';
import '../data/demo_data.dart';
import '../models/task_model.dart';
import '../services/api_service.dart';

class TaskProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  List<TaskModel> _featuredTasks = [];
  List<TaskModel> _availableTasks = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<TaskModel> get featuredTasks => _featuredTasks;
  List<TaskModel> get availableTasks => _availableTasks;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchFeaturedTasks() async {
    try {
      final res = await _api.get('/public/featured-tasks');
      final list = (res['tasks'] ?? res['data'] ?? []) as List;
      if (list.isNotEmpty) {
        _featuredTasks = list.map((item) => TaskModel.fromJson(item)).toList();
      } else {
        _featuredTasks = DemoData.tasks;
      }
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      if (_featuredTasks.isEmpty) {
        _featuredTasks = DemoData.tasks;
      }
      notifyListeners();
    }
  }

  Future<void> fetchUserTasks() async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _api.get('/user/find-tasks');
      final list = (res['tasks'] ?? res['data'] ?? []) as List;
      if (list.isNotEmpty) {
        _availableTasks = list.map((item) => TaskModel.fromJson(item)).toList();
      } else {
        // Fallback to public featured tasks from API
        await fetchFeaturedTasks();
        _availableTasks = _featuredTasks;
      }
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      try {
        final res = await _api.get('/public/featured-tasks');
        final list = (res['tasks'] ?? res['data'] ?? []) as List;
        _availableTasks = list.map((item) => TaskModel.fromJson(item)).toList();
      } catch (_) {
        _availableTasks = DemoData.tasks;
      }
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> submitTask({
    required int taskId,
    required List<String> evidenceUrls,
    required double geoLat,
    required double geoLng,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _api.post('/user/tasks/$taskId/submit', {
        'evidence_urls': evidenceUrls,
        'geo_lat': geoLat,
        'geo_lng': geoLng,
      });
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
