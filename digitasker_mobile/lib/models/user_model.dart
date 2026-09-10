class UserModel {
  final int id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? avatar;
  final double walletBalance;
  final double rating;
  final bool isVerified;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.avatar,
    this.walletBalance = 0.0,
    this.rating = 4.9,
    this.isVerified = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final walletObj = json['wallet'];
    double bal = 0.0;
    if (walletObj is Map && walletObj.containsKey('balance')) {
      bal = double.tryParse(walletObj['balance']?.toString() ?? '0') ?? 0.0;
    } else if (json['wallet_balance'] != null) {
      bal = double.tryParse(json['wallet_balance'].toString()) ?? 0.0;
    }

    return UserModel(
      id: json['id'] is int ? json['id'] : (int.tryParse(json['id']?.toString() ?? '1') ?? 1),
      name: json['name']?.toString() ?? 'Rahul Sharma',
      email: json['email']?.toString() ?? 'rahul@digilitesstudio.com',
      role: json['role']?.toString() ?? 'user',
      phone: json['phone']?.toString() ?? '+91 7360002233',
      avatar: json['avatar']?.toString() ?? (json['profile'] is Map ? json['profile']['profile_image']?.toString() : null),
      walletBalance: bal,
      rating: json['rating'] != null ? (double.tryParse(json['rating'].toString()) ?? 4.9) : 4.9,
      isVerified: json['is_verified'] == 1 || json['is_verified'] == true || true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'phone': phone,
      'avatar': avatar,
      'wallet_balance': walletBalance,
      'rating': rating,
      'is_verified': isVerified,
    };
  }
}
