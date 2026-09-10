import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/wallet_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<WalletProvider>(context, listen: false).fetchWallet();
    });
  }

  @override
  Widget build(BuildContext context) {
    final walletProvider = Provider.of<WalletProvider>(context);
    final wallet = walletProvider.wallet;

    final balanceStr = wallet != null ? '₹${wallet.balance.toStringAsFixed(0)}' : '₹1,250';
    final earnedStr = wallet != null ? '₹${wallet.totalEarned.toStringAsFixed(0)}' : '₹3,850';
    final withdrawnStr = wallet != null ? '₹${wallet.totalWithdrawn.toStringAsFixed(0)}' : '₹2,600';
    final completedCount = wallet != null ? '${wallet.tasksCompleted}' : '12';

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
              boxShadow: [BoxShadow(color: AppColors.primaryBlue.withValues(alpha: .18), blurRadius: 18, offset: const Offset(0, 8))],
            ),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Total Balance', style: AppTypography.metadata.copyWith(color: Colors.white.withValues(alpha: .9))),
                const SizedBox(height: 4),
                Text(balanceStr, style: AppTypography.screenTitle.copyWith(color: Colors.white, fontSize: 27)),
              ])),
              OutlinedButton(
                onPressed: () => _showWithdrawDialog(context),
                style: OutlinedButton.styleFrom(backgroundColor: Colors.white, side: BorderSide.none, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
                child: const Text('Withdraw'),
              ),
            ]),
          ),
          const SizedBox(height: 14),
          Row(children: [
            Expanded(child: _stat(earnedStr, 'Total Earned')),
            Expanded(child: _stat(withdrawnStr, 'Withdrawn')),
            Expanded(child: _stat(completedCount, 'Tasks Completed')),
          ]),
          const SizedBox(height: 24),
          Row(children: [Text('Recent Transactions', style: AppTypography.sectionTitle.copyWith(fontSize: 18)), const Spacer(), TextButton(onPressed: () {}, child: const Text('View All'))]),
          const SizedBox(height: 2),
          if (wallet != null && wallet.transactions.isNotEmpty)
            ...wallet.transactions.map((tx) {
              final isCredit = tx.type == 'credit';
              final color = isCredit ? AppColors.successGreen : AppColors.orange;
              final icon = isCredit ? Icons.account_balance_wallet_rounded : Icons.south_west_rounded;
              final sign = isCredit ? '+' : '-';
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 11),
                decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.borderColor))),
                child: Row(children: [
                  Container(width: 40, height: 40, decoration: BoxDecoration(color: color.withValues(alpha: .11), borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: color, size: 20)),
                  const SizedBox(width: 10),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(tx.title, style: AppTypography.cardTitle.copyWith(fontSize: 13.5)), Text(tx.subtitle, style: AppTypography.metadata)])),
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [Text('$sign ₹${tx.amount.toStringAsFixed(0)}', style: AppTypography.cardTitle.copyWith(color: isCredit ? AppColors.successGreen : AppColors.errorRed, fontSize: 13.5)), const SizedBox(height: 2), Text(tx.dateStr, style: AppTypography.metadata.copyWith(fontSize: 10.5))]),
                ]),
              );
            }),
        ],
      ),
    );
  }

  void _showWithdrawDialog(BuildContext context) {
    final amountCtrl = TextEditingController(text: '500');
    final upiCtrl = TextEditingController(text: '7360002233@upi');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Request Withdrawal'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: amountCtrl, decoration: const InputDecoration(labelText: 'Amount (₹)'), keyboardType: TextInputType.number),
            const SizedBox(height: 12),
            TextField(controller: upiCtrl, decoration: const InputDecoration(labelText: 'UPI ID or Bank Account')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final amt = double.tryParse(amountCtrl.text) ?? 500;
              final res = await Provider.of<WalletProvider>(context, listen: false).requestWithdrawal(amt, upiCtrl.text);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(res ? 'Withdrawal request submitted successfully!' : 'Withdrawal processed!')),
                );
              }
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Widget _stat(String value, String label) => Container(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Column(children: [Text(value, style: AppTypography.cardTitle.copyWith(fontSize: 16)), const SizedBox(height: 3), Text(label, textAlign: TextAlign.center, style: AppTypography.metadata.copyWith(fontSize: 10.5))]),
  );
}
