import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/task_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import 'task_success_screen.dart';

class SubmitEvidenceScreen extends StatefulWidget {
  final TaskModel task;
  const SubmitEvidenceScreen({super.key, required this.task});
  @override
  State<SubmitEvidenceScreen> createState() => _SubmitEvidenceScreenState();
}

class _SubmitEvidenceScreenState extends State<SubmitEvidenceScreen> {
  final notes = TextEditingController();
  final List<XFile> photos = [];
  int step = 0;

  Future<void> capturePhoto() async {
    final file = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 80);
    if (file != null) setState(() => photos.add(file));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Submit Task'),
        actions: [TextButton(onPressed: () {}, child: const Text('Save Draft'))],
      ),
      body: Column(children: [
        _progress(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Store Front Photo', style: AppTypography.cardTitle),
              const SizedBox(height: 10),
              ClipRRect(borderRadius: BorderRadius.circular(14), child: Image.asset('assets/ui/store_dmart.png', width: double.infinity, height: 145, fit: BoxFit.cover)),
              const SizedBox(height: 10),
              SizedBox(width: double.infinity, child: OutlinedButton.icon(onPressed: capturePhoto, icon: const Icon(Icons.camera_alt_outlined), label: Text(photos.isEmpty ? 'Add More Photos' : '${photos.length} Photo(s) Added'), style: OutlinedButton.styleFrom(foregroundColor: AppColors.primaryBlue, side: const BorderSide(color: AppColors.borderColor), padding: const EdgeInsets.symmetric(vertical: 13), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(13))))),
              const SizedBox(height: 20),
              Text('Notes (Optional)', style: AppTypography.cardTitle),
              const SizedBox(height: 8),
              TextField(controller: notes, maxLines: 5, decoration: const InputDecoration(hintText: 'Write any additional notes here...')),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: AppColors.surfaceBlue, borderRadius: BorderRadius.circular(14)),
                child: Row(children: [const Icon(Icons.location_on_rounded, color: AppColors.primaryBlue), const SizedBox(width: 10), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Location Verified', style: AppTypography.cardTitle.copyWith(fontSize: 13)), Text('You are within the allowed task radius', style: AppTypography.metadata)])), const Icon(Icons.verified_rounded, color: AppColors.successGreen)]),
              ),
            ]),
          ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
          decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.borderColor))),
          child: SafeArea(top: false, child: SizedBox(width: double.infinity, height: 52, child: ElevatedButton(onPressed: () {
            if (step < 3) {
              setState(() => step++);
            } else {
              Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => TaskSuccessScreen(rewardAmount: widget.task.reward)));
            }
          }, child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text(step == 3 ? 'Submit Task' : 'Next'), const SizedBox(width: 8), const Icon(Icons.arrow_forward_rounded, size: 19)])))),
        ),
      ]),
    );
  }

  Widget _progress() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 8, 18, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Step ${step + 1} of 4',
            style: AppTypography.metadata.copyWith(
              color: AppColors.darkNavy,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(
              4,
              (i) => Expanded(
                child: Container(
                  height: 4,
                  margin: EdgeInsets.only(right: i == 3 ? 0 : 5),
                  decoration: BoxDecoration(
                    color: i <= step
                        ? AppColors.cyan
                        : const Color(0xFFE7ECF3),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

}
