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
    return UserModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'user',
      phone: json['phone']?.toString(),
      avatar: json['avatar']?.toString(),
      walletBalance: json['wallet_balance'] != null
          ? double.tryParse(json['wallet_balance'].toString()) ?? 0.0
          : 0.0,
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
