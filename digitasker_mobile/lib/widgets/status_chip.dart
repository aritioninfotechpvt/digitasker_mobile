import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

class StatusChip extends StatelessWidget {
  final String status;

  const StatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> config = _getChipConfig(status.toLowerCase());

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: config['bg'] as Color,
        borderRadius: BorderRadius.circular(AppSpacing.chipRadius),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: config['text'] as Color,
        ),
      ),
    );
  }

  Map<String, dynamic> _getChipConfig(String s) {
    if (s.contains('approved') || s.contains('paid') || s.contains('completed')) {
      return {'bg': AppColors.greenChipBg, 'text': AppColors.successGreen};
    } else if (s.contains('submitted') || s.contains('review')) {
      return {'bg': AppColors.purpleChipBg, 'text': AppColors.purple};
    } else if (s.contains('progress') || s.contains('revision')) {
      return {'bg': AppColors.orangeChipBg, 'text': AppColors.orange};
    } else if (s.contains('rejected') || s.contains('failed')) {
      return {'bg': AppColors.pinkChipBg, 'text': AppColors.errorRed};
    }
    return {'bg': AppColors.blueChipBg, 'text': AppColors.primaryBlue};
  }
}
