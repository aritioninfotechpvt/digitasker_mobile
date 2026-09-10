import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tx = [
      ('Task Payment', 'Store Audit - DMart', '+ ₹250', '09 Sep 2026', AppColors.successGreen, Icons.account_balance_wallet_rounded),
      ('Withdrawal', 'UPI Transfer', '- ₹1,000', '05 Sep 2026', AppColors.orange, Icons.south_west_rounded),
      ('Task Payment', 'Restaurant Audit', '+ ₹300', '03 Sep 2026', AppColors.successGreen, Icons.account_balance_wallet_rounded),
      ('Task Payment', 'Survey Task', '+ ₹100', '01 Sep 2026', AppColors.successGreen, Icons.account_balance_wallet_rounded),
    ];
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('My Wallet'), actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.qr_code_scanner_rounded))]),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1978FF), Color(0xFF005FEA)]),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [BoxShadow(color: AppColors.primaryBlue.withOpacity(.18), blurRadius: 18, offset: const Offset(0, 8))],
            ),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Total Balance', style: AppTypography.metadata.copyWith(color: Colors.white.withOpacity(.9))),
                const SizedBox(height: 4),
                Text('₹1,250', style: AppTypography.screenTitle.copyWith(color: Colors.white, fontSize: 27)),
              ])),
              OutlinedButton(onPressed: () {}, style: OutlinedButton.styleFrom(backgroundColor: Colors.white, side: BorderSide.none, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))), child: const Text('Withdraw')),
            ]),
          ),
          const SizedBox(height: 14),
          Row(children: [
            Expanded(child: _stat('₹3,850', 'Total Earned')),
            Expanded(child: _stat('₹2,600', 'Withdrawn')),
            Expanded(child: _stat('12', 'Tasks Completed')),
          ]),
          const SizedBox(height: 24),
          Row(children: [Text('Recent Transactions', style: AppTypography.sectionTitle.copyWith(fontSize: 18)), const Spacer(), TextButton(onPressed: () {}, child: const Text('View All'))]),
          const SizedBox(height: 2),
          ...tx.map((e) => Container(
            padding: const EdgeInsets.symmetric(vertical: 11),
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.borderColor))),
            child: Row(children: [
              Container(width: 40, height: 40, decoration: BoxDecoration(color: e.$5.withOpacity(.11), borderRadius: BorderRadius.circular(12)), child: Icon(e.$6, color: e.$5, size: 20)),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(e.$1, style: AppTypography.cardTitle.copyWith(fontSize: 13.5)), Text(e.$2, style: AppTypography.metadata)])),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [Text(e.$3, style: AppTypography.cardTitle.copyWith(color: e.$3.startsWith('+') ? AppColors.successGreen : AppColors.errorRed, fontSize: 13.5)), const SizedBox(height: 2), Text(e.$4, style: AppTypography.metadata.copyWith(fontSize: 10.5))]),
            ]),
          )),
        ],
      ),
    );
  }

  Widget _stat(String value, String label) => Container(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Column(children: [Text(value, style: AppTypography.cardTitle.copyWith(fontSize: 16)), const SizedBox(height: 3), Text(label, textAlign: TextAlign.center, style: AppTypography.metadata.copyWith(fontSize: 10.5))]),
  );
}
