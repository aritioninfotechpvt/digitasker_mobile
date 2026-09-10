import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../auth/login_screen.dart';
import 'notifications_screen.dart';
import 'wallet_screen.dart';
import 'find_tasks_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    final items = [
      (Icons.person_outline_rounded, 'My Profile', '', 1),
      (Icons.badge_outlined, 'My Documents', 'Verified', 2),
      (Icons.history_rounded, 'Task History', '', 3),
      (Icons.account_balance_wallet_outlined, 'Payment Settings', '', 4),
      (Icons.notifications_none_rounded, 'Notifications', '', 5),
      (Icons.help_outline_rounded, 'Help & Support', '', 6),
      (Icons.info_outline_rounded, 'About DigiLites Studio', '', 7),
      (Icons.logout_rounded, 'Logout', '', 8),
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.darkNavy)),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Settings & Privacy menu')),
              );
            },
            icon: const Icon(Icons.settings_outlined, color: AppColors.darkNavy),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
        children: [
          // Profile Avatar & Verification
          Center(
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 41,
                  backgroundColor: const Color(0xFFE9EEF5),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/ui/profile_avatar.png',
                      width: 82,
                      height: 82,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Text(
                        user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'R',
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: AppColors.primaryBlue,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(Icons.edit_rounded, color: Colors.white, size: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Center(child: Text(user?.name ?? 'Rahul Sharma', style: AppTypography.sectionTitle)),
          Center(child: Text('Auditor since Jan 2026', style: AppTypography.metadata)),
          const SizedBox(height: 5),
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.blueChipBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.verified_rounded, color: AppColors.primaryBlue, size: 14),
                  const SizedBox(width: 4),
                  Text('Verified', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Metrics
          Row(
            children: [
              Expanded(child: _metric('48', 'Tasks')),
              Expanded(child: _metric('4.8', 'Rating')),
              Expanded(child: _metric('12', 'Badges')),
            ],
          ),
          const SizedBox(height: 20),

          // Options List
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderColor),
            ),
            child: Column(
              children: items.map((e) {
                final isLogout = e.$4 == 8;
                return InkWell(
                  onTap: () async {
                    if (e.$4 == 8) {
                      // Logout
                      await auth.logout();
                      if (!context.mounted) return;
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    } else if (e.$4 == 5) {
                      // Notifications
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                      );
                    } else if (e.$4 == 4) {
                      // Wallet Settings
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const WalletScreen()),
                      );
                    } else if (e.$4 == 3) {
                      // Task History
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const FindTasksScreen()),
                      );
                    } else if (e.$4 == 6 || e.$4 == 7) {
                      // Support / About
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('DigiLites Studio Platform v1.0.0 | Support: +91 7360002233'),
                          backgroundColor: AppColors.primaryBlue,
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${e.$2} details opened')),
                      );
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: AppColors.borderColor)),
                    ),
                    child: Row(
                      children: [
                        Icon(e.$1, size: 20, color: isLogout ? AppColors.errorRed : AppColors.darkNavy),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            e.$2,
                            style: AppTypography.body.copyWith(
                              color: isLogout ? AppColors.errorRed : AppColors.darkNavy,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        if (e.$3.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.blueChipBg,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              e.$3,
                              style: AppTypography.metadata.copyWith(
                                color: AppColors.primaryBlue,
                                fontWeight: FontWeight.w700,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        const SizedBox(width: 6),
                        const Icon(Icons.chevron_right_rounded, color: AppColors.secondaryText, size: 18),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _metric(String value, String label) {
    return Column(
      children: [
        Text(value, style: AppTypography.cardTitle.copyWith(fontSize: 18)),
        Text(label, style: AppTypography.metadata),
      ],
    );
  }
}
