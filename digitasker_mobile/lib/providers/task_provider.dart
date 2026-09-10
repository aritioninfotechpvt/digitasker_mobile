import 'dart:async';
import 'package:flutter/material.dart';
import '../data/demo_data.dart';
import '../models/task_model.dart';
import '../services/api_service.dart';

class TaskNotificationItem {
  final String id;
  final IconData icon;
  final String title;
  final String description;
  final String time;
  final Color iconColor;
  final Color iconBg;
  final bool isRead;
  final TaskModel? task;

  TaskNotificationItem({
    required this.id,
    required this.icon,
    required this.title,
    required this.description,
    required this.time,
    required this.iconColor,
    required this.iconBg,
    this.isRead = false,
    this.task,
  });

  TaskNotificationItem copyWith({bool? isRead}) {
    return TaskNotificationItem(
      id: id,
      icon: icon,
      title: title,
      description: description,
      time: time,
      iconColor: iconColor,
      iconBg: iconBg,
      isRead: isRead ?? this.isRead,
      task: task,
    );
  }
}

class TaskProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  List<TaskModel> _featuredTasks = [];
  List<TaskModel> _availableTasks = [];
  List<TaskNotificationItem> _notifications = [];
  Set<int> _knownTaskIds = {};
  Timer? _pollTimer;
  bool _isLoading = false;
  String? _errorMessage;

  List<TaskModel> get featuredTasks => _featuredTasks;
  List<TaskModel> get availableTasks => _availableTasks;
  List<TaskNotificationItem> get notifications => _notifications;
  bool get hasUnreadNotifications => _notifications.any((n) => !n.isRead);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  TaskProvider() {
    _initDefaultNotifications();
  }

  void _initDefaultNotifications() {
    _notifications = [
      TaskNotificationItem(
        id: '1',
        icon: Icons.location_on_rounded,
        title: 'New Store Audit Available',
        description: "Domino's Quality Check Audit available in Zirakpur.",
        time: '2m ago',
        iconColor: const Color(0xFF1677FF),
        iconBg: const Color(0xFFEAF4FF),
      ),
      TaskNotificationItem(
        id: '2',
        icon: Icons.verified_rounded,
        title: 'Payment Credited',
        description: '₹250 credited to your wallet for SUB-4178 audit.',
        time: '1h ago',
        iconColor: const Color(0xFF52C41A),
        iconBg: const Color(0xFFF6FFED),
      ),
      TaskNotificationItem(
        id: '3',
        icon: Icons.check_circle_rounded,
        title: 'Task Approved',
        description: "Your Amazon Package Delivery Check has been approved by admin.",
        time: '3h ago',
        iconColor: const Color(0xFFFA8C16),
        iconBg: const Color(0xFFFFF7E6),
      ),
    ];
  }

  void startPollingTasks({Function(TaskModel newTask)? onNewTaskAlert}) {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 25), (_) {
      checkForNewTasks(onNewTaskAlert: onNewTaskAlert);
    });
  }

  void stopPollingTasks() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> checkForNewTasks({Function(TaskModel newTask)? onNewTaskAlert}) async {
    try {
      final res = await _api.get('/public/featured-tasks');
      final list = (res['tasks'] ?? res['data'] ?? []) as List;
      if (list.isNotEmpty) {
        final newTaskList = list.map((item) => TaskModel.fromJson(item)).toList();
        for (var t in newTaskList) {
          if (_knownTaskIds.isNotEmpty && !_knownTaskIds.contains(t.id)) {
            // Admin created a new task!
            final notif = TaskNotificationItem(
              id: 'task_${t.id}_${DateTime.now().millisecondsSinceEpoch}',
              icon: Icons.new_releases_rounded,
              title: '🔔 New Task Added by Admin!',
              description: '${t.title} - Earn ₹${t.reward.toStringAsFixed(0)}',
              time: 'Just now',
              iconColor: const Color(0xFF1677FF),
              iconBg: const Color(0xFFEAF4FF),
              task: t,
            );
            _notifications.insert(0, notif);
            if (onNewTaskAlert != null) {
              onNewTaskAlert(t);
            }
          }
        }
        _featuredTasks = newTaskList;
        _knownTaskIds = newTaskList.map((t) => t.id).toSet();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> fetchFeaturedTasks() async {
    try {
      final res = await _api.get('/public/featured-tasks');
      final list = (res['tasks'] ?? res['data'] ?? []) as List;
      if (list.isNotEmpty) {
        _featuredTasks = list.map((item) => TaskModel.fromJson(item)).toList();
        _knownTaskIds = _featuredTasks.map((t) => t.id).toSet();
      } else {
        _featuredTasks = DemoData.tasks;
        _knownTaskIds = _featuredTasks.map((t) => t.id).toSet();
      }
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      if (_featuredTasks.isEmpty) {
        _featuredTasks = DemoData.tasks;
        _knownTaskIds = _featuredTasks.map((t) => t.id).toSet();
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

  void markAllNotificationsRead() {
    _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
    notifyListeners();
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

  @override
  void dispose() {
    stopPollingTasks();
    super.dispose();
  }
}
