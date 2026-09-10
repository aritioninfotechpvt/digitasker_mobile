import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.person_outline_rounded, 'My Profile', ''),
      (Icons.badge_outlined, 'My Documents', 'Verified'),
      (Icons.history_rounded, 'Task History', ''),
      (Icons.account_balance_wallet_outlined, 'Payment Settings', ''),
      (Icons.notifications_none_rounded, 'Notifications', ''),
      (Icons.help_outline_rounded, 'Help & Support', ''),
      (Icons.info_outline_rounded, 'About', ''),
      (Icons.logout_rounded, 'Logout', ''),
    ];
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.settings_outlined))]),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
        children: [
          Center(child: Stack(children: [
            CircleAvatar(radius: 41, backgroundColor: const Color(0xFFE9EEF5), child: ClipOval(child: Image.asset('assets/ui/profile_avatar.png', width: 82, height: 82, fit: BoxFit.cover))),
            Positioned(right: 0, bottom: 0, child: Container(width: 24, height: 24, decoration: BoxDecoration(color: AppColors.primaryBlue, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)), child: const Icon(Icons.edit_rounded, color: Colors.white, size: 13))),
          ])),
          const SizedBox(height: 10),
          Center(child: Text('Rahul Sharma', style: AppTypography.sectionTitle)),
          Center(child: Text('Auditor since Jan 2026', style: AppTypography.metadata)),
          const SizedBox(height: 5),
          Center(child: Container(padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4), decoration: BoxDecoration(color: AppColors.blueChipBg, borderRadius: BorderRadius.circular(12)), child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.verified_rounded, color: AppColors.primaryBlue, size: 14), const SizedBox(width: 4), Text('Verified', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w800))]))),
          const SizedBox(height: 20),
          Row(children: [Expanded(child: _metric('48', 'Tasks')), Expanded(child: _metric('4.8', 'Rating')), Expanded(child: _metric('12', 'Badges'))]),
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.borderColor)),
            child: Column(children: items.map((e) => InkWell(
              onTap: () {},
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.borderColor))),
                child: Row(children: [Icon(e.$1, size: 20, color: AppColors.darkNavy), const SizedBox(width: 12), Expanded(child: Text(e.$2, style: AppTypography.body.copyWith(color: AppColors.darkNavy, fontWeight: FontWeight.w500))), if (e.$3.isNotEmpty) Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: AppColors.blueChipBg, borderRadius: BorderRadius.circular(10)), child: Text(e.$3, style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w700, fontSize: 10))), const SizedBox(width: 6), const Icon(Icons.chevron_right_rounded, color: AppColors.secondaryText, size: 18)]),
              ),
            )).toList()),
          ),
        ],
      ),
    );
  }

  Widget _metric(String value, String label) => Column(children: [Text(value, style: AppTypography.cardTitle.copyWith(fontSize: 18)), Text(label, style: AppTypography.metadata)]);
}
