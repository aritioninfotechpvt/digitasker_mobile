import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_typography.dart';
import '../../widgets/primary_button.dart';
import 'tasker_home_screen.dart';

class TaskSuccessScreen extends StatelessWidget {
  final double rewardAmount;

  const TaskSuccessScreen({super.key, this.rewardAmount = 250.0});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: AppColors.greenChipBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  size: 80,
                  color: AppColors.successGreen,
                ),
              ),
              const SizedBox(height: 28),
              Text(
                '✓ Task Submitted!',
                style: AppTypography.screenTitle,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Your submission is under review by Quality Control.',
                style: AppTypography.body,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Reward Summary Box
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                  border: Border.all(color: AppColors.borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Text('Expected Reward', style: TextStyle(color: AppColors.secondaryText, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(
                      '₹${rewardAmount.toStringAsFixed(0)}',
                      style: AppTypography.heroTitle.copyWith(color: AppColors.successGreen, fontSize: 36),
                    ),
                    const Divider(height: 24),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Estimated Verification', style: TextStyle(fontSize: 13, color: AppColors.bodyText)),
                        Text('Within 24 hours', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkNavy)),
                      ],
                    ),
                  ],
                ),
              ),
              const Spacer(),

              PrimaryButton(
                label: 'View My Tasks',
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const TaskerHomeScreen()),
                    (route) => false,
                  );
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
