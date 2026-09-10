import 'package:flutter/material.dart';
import '../models/wallet_model.dart';
import '../services/api_service.dart';

class WalletProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  WalletModel? _wallet;
  bool _isLoading = false;
  String? _errorMessage;

  WalletModel? get wallet => _wallet;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchWallet() async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _api.get('/user/wallet');
      _wallet = WalletModel.fromJson(res);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> requestWithdrawal(double amount, String bankDetails) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _api.post('/user/wallet/withdraw', {
        'amount': amount,
        'bank_details': bankDetails,
      });
      await fetchWallet();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
