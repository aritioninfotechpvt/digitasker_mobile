import 'package:flutter/material.dart';
import '../models/task_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import 'animated_press.dart';
import 'status_chip.dart';

class TaskCard extends StatefulWidget {
  final TaskModel task;
  final VoidCallback onTap;

  const TaskCard({
    super.key,
    required this.task,
    required this.onTap,
  });

  @override
  State<TaskCard> createState() => _TaskCardState();
}

class _TaskCardState extends State<TaskCard> {
  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    final task = widget.task;

    return AnimatedPress(
      onTap: widget.onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
          border: Border.all(color: AppColors.borderColor, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.cardPadding),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Store Photography Thumbnail (80 x 80px)
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: 80,
                    height: 80,
                    color: const Color(0xFFEFF6FF),
                    child: task.imageUrl.isNotEmpty
                        ? Image.network(
                            task.imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(
                              Icons.storefront_rounded,
                              size: 40,
                              color: AppColors.primaryBlue,
                            ),
                          )
                        : const Icon(
                            Icons.storefront_rounded,
                            size: 40,
                            color: AppColors.primaryBlue,
                          ),
                  ),
                ),
                const SizedBox(width: 14),

                // Details Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              task.title,
                              style: AppTypography.cardTitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              setState(() => _isFavorite = !_isFavorite);
                            },
                            child: Icon(
                              _isFavorite
                                  ? Icons.favorite_rounded
                                  : Icons.favorite_border_rounded,
                              size: 20,
                              color: _isFavorite
                                  ? AppColors.errorRed
                                  : AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        task.storeName,
                        style: AppTypography.metadata,
                      ),
                      const SizedBox(height: 8),

                      // Location & Reward Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.location_on_rounded,
                                size: 14,
                                color: AppColors.primaryBlue,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                task.distance,
                                style: AppTypography.metadata.copyWith(
                                  color: AppColors.darkNavy,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '₹${task.reward.toStringAsFixed(0)}',
                            style: AppTypography.money,
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Status Chips
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: task.tags.map((tag) => StatusChip(status: tag)).toList(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
