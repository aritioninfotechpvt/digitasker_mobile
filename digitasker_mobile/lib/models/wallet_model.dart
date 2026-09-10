class WalletModel {
  final double balance;
  final double totalEarned;
  final double totalWithdrawn;
  final int tasksCompleted;
  final List<TransactionModel> transactions;

  WalletModel({
    required this.balance,
    required this.totalEarned,
    required this.totalWithdrawn,
    required this.tasksCompleted,
    required this.transactions,
  });

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    var rawTxns = json['transactions'] as List? ?? [];
    List<TransactionModel> txList =
        rawTxns.map((t) => TransactionModel.fromJson(t)).toList();

    if (txList.isEmpty) {
      txList = [
        TransactionModel(
          id: 1,
          title: 'Task Payment - Store Audit',
          subtitle: 'Store Audit - DMart',
          amount: 250.0,
          type: 'credit',
          dateStr: '09 Sep 2026',
        ),
        TransactionModel(
          id: 2,
          title: 'Withdrawal',
          subtitle: 'UPI Transfer',
          amount: 1000.0,
          type: 'debit',
          dateStr: '05 Sep 2026',
        ),
        TransactionModel(
          id: 3,
          title: 'Task Payment',
          subtitle: 'Restaurant Audit',
          amount: 300.0,
          type: 'credit',
          dateStr: '03 Sep 2026',
        ),
        TransactionModel(
          id: 4,
          title: 'Task Payment',
          subtitle: 'Survey Task',
          amount: 100.0,
          type: 'credit',
          dateStr: '01 Sep 2026',
        ),
      ];
    }

    return WalletModel(
      balance: double.tryParse(json['balance']?.toString() ?? '1250') ?? 1250.0,
      totalEarned: double.tryParse(json['total_earned']?.toString() ?? '3850') ?? 3850.0,
      totalWithdrawn: double.tryParse(json['total_withdrawn']?.toString() ?? '2600') ?? 2600.0,
      tasksCompleted: json['tasks_completed'] is int ? json['tasks_completed'] : 12,
      transactions: txList,
    );
  }
}

class TransactionModel {
  final int id;
  final String title;
  final String subtitle;
  final double amount;
  final String type; // 'credit' or 'debit'
  final String dateStr;

  TransactionModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.type,
    required this.dateStr,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      title: json['title'] ?? 'Task Payment',
      subtitle: json['subtitle'] ?? json['description'] ?? 'Store Audit',
      amount: double.tryParse(json['amount'].toString()) ?? 0.0,
      type: json['type'] ?? 'credit',
      dateStr: json['date'] ?? json['created_at'] ?? '09 Sep 2026',
    );
  }
}
