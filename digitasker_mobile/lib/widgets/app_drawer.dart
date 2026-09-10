import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class AppSideDrawer extends StatelessWidget {
  const AppSideDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.home_rounded, 'Home'),
      (Icons.assignment_outlined, 'My Tasks'),
      (Icons.account_balance_wallet_outlined, 'My Wallet'),
      (Icons.notifications_none_rounded, 'Notifications'),
      (Icons.chat_bubble_outline_rounded, 'Messages'),
      (Icons.group_add_outlined, 'Refer & Earn'),
      (Icons.settings_outlined, 'Settings'),
      (Icons.help_outline_rounded, 'Help & Support'),
    ];
    return Drawer(
      width: MediaQuery.of(context).size.width * .82,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.horizontal(right: Radius.circular(24))),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
          child: Column(children: [
            Row(children: [
              CircleAvatar(radius: 24, backgroundColor: const Color(0xFFE9EEF5), child: ClipOval(child: Image.asset('assets/ui/profile_avatar.png', width: 48, height: 48, fit: BoxFit.cover))),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Rahul Sharma', style: AppTypography.cardTitle), Text('View Profile', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w700))])),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close_rounded)),
            ]),
            const SizedBox(height: 16),
            ...List.generate(items.length, (i) {
              final active = i == 0;
              final e = items[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Container(
                  decoration: BoxDecoration(color: active ? AppColors.blueChipBg : Colors.transparent, borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    dense: true,
                    leading: Icon(e.$1, size: 20, color: active ? AppColors.primaryBlue : AppColors.darkNavy),
                    title: Text(e.$2, style: AppTypography.body.copyWith(color: active ? AppColors.primaryBlue : AppColors.darkNavy, fontWeight: active ? FontWeight.w700 : FontWeight.w500)),
                    trailing: e.$2 == 'Notifications' ? Container(width: 24, height: 24, alignment: Alignment.center, decoration: const BoxDecoration(color: AppColors.primaryBlue, shape: BoxShape.circle), child: const Text('3', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold))) : null,
                    onTap: () => Navigator.pop(context),
                  ),
                ),
              );
            }),
            const Spacer(),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFFF7FAFF), borderRadius: BorderRadius.circular(15), border: Border.all(color: AppColors.borderColor)),
              child: Row(children: [
                Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.orangeChipBg, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.card_giftcard_rounded, color: AppColors.orange)),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Refer Friends', style: AppTypography.cardTitle.copyWith(fontSize: 13)), Text('Earn Extra Rewards!', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue))])),
                const Icon(Icons.arrow_forward_rounded, color: AppColors.primaryBlue),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}
