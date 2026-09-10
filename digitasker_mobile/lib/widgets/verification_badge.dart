import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

class LocationVerificationBadge extends StatelessWidget {
  final bool isVerified;
  final int distanceMeters;

  const LocationVerificationBadge({
    super.key,
    required this.isVerified,
    this.distanceMeters = 120,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isVerified ? AppColors.greenChipBg : AppColors.orangeChipBg;
    final textCol = isVerified ? AppColors.successGreen : AppColors.orange;
    final icon = isVerified ? Icons.check_circle_rounded : Icons.warning_amber_rounded;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: textCol.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: textCol, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isVerified ? '✓ Location Verified' : 'Location Pending Check',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: textCol,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  isVerified
                      ? 'You are within $distanceMeters metres of the audit target'
                      : 'Acquiring high-accuracy GPS coordinates...',
                  style: TextStyle(
                    fontSize: 12,
                    color: textCol.withOpacity(0.85),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
