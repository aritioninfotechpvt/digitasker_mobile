import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/task_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import 'task_detail_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  int selected = 0;

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final notifications = taskProvider.notifications;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () {
              taskProvider.markAllNotificationsRead();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('All notifications marked as read'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Mark all read'),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
            child: Row(
              children: List.generate(4, (i) {
                final labels = ['All', 'Tasks', 'Payments', 'Updates'];
                final active = selected == i;
                return Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(right: i == 3 ? 0 : 6),
                    child: GestureDetector(
                      onTap: () => setState(() => selected = i),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: active ? AppColors.primaryBlue : const Color(0xFFF3F6FA),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          labels[i],
                          textAlign: TextAlign.center,
                          style: AppTypography.metadata.copyWith(
                            color: active ? Colors.white : AppColors.bodyText,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
          Expanded(
            child: notifications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.notifications_off_outlined, size: 48, color: Color(0xFFA0AEC0)),
                        const SizedBox(height: 12),
                        Text('No notifications yet', style: AppTypography.cardTitle),
                        const SizedBox(height: 4),
                        Text('You will get notified when admin posts new tasks.', style: AppTypography.metadata),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                    itemCount: notifications.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.borderColor),
                    itemBuilder: (_, i) {
                      final n = notifications[i];
                      return InkWell(
                        onTap: () {
                          if (n.task != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => TaskDetailScreen(task: n.task!),
                              ),
                            );
                          }
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: n.iconBg,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Icon(n.icon, color: n.iconColor, size: 21),
                              ),
                              const SizedBox(width: 11),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      n.title,
                                      style: AppTypography.cardTitle.copyWith(
                                        fontSize: 13.5,
                                        fontWeight: n.isRead ? FontWeight.w600 : FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      n.description,
                                      style: AppTypography.metadata.copyWith(fontSize: 11.5),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 6),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    n.time,
                                    style: AppTypography.metadata.copyWith(fontSize: 10.5),
                                  ),
                                  if (!n.isRead) ...[
                                    const SizedBox(height: 6),
                                    Container(
                                      width: 7,
                                      height: 7,
                                      decoration: const BoxDecoration(
                                        color: AppColors.primaryBlue,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
