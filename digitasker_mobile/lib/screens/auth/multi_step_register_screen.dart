import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_typography.dart';
import '../../widgets/primary_button.dart';
import '../user/tasker_home_screen.dart';

class MultiStepRegisterScreen extends StatefulWidget {
  const MultiStepRegisterScreen({super.key});

  @override
  State<MultiStepRegisterScreen> createState() => _MultiStepRegisterScreenState();
}

class _MultiStepRegisterScreenState extends State<MultiStepRegisterScreen> {
  int _currentStep = 1;

  // Step 1 Controllers
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController(text: '+91 7360002233');
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  // Step 2 Fields
  String _selectedCity = 'Zirakpur';
  String _selectedGender = 'Male';
  String _selectedAgeGroup = '25-34';
  String _selectedOccupation = 'Auditor / Field Professional';

  // Step 3 Selected Categories
  final List<String> _selectedCategories = ['Store Audit', 'Product Check'];

  final _formKey = GlobalKey<FormState>();

  Future<void> _handleRegister() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.register(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text.isEmpty ? 'password123' : _passwordController.text,
      role: 'user',
      phone: _mobileController.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const TaskerHomeScreen()),
        (route) => false,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Registration failed'),
          backgroundColor: AppColors.errorRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Create Free Account'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.darkNavy,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress Indicator Header
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Step $_currentStep of 3',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                      Text(
                        _currentStep == 1
                            ? 'Contact Info'
                            : (_currentStep == 2 ? 'Demographics' : 'Preferences'),
                        style: AppTypography.metadata,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: _currentStep / 3,
                    backgroundColor: AppColors.borderColor,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryBlue),
                    minHeight: 4,
                  ),
                ],
              ),
            ),

            // Form Body
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
                child: Form(
                  key: _formKey,
                  child: _buildStepContent(),
                ),
              ),
            ),

            // Navigation Buttons
            Container(
              padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.borderColor)),
              ),
              child: PrimaryButton(
                label: _currentStep == 3 ? 'Create Free Account' : 'Continue →',
                isLoading: auth.isLoading,
                onPressed: () {
                  if (_currentStep < 3) {
                    if (_currentStep == 1 && !_formKey.currentState!.validate()) return;
                    setState(() => _currentStep++);
                  } else {
                    _handleRegister();
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    if (_currentStep == 1) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Personal & Contact Info', style: AppTypography.sectionTitle),
          const SizedBox(height: 4),
          Text('Enter your primary contact details to get started.', style: AppTypography.body),
          const SizedBox(height: 24),
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Full Name',
              prefixIcon: Icon(Icons.person_outline_rounded),
            ),
            validator: (val) => val == null || val.isEmpty ? 'Enter full name' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _mobileController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Mobile Phone Number',
              prefixIcon: Icon(Icons.phone_outlined),
            ),
            validator: (val) => val == null || val.isEmpty ? 'Enter mobile number' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email Address',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            validator: (val) => val == null || val.isEmpty ? 'Enter email address' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passwordController,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Password',
              prefixIcon: Icon(Icons.lock_outline_rounded),
            ),
          ),
        ],
      );
    } else if (_currentStep == 2) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Demographics & Profile', style: AppTypography.sectionTitle),
          const SizedBox(height: 4),
          Text('Helps us match relevant nearby tasks to your location.', style: AppTypography.body),
          const SizedBox(height: 24),
          DropdownButtonFormField<String>(
            value: _selectedCity,
            decoration: const InputDecoration(
              labelText: 'City',
              prefixIcon: Icon(Icons.location_city_rounded),
            ),
            items: const [
              DropdownMenuItem(value: 'Zirakpur', child: Text('Zirakpur, Punjab')),
              DropdownMenuItem(value: 'Chandigarh', child: Text('Chandigarh')),
              DropdownMenuItem(value: 'Delhi NCR', child: Text('Delhi NCR')),
              DropdownMenuItem(value: 'Mumbai', child: Text('Mumbai')),
              DropdownMenuItem(value: 'Bangalore', child: Text('Bangalore')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _selectedCity = val);
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _selectedGender,
            decoration: const InputDecoration(
              labelText: 'Gender',
              prefixIcon: Icon(Icons.people_outline_rounded),
            ),
            items: const [
              DropdownMenuItem(value: 'Male', child: Text('Male')),
              DropdownMenuItem(value: 'Female', child: Text('Female')),
              DropdownMenuItem(value: 'Other', child: Text('Other')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _selectedGender = val);
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _selectedAgeGroup,
            decoration: const InputDecoration(
              labelText: 'Age Group',
              prefixIcon: Icon(Icons.cake_outlined),
            ),
            items: const [
              DropdownMenuItem(value: '18-24', child: Text('18-24 years')),
              DropdownMenuItem(value: '25-34', child: Text('25-34 years')),
              DropdownMenuItem(value: '35-44', child: Text('35-44 years')),
              DropdownMenuItem(value: '45+', child: Text('45+ years')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _selectedAgeGroup = val);
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _selectedOccupation,
            decoration: const InputDecoration(
              labelText: 'Occupation',
              prefixIcon: Icon(Icons.work_outline_rounded),
            ),
            items: const [
              DropdownMenuItem(value: 'Auditor / Field Professional', child: Text('Auditor / Field Professional')),
              DropdownMenuItem(value: 'Freelancer / Gig Worker', child: Text('Freelancer / Gig Worker')),
              DropdownMenuItem(value: 'Student', child: Text('Student')),
              DropdownMenuItem(value: 'Other', child: Text('Other')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _selectedOccupation = val);
            },
          ),
        ],
      );
    } else {
      final List<String> categories = [
        'Store Audit',
        'Shopping Tasks',
        'Surveys',
        'Product Check',
        'Photo Tasks',
        'Visit & Review',
        'Special Campaigns',
      ];

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Interests & Categories', style: AppTypography.sectionTitle),
          const SizedBox(height: 4),
          Text('Select task categories you prefer to perform.', style: AppTypography.body),
          const SizedBox(height: 24),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: categories.map((cat) {
              final isSelected = _selectedCategories.contains(cat);
              return FilterChip(
                selected: isSelected,
                label: Text(cat),
                selectedColor: AppColors.primaryBlue,
                backgroundColor: Colors.white,
                checkmarkColor: Colors.white,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.darkNavy,
                  fontWeight: FontWeight.w600,
                ),
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedCategories.add(cat);
                    } else {
                      _selectedCategories.remove(cat);
                    }
                  });
                },
              );
            }).toList(),
          ),
        ],
      );
    }
  }
}
