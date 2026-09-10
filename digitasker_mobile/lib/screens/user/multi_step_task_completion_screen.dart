import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/task_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_typography.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/verification_badge.dart';
import 'task_success_screen.dart';

class MultiStepTaskCompletionScreen extends StatefulWidget {
  final TaskModel task;

  const MultiStepTaskCompletionScreen({super.key, required this.task});

  @override
  State<MultiStepTaskCompletionScreen> createState() =>
      _MultiStepTaskCompletionScreenState();
}

class _MultiStepTaskCompletionScreenState
    extends State<MultiStepTaskCompletionScreen> {
  int _currentStep = 1;
  final ImagePicker _picker = ImagePicker();
  final List<XFile> _capturedImages = [];
  final TextEditingController _notesController = TextEditingController();

  Future<void> _capturePhoto() async {
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );
    if (photo != null) {
      setState(() => _capturedImages.add(photo));
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: Text(
          widget.task.title,
          style: const TextStyle(
            color: AppColors.darkNavy,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.darkNavy,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress Bar
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Step $_currentStep of 4',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                      Text(
                        _getStepTitle(_currentStep),
                        style: AppTypography.metadata,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: _currentStep / 4,
                    backgroundColor: AppColors.borderColor,
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(AppColors.primaryBlue),
                    minHeight: 4,
                  ),
                ],
              ),
            ),

            // Step Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
                child: _buildStepBody(),
              ),
            ),

            // Bottom Action Bar
            Container(
              padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.borderColor)),
              ),
              child: PrimaryButton(
                label: _currentStep == 4 ? 'Submit Audit →' : 'Next Step →',
                onPressed: () {
                  if (_currentStep < 4) {
                    setState(() => _currentStep++);
                  } else {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TaskSuccessScreen(
                          rewardAmount: widget.task.reward,
                        ),
                      ),
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getStepTitle(int step) {
    switch (step) {
      case 1:
        return 'Location Check-in';
      case 2:
        return 'Upload Evidence';
      case 3:
        return 'Questionnaire';
      case 4:
        return 'Review & Submit';
      default:
        return '';
    }
  }

  Widget _buildStepBody() {
    if (_currentStep == 1) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('STEP 1: Location Check-in', style: AppTypography.sectionTitle),
          const SizedBox(height: 12),
          const LocationVerificationBadge(isVerified: true, distanceMeters: 120),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
              border: Border.all(color: AppColors.borderColor),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Target Location Details',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                SizedBox(height: 6),
                Text('DMart Supermarket, Zirakpur Bypass Road'),
                SizedBox(height: 4),
                Text(
                  'Coordinates: 30.6425° N, 76.8173° E',
                  style: TextStyle(fontSize: 12, color: AppColors.secondaryText),
                ),
              ],
            ),
          ),
        ],
      );
    } else if (_currentStep == 2) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('STEP 2: Upload Evidence', style: AppTypography.sectionTitle),
          const SizedBox(height: 12),
          const Text('Store Front Photo (Required)'),
          const SizedBox(height: 8),

          _capturedImages.isEmpty
              ? GestureDetector(
                  onTap: _capturePhoto,
                  child: Container(
                    height: 140,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderColor),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_a_photo_outlined,
                            size: 36, color: AppColors.primaryBlue),
                        SizedBox(height: 8),
                        Text(
                          'Tap to Capture Store Front Photo',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                )
              : SizedBox(
                  height: 110,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _capturedImages.length,
                    itemBuilder: (ctx, i) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 10.0),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            File(_capturedImages[i].path),
                            width: 110,
                            height: 110,
                            fit: BoxFit.cover,
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ],
      );
    } else if (_currentStep == 3) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('STEP 3: Questionnaire', style: AppTypography.sectionTitle),
          const SizedBox(height: 16),
          const Text('1. Is the store entrance clean and well lit?'),
          const SizedBox(height: 8),
          const Row(
            children: [
              ChoiceChip(selected: true, label: Text('Yes')),
              SizedBox(width: 8),
              ChoiceChip(selected: false, label: Text('No')),
            ],
          ),
          const SizedBox(height: 20),
          const Text('2. Were brand promotional banners clearly displayed?'),
          const SizedBox(height: 8),
          const Row(
            children: [
              ChoiceChip(selected: true, label: Text('Yes')),
              SizedBox(width: 8),
              ChoiceChip(selected: false, label: Text('No')),
            ],
          ),
        ],
      );
    } else {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('STEP 4: Review & Submit', style: AppTypography.sectionTitle),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Audit Summary',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Task: ${widget.task.title}'),
                Text('Target: ${widget.task.storeName}'),
                const Text('Location: Verified GPS (120m)'),
                Text('Reward: ₹${widget.task.reward.toStringAsFixed(0)}'),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Audit Notes (Optional)',
                    hintText: 'Enter any additional observations...',
                  ),
                  maxLines: 2,
                ),
              ],
            ),
          ),
        ],
      );
    }
  }
}
