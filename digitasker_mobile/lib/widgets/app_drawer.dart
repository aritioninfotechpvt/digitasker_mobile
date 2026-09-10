import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/user/find_tasks_screen.dart';
import '../screens/user/my_tasks_screen.dart';
import '../screens/user/notifications_screen.dart';
import '../screens/user/offline_mode_screen.dart';
import '../screens/user/profile_screen.dart';
import '../screens/user/tasker_home_screen.dart';
import '../screens/user/training_screen.dart';
import '../screens/user/wallet_screen.dart';
import '../screens/vendor/vendor_dashboard_screen.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class AppSideDrawer extends StatelessWidget {
  final Function(int)? onTabSelected;

  const AppSideDrawer({super.key, this.onTabSelected});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    final items = [
      (Icons.dashboard_rounded, 'Dashboard', 0),
      (Icons.search_rounded, 'Find Tasks', 1),
      (Icons.assignment_outlined, 'My Tasks', 2),
      (Icons.school_outlined, 'Training', 3),
      (Icons.wifi_off_rounded, 'Offline Mode', 4),
      (Icons.account_balance_wallet_outlined, 'Wallet', 5),
      (Icons.notifications_none_rounded, 'Notifications', 6),
      (Icons.person_outline_rounded, 'Profile', 7),
      (Icons.storefront_rounded, 'Vendor Dashboard', 8),
      (Icons.dark_mode_outlined, 'Dark Mode', 96),
      (Icons.group_add_outlined, 'Refer & Earn', 99),
      (Icons.help_outline_rounded, 'Support', 98),
      (Icons.logout_rounded, 'Sign Out', 97),
    ];

    return Drawer(
      width: MediaQuery.of(context).size.width * .82,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
          child: Column(
            children: [
              // User Profile Header Box
              InkWell(
                onTap: () {
                  Navigator.pop(context);
                  if (onTabSelected != null) {
                    onTabSelected!(7);
                  } else {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ProfileScreen()),
                    );
                  }
                },
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: const Color(0xFFE9EEF5),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/ui/profile_avatar.png',
                            width: 48,
                            height: 48,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Text(
                              user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'R',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.name ?? 'Rahul Sharma',
                              style: AppTypography.cardTitle,
                            ),
                            Text(
                              'View Profile',
                              style: AppTypography.metadata.copyWith(
                                color: AppColors.primaryBlue,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Drawer Menu Items
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: List.generate(items.length, (i) {
                    final item = items[i];
                    final isLogout = item.$3 == 97;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          dense: true,
                          leading: Icon(
                            item.$1,
                            size: 20,
                            color: isLogout ? AppColors.errorRed : AppColors.darkNavy,
                          ),
                          title: Text(
                            item.$2,
                            style: AppTypography.body.copyWith(
                              color: isLogout ? AppColors.errorRed : AppColors.darkNavy,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          trailing: item.$3 == 96
                              ? Consumer<ThemeProvider>(
                                  builder: (ctx, themeProv, _) => SizedBox(
                                    height: 24,
                                    child: Switch(
                                      value: themeProv.isDarkMode,
                                      activeColor: AppColors.primaryBlue,
                                      onChanged: (val) => themeProv.toggleTheme(val),
                                    ),
                                  ),
                                )
                              : (item.$2 == 'Notifications'
                                  ? Container(
                                      width: 24,
                                      height: 24,
                                      alignment: Alignment.center,
                                      decoration: const BoxDecoration(
                                        color: AppColors.primaryBlue,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Text(
                                        '3',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    )
                                  : const Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF94A3B8))),
                          onTap: () async {
                            if (item.$3 == 96) {
                              final themeProv = Provider.of<ThemeProvider>(context, listen: false);
                              themeProv.toggleTheme(!themeProv.isDarkMode);
                              return;
                            }

                            Navigator.pop(context);

                            if (item.$3 == 97) {
                              // Sign Out
                              await auth.logout();
                              if (!context.mounted) return;
                              Navigator.pushAndRemoveUntil(
                                context,
                                MaterialPageRoute(builder: (_) => const LoginScreen()),
                                (route) => false,
                              );
                            } else if (item.$3 == 98) {
                              // Help Support
                              _showHelpSupportDialog(context);
                            } else if (item.$3 == 99) {
                              // Refer & Earn Modal
                              _showReferralDialog(context);
                            } else if (onTabSelected != null && item.$3 <= 7) {
                              onTabSelected!(item.$3);
                            } else {
                              _navigateToScreen(context, item.$3);
                            }
                          },
                        ),
                      ),
                    );
                  }),
                ),
              ),

              // Bottom Referral Card
              GestureDetector(
                onTap: () {
                  Navigator.pop(context);
                  _showReferralDialog(context);
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7FAFF),
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(color: AppColors.borderColor),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.orangeChipBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.card_giftcard_rounded, color: AppColors.orange),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Refer Friends',
                              style: AppTypography.cardTitle.copyWith(fontSize: 13),
                            ),
                            Text(
                              'Earn Extra Rewards!',
                              style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_rounded, color: AppColors.primaryBlue),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToScreen(BuildContext context, int index) {
    Widget screen;
    switch (index) {
      case 0:
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const TaskerHomeScreen()),
          (route) => false,
        );
        return;
      case 1:
        screen = const FindTasksScreen();
        break;
      case 2:
        screen = const MyTasksScreen();
        break;
      case 3:
        screen = const TrainingScreen();
        break;
      case 4:
        screen = const OfflineModeScreen();
        break;
      case 5:
        screen = const WalletScreen();
        break;
      case 6:
        screen = const NotificationsScreen();
        break;
      case 7:
        screen = const ProfileScreen();
        break;
      case 8:
        screen = const VendorDashboardScreen();
        break;
      default:
        return;
    }
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  void _showHelpSupportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.support_agent_rounded, color: AppColors.primaryBlue),
            const SizedBox(width: 8),
            Text('Support & Help Desk', style: AppTypography.cardTitle),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Need assistance with your audits, payments, or account?', style: TextStyle(fontSize: 13, color: AppColors.bodyText)),
            SizedBox(height: 16),
            Row(
              children: [
                Icon(Icons.phone_in_talk_rounded, color: AppColors.primaryBlue, size: 20),
                SizedBox(width: 10),
                SelectableText('+91 7360002233', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.darkNavy)),
              ],
            ),
            SizedBox(height: 10),
            Row(
              children: [
                Icon(Icons.email_outlined, color: AppColors.primaryBlue, size: 20),
                SizedBox(width: 10),
                SelectableText('support@digilitesstudio.com', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5, color: AppColors.primaryBlue)),
              ],
            ),
            SizedBox(height: 12),
            Text('Hours: Mon - Sat (9:00 AM - 7:00 PM IST)', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Support phone number copied: +91 7360002233')),
              );
            },
            child: const Text('Copy Helpline'),
          ),
        ],
      ),
    );
  }

  void _showReferralDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.card_giftcard_rounded, color: AppColors.orange),
              const SizedBox(width: 8),
              Text('Refer & Earn', style: AppTypography.cardTitle),
            ],
          ),
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Share your referral code with friends and earn ₹50 bonus for every verified task they complete!',
                style: TextStyle(fontSize: 14, color: AppColors.bodyText),
              ),
              SizedBox(height: 16),
              SelectableText(
                'CODE: DIGI73600',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryBlue,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Referral link copied to clipboard!')),
                );
              },
              child: const Text('Copy Link'),
            ),
          ],
        );
      },
    );
  }
}
