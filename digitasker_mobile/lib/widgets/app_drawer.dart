import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/user/find_tasks_screen.dart';
import '../screens/user/wallet_screen.dart';
import '../screens/user/notifications_screen.dart';
import '../screens/user/profile_screen.dart';
import '../screens/auth/login_screen.dart';
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
      (Icons.home_rounded, 'Home', 0),
      (Icons.assignment_outlined, 'My Tasks', 1),
      (Icons.account_balance_wallet_outlined, 'My Wallet', 2),
      (Icons.notifications_none_rounded, 'Notifications', 3),
      (Icons.person_outline_rounded, 'My Profile', 4),
      (Icons.group_add_outlined, 'Refer & Earn', 99),
      (Icons.help_outline_rounded, 'Help & Support', 98),
      (Icons.logout_rounded, 'Logout', 97),
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
                    onTabSelected!(4);
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
                          trailing: item.$2 == 'Notifications'
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
                              : const Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF94A3B8)),
                          onTap: () async {
                            Navigator.pop(context);

                            if (item.$3 == 97) {
                              // Logout
                              await auth.logout();
                              if (!context.mounted) return;
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(builder: (_) => const LoginScreen()),
                              );
                            } else if (item.$3 == 98) {
                              // Help Support
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Support Helpline: +91 7360002233 | support@digilitesstudio.com'),
                                  backgroundColor: AppColors.primaryBlue,
                                ),
                              );
                            } else if (item.$3 == 99) {
                              // Refer & Earn Modal
                              _showReferralDialog(context);
                            } else if (onTabSelected != null && item.$3 <= 4) {
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
      case 1:
        screen = const FindTasksScreen();
        break;
      case 2:
        screen = const WalletScreen();
        break;
      case 3:
        screen = const NotificationsScreen();
        break;
      case 4:
        screen = const ProfileScreen();
        break;
      default:
        return;
    }
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
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
