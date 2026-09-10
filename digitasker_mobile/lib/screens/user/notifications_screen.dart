import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  int selected = 0;

  @override
  Widget build(BuildContext context) {
    final notes = [
      (Icons.location_on_rounded, 'New Task Nearby', 'Retail store audit available near you.', '2m', AppColors.primaryBlue, AppColors.blueChipBg),
      (Icons.verified_rounded, 'Payment Received', '₹250 credited to your wallet.', '1h', AppColors.successGreen, AppColors.greenChipBg),
      (Icons.check_circle_rounded, 'Task Approved', "Your Domino's audit has been approved.", '3h', AppColors.orange, AppColors.orangeChipBg),
      (Icons.quiz_rounded, 'New Survey', 'Share your opinion and earn ₹100.', '5h', AppColors.cyan, const Color(0xFFE8F7FE)),
      (Icons.card_giftcard_rounded, 'Special Campaign', 'Participate in weekend campaign.', '1d', AppColors.errorRed, const Color(0xFFFFECEC)),
      (Icons.account_balance_wallet_rounded, 'Withdrawal Successful', '₹1,000 transferred to your bank.', '2d', AppColors.orange, AppColors.orangeChipBg),
    ];
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Notifications'), actions: [TextButton(onPressed: () {}, child: const Text('Mark all read'))]),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
          child: Row(children: List.generate(4, (i) {
            final labels = ['All', 'Tasks', 'Payments', 'Updates'];
            final active = selected == i;
            return Expanded(child: Padding(padding: EdgeInsets.only(right: i == 3 ? 0 : 6), child: GestureDetector(onTap: () => setState(() => selected = i), child: Container(padding: const EdgeInsets.symmetric(vertical: 10), decoration: BoxDecoration(color: active ? AppColors.primaryBlue : const Color(0xFFF3F6FA), borderRadius: BorderRadius.circular(16)), child: Text(labels[i], textAlign: TextAlign.center, style: AppTypography.metadata.copyWith(color: active ? Colors.white : AppColors.bodyText, fontWeight: FontWeight.w700))))));
          })),
        ),
        Expanded(child: ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
          itemCount: notes.length,
          separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.borderColor),
          itemBuilder: (_, i) {
            final n = notes[i];
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(width: 42, height: 42, decoration: BoxDecoration(color: n.$6, borderRadius: BorderRadius.circular(14)), child: Icon(n.$1, color: n.$5, size: 21)),
                const SizedBox(width: 11),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(n.$2, style: AppTypography.cardTitle.copyWith(fontSize: 13.5)), const SizedBox(height: 3), Text(n.$3, style: AppTypography.metadata.copyWith(fontSize: 11.5))])),
                Text(n.$4, style: AppTypography.metadata.copyWith(fontSize: 10.5)),
              ]),
            );
          },
        )),
      ]),
    );
  }
}
