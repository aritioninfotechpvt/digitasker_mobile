import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

class TrainingScreen extends StatelessWidget {
  const TrainingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final modules = [
      {
        'title': '1. Field Audit Basics & GPS Rules',
        'desc': 'Learn how to capture location-verified storefront photos within 120 metres radius.',
        'duration': '10 mins',
        'status': 'Completed',
        'icon': Icons.location_on_outlined,
      },
      {
        'title': '2. Mystery Shopping & Rating Guidelines',
        'desc': 'Master 5-star Google review submissions and handle verification screenshot standards.',
        'duration': '15 mins',
        'status': 'In Progress',
        'icon': Icons.star_outline_rounded,
      },
      {
        'title': '3. Product Display & Shelf Verification',
        'desc': 'Guidelines for clear shelf photography, promotional banner capture and price checks.',
        'duration': '12 mins',
        'status': 'Not Started',
        'icon': Icons.camera_alt_outlined,
      },
      {
        'title': '4. QC Re-submission & Evidence Best Practices',
        'desc': 'Avoid rejection reasons SUB-4178 by attaching profile handles and high-resolution proofs.',
        'duration': '8 mins',
        'status': 'Not Started',
        'icon': Icons.verified_user_outlined,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Tasker Training Hub', style: AppTypography.screenTitle.copyWith(fontSize: 18)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1677FF), Color(0xFF0284C7)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Certified Tasker Program', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text('Complete training modules to unlock higher payout audits up to ₹500/task.', style: TextStyle(color: Colors.white.withOpacity(.9), fontSize: 12.5)),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                const Icon(Icons.school_rounded, color: Colors.white, size: 42),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Available Training Modules', style: AppTypography.sectionTitle.copyWith(fontSize: 16)),
          const SizedBox(height: 12),
          ...modules.map((m) {
            final isCompleted = m['status'] == 'Completed';
            final isInProgress = m['status'] == 'In Progress';
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isCompleted ? const Color(0xFFDCFCE7) : (isInProgress ? const Color(0xFFE0F2FE) : const Color(0xFFF1F5F9)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(m['icon'] as IconData, color: isCompleted ? const Color(0xFF15803D) : (isInProgress ? AppColors.primaryBlue : AppColors.darkNavy), size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(m['title'] as String, style: AppTypography.cardTitle.copyWith(fontSize: 14)),
                        const SizedBox(height: 3),
                        Text(m['desc'] as String, style: AppTypography.metadata.copyWith(fontSize: 11.5)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isCompleted ? const Color(0xFFDCFCE7) : (isInProgress ? const Color(0xFFFEF3C7) : const Color(0xFFF1F5F9)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      m['status'] as String,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isCompleted ? const Color(0xFF15803D) : (isInProgress ? const Color(0xFFD97706) : const Color(0xFF64748B)),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
