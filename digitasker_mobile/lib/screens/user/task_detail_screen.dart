import 'package:flutter/material.dart';
import '../../models/task_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import 'submit_evidence_screen.dart';

class TaskDetailScreen extends StatefulWidget {
  final TaskModel task;
  const TaskDetailScreen({super.key, required this.task});
  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  int tab = 0;

  @override
  Widget build(BuildContext context) {
    final t = widget.task;
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(children: [
          Expanded(
            child: CustomScrollView(slivers: [
              SliverToBoxAdapter(child: _hero(context, t)),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 24),
                sliver: SliverList(delegate: SliverChildListDelegate([
                  Row(children: [
                    Container(width: 50, height: 50, decoration: BoxDecoration(color: AppColors.greenChipBg, borderRadius: BorderRadius.circular(15)), child: const Icon(Icons.storefront_rounded, color: AppColors.successGreen)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(t.title, style: AppTypography.sectionTitle), Text(t.storeName, style: AppTypography.metadata)])),
                    Text('₹${t.reward.toStringAsFixed(0)}', style: AppTypography.money.copyWith(fontSize: 23)),
                  ]),
                  const SizedBox(height: 14),
                  Row(children: [
                    _meta(Icons.location_on_outlined, t.distance),
                    const SizedBox(width: 18),
                    _meta(Icons.schedule_outlined, t.duration),
                    const SizedBox(width: 18),
                    _meta(Icons.store_mall_directory_outlined, t.locationType),
                  ]),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(color: const Color(0xFFF4F6F9), borderRadius: BorderRadius.circular(15)),
                    child: Row(children: List.generate(3, (i) {
                      final labels = ['Details', 'Instructions', 'Requirements'];
                      final active = tab == i;
                      return Expanded(child: GestureDetector(onTap: () => setState(() => tab = i), child: Container(padding: const EdgeInsets.symmetric(vertical: 10), decoration: BoxDecoration(color: active ? Colors.white : Colors.transparent, borderRadius: BorderRadius.circular(12), boxShadow: active ? [BoxShadow(color: AppColors.darkNavy.withOpacity(.04), blurRadius: 10)] : []), child: Text(labels[i], textAlign: TextAlign.center, style: AppTypography.metadata.copyWith(color: active ? AppColors.primaryBlue : AppColors.bodyText, fontWeight: FontWeight.w700)))));
                    })),
                  ),
                  const SizedBox(height: 22),
                  if (tab == 0) ...[
                    Text('Task Overview', style: AppTypography.sectionTitle.copyWith(fontSize: 18)),
                    const SizedBox(height: 8),
                    Text(t.description, style: AppTypography.body),
                    const SizedBox(height: 18),
                    _requirement(Icons.camera_alt_outlined, 'Take store photos'),
                    _requirement(Icons.inventory_2_outlined, 'Check product availability'),
                    _requirement(Icons.quiz_outlined, 'Answer a few questions'),
                    _requirement(Icons.verified_outlined, 'Submit and earn ₹${t.reward.toStringAsFixed(0)}'),
                  ] else if (tab == 1) ...[
                    Text('Before You Start', style: AppTypography.sectionTitle.copyWith(fontSize: 18)),
                    const SizedBox(height: 10),
                    _bullet('Reach the assigned store during the specified task window.'),
                    _bullet('Do not reveal that you are completing an audit.'),
                    _bullet('Capture clear, original photos from your device camera.'),
                    _bullet('Answer every mandatory question before submission.'),
                  ] else ...[
                    Text('Submission Requirements', style: AppTypography.sectionTitle.copyWith(fontSize: 18)),
                    const SizedBox(height: 10),
                    _requirement(Icons.location_searching_rounded, 'GPS check-in within the allowed radius'),
                    _requirement(Icons.photo_library_outlined, 'Minimum 2 clear photos'),
                    _requirement(Icons.receipt_long_outlined, 'Invoice/photo proof when requested'),
                    _requirement(Icons.access_time_rounded, 'Complete within the assigned time window'),
                  ],
                ])),
              ),
            ]),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
            decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.borderColor))),
            child: SafeArea(top: false, child: SizedBox(width: double.infinity, height: 52, child: ElevatedButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SubmitEvidenceScreen(task: t))), child: const Text('Accept Task')))),
          ),
        ]),
      ),
    );
  }

  Widget _hero(BuildContext context, TaskModel task) => SizedBox(
    height: 205,
    child: Stack(fit: StackFit.expand, children: [
      Image.asset('assets/ui/store_dmart.png', fit: BoxFit.cover),
      const DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(colors: [Color(0x66000000), Colors.transparent], begin: Alignment.topCenter, end: Alignment.center))),
      Positioned(top: 12, left: 12, child: _roundAction(Icons.arrow_back_rounded, () => Navigator.pop(context))),
      Positioned(top: 12, right: 58, child: _roundAction(Icons.favorite_border_rounded, () {})),
      Positioned(top: 12, right: 12, child: _roundAction(Icons.ios_share_rounded, () {})),
    ]),
  );

  Widget _roundAction(IconData icon, VoidCallback onTap) => Material(color: Colors.white, borderRadius: BorderRadius.circular(20), child: InkWell(onTap: onTap, borderRadius: BorderRadius.circular(20), child: SizedBox(width: 38, height: 38, child: Icon(icon, size: 20))));
  Widget _meta(IconData icon, String text) => Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 15, color: AppColors.secondaryText), const SizedBox(width: 4), Text(text, style: AppTypography.metadata)]);
  Widget _requirement(IconData icon, String text) => Padding(padding: const EdgeInsets.only(bottom: 13), child: Row(children: [Container(width: 35, height: 35, decoration: BoxDecoration(color: AppColors.blueChipBg, borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 18, color: AppColors.primaryBlue)), const SizedBox(width: 11), Expanded(child: Text(text, style: AppTypography.body.copyWith(color: AppColors.darkNavy, fontWeight: FontWeight.w500)))]));
  Widget _bullet(String text) => Padding(padding: const EdgeInsets.only(bottom: 12), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Padding(padding: EdgeInsets.only(top: 4), child: Icon(Icons.check_circle_rounded, color: AppColors.successGreen, size: 18)), const SizedBox(width: 9), Expanded(child: Text(text, style: AppTypography.body))]));
}
