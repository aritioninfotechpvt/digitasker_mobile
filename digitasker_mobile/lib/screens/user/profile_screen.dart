import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../auth/login_screen.dart';
import 'find_tasks_screen.dart';
import 'my_tasks_screen.dart';
import 'notifications_screen.dart';
import 'wallet_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _cityController;
  late TextEditingController _upiController;
  late TextEditingController _bankAccountController;
  late TextEditingController _ifscController;

  bool _isEditing = false;
  String? _selectedAvatarUrl;

  void _showAvatarPickerModal(BuildContext context) {
    final sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Change Profile Photo', style: AppTypography.screenTitle.copyWith(fontSize: 18)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: const Color(0xFFEAF3FF), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.photo_camera_rounded, color: AppColors.primaryBlue),
              ),
              title: const Text('Take Photo with Camera', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: const Text('Capture new photo for KYC verification', style: TextStyle(fontSize: 11)),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _selectedAvatarUrl = sampleAvatars[0]);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Profile photo updated successfully!'), backgroundColor: AppColors.successGreen),
                );
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: const Color(0xFFE6F7F6), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.photo_library_rounded, color: Color(0xFF00B2A9)),
              ),
              title: const Text('Choose from Gallery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: const Text('Select image from device gallery', style: TextStyle(fontSize: 11)),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _selectedAvatarUrl = sampleAvatars[1]);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Profile photo updated successfully!'), backgroundColor: AppColors.successGreen),
                );
              },
            ),
            const SizedBox(height: 14),
            Text('Or Select Preset Avatar:', style: AppTypography.cardTitle.copyWith(fontSize: 13)),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: sampleAvatars.map((url) {
                return GestureDetector(
                  onTap: () {
                    Navigator.pop(ctx);
                    setState(() => _selectedAvatarUrl = url);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Preset avatar selected!'), backgroundColor: AppColors.successGreen),
                    );
                  },
                  child: CircleAvatar(
                    radius: 26,
                    backgroundImage: NetworkImage(url),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    _nameController = TextEditingController(text: user?.name ?? 'Rahul Sharma');
    _emailController = TextEditingController(text: user?.email ?? 'rahul.sharma@gmail.com');
    _phoneController = TextEditingController(text: user?.phone ?? '+91 7360002233');
    _cityController = TextEditingController(text: 'Zirakpur, Punjab');
    _upiController = TextEditingController(text: '7360002233@upi');
    _bankAccountController = TextEditingController(text: '9876543210123');
    _ifscController = TextEditingController(text: 'SBIN0004178');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    _upiController.dispose();
    _bankAccountController.dispose();
    _ifscController.dispose();
    super.dispose();
  }

  void _saveProfile() {
    if (_formKey.currentState?.validate() == true) {
      setState(() => _isEditing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile details updated successfully!'),
          backgroundColor: AppColors.successGreen,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('My Profile', style: AppTypography.screenTitle.copyWith(fontSize: 18)),
        actions: [
          IconButton(
            onPressed: () => setState(() => _isEditing = !_isEditing),
            icon: Icon(_isEditing ? Icons.close_rounded : Icons.edit_outlined, color: AppColors.primaryBlue),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Profile Card Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4))],
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => _showAvatarPickerModal(context),
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 36,
                          backgroundColor: const Color(0xFFE2E8F0),
                          child: ClipOval(
                            child: _selectedAvatarUrl != null
                                ? Image.network(
                                    _selectedAvatarUrl!,
                                    width: 72,
                                    height: 72,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Image.asset(
                                      'assets/ui/profile_avatar.png',
                                      width: 72,
                                      height: 72,
                                      fit: BoxFit.cover,
                                    ),
                                  )
                                : Image.asset(
                                    'assets/ui/profile_avatar.png',
                                    width: 72,
                                    height: 72,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Text(
                                      user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'R',
                                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
                                    ),
                                  ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: AppColors.primaryBlue,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? 'Rahul Sharma', style: AppTypography.cardTitle.copyWith(fontSize: 18)),
                        const SizedBox(height: 3),
                        Text(user?.email ?? 'rahul.sharma@gmail.com', style: AppTypography.metadata),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(6)),
                              child: const Row(
                                children: [
                                  Icon(Icons.verified_rounded, size: 12, color: Color(0xFF15803D)),
                                  SizedBox(width: 4),
                                  Text('KYC Verified', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
                              child: const Row(
                                children: [
                                  Icon(Icons.star_rounded, size: 12, color: Color(0xFFD97706)),
                                  SizedBox(width: 3),
                                  Text('4.9 Rating', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Personal Information Section
            _buildSectionCard(
              title: 'Personal Information',
              icon: Icons.person_outline_rounded,
              children: [
                _buildField('Full Name', _nameController, Icons.person_outline, enabled: _isEditing),
                const SizedBox(height: 12),
                _buildField('Email Address', _emailController, Icons.email_outlined, enabled: _isEditing),
                const SizedBox(height: 12),
                _buildField('Mobile Phone', _phoneController, Icons.phone_outlined, enabled: _isEditing),
                const SizedBox(height: 12),
                _buildField('City / Region', _cityController, Icons.location_city_outlined, enabled: _isEditing),
              ],
            ),
            const SizedBox(height: 16),

            // Payout & Bank Details Section
            _buildSectionCard(
              title: 'Payout & Bank Settings',
              icon: Icons.account_balance_rounded,
              children: [
                _buildField('UPI ID', _upiController, Icons.qr_code_rounded, enabled: _isEditing),
                const SizedBox(height: 12),
                _buildField('Bank Account Number', _bankAccountController, Icons.credit_card_rounded, enabled: _isEditing),
                const SizedBox(height: 12),
                _buildField('IFSC Code', _ifscController, Icons.account_balance_outlined, enabled: _isEditing),
              ],
            ),
            const SizedBox(height: 16),

            // Save Button when Editing
            if (_isEditing)
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _saveProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Save Profile Changes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),

            if (_isEditing) const SizedBox(height: 16),

            // Navigation Links
            _buildNavigationLinks(context, auth),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard({required String title, required IconData icon, required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primaryBlue, size: 20),
              const SizedBox(width: 8),
              Text(title, style: AppTypography.cardTitle.copyWith(fontSize: 15)),
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, IconData icon, {bool enabled = false}) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      style: AppTypography.body.copyWith(fontWeight: FontWeight.w600, color: AppColors.darkNavy),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20, color: const Color(0xFF64748B)),
        filled: true,
        fillColor: enabled ? Colors.white : const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        disabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFF1F5F9))),
      ),
    );
  }

  Widget _buildNavigationLinks(BuildContext context, AuthProvider auth) {
    final links = [
      (Icons.assignment_outlined, 'My Tasks (Completed & Review)', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MyTasksScreen()))),
      (Icons.account_balance_wallet_outlined, 'My Wallet & Withdrawals', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
      (Icons.notifications_none_rounded, 'Notifications & Alerts', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()))),
      (Icons.search_rounded, 'Find Tasks & Audits', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FindTasksScreen()))),
      (
        Icons.logout_rounded,
        'Logout Session',
        () async {
          await auth.logout();
          if (!context.mounted) return;
          Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false);
        }
      ),
    ];

    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        children: links.map((link) {
          final isLogout = link.$2.contains('Logout');
          return ListTile(
            leading: Icon(link.$1, color: isLogout ? AppColors.errorRed : AppColors.darkNavy, size: 20),
            title: Text(link.$2, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5, color: isLogout ? AppColors.errorRed : AppColors.darkNavy)),
            trailing: const Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF94A3B8)),
            onTap: link.$3 as VoidCallback,
          );
        }).toList(),
      ),
    );
  }
}
