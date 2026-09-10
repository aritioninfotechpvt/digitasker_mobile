import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

class OfflineModeScreen extends StatefulWidget {
  const OfflineModeScreen({super.key});

  @override
  State<OfflineModeScreen> createState() => _OfflineModeScreenState();
}

class _OfflineModeScreenState extends State<OfflineModeScreen> {
  bool _isOfflineSyncEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Offline Audit Mode', style: AppTypography.screenTitle.copyWith(fontSize: 18)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.wifi_off_rounded, color: Color(0xFF047857), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Offline Submissions Active', style: AppTypography.cardTitle.copyWith(fontSize: 15)),
                      const SizedBox(height: 2),
                      Text('Audit evidence captured without internet will auto-sync when online.', style: AppTypography.metadata.copyWith(fontSize: 12)),
                    ],
                  ),
                ),
                Switch(
                  value: _isOfflineSyncEnabled,
                  onChanged: (val) => setState(() => _isOfflineSyncEnabled = val),
                  activeColor: AppColors.primaryBlue,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Local Draft Submissions (0 Pending)', style: AppTypography.sectionTitle.copyWith(fontSize: 16)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                const Icon(Icons.cloud_done_rounded, size: 48, color: Color(0xFF10B981)),
                const SizedBox(height: 10),
                Text('All Local Audits Synced!', style: AppTypography.cardTitle.copyWith(fontSize: 16)),
                const SizedBox(height: 4),
                Text('You have no pending offline evidence drafts in queue.', textAlign: TextAlign.center, style: AppTypography.metadata),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Checking connection and syncing offline drafts...')),
                    );
                  },
                  icon: const Icon(Icons.sync_rounded, size: 18),
                  label: const Text('Sync Offline Drafts Now'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
