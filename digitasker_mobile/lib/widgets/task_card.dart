import 'package:flutter/material.dart';
import '../models/task_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class TaskCard extends StatefulWidget {
  final TaskModel task;
  final VoidCallback onTap;
  const TaskCard({super.key, required this.task, required this.onTap});
  @override
  State<TaskCard> createState() => _TaskCardState();
}

class _TaskCardState extends State<TaskCard> {
  bool fav = false;

  @override
  Widget build(BuildContext context) {
    final t = widget.task;
    return InkWell(
      onTap: widget.onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.borderColor), boxShadow: [BoxShadow(color: AppColors.darkNavy.withOpacity(.03), blurRadius: 10, offset: const Offset(0, 4))]),
        child: Row(children: [
          ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.asset(_assetFor(t), width: 84, height: 78, fit: BoxFit.cover)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [Expanded(child: Text(t.title, style: AppTypography.cardTitle)), GestureDetector(onTap: () => setState(() => fav = !fav), child: Icon(fav ? Icons.favorite_rounded : Icons.favorite_border_rounded, color: fav ? AppColors.errorRed : AppColors.darkNavy, size: 20))]),
            const SizedBox(height: 1),
            Text(t.storeName, style: AppTypography.metadata),
            const SizedBox(height: 5),
            Row(children: [const Icon(Icons.location_on_outlined, size: 13, color: AppColors.secondaryText), const SizedBox(width: 2), Text(t.distance, style: AppTypography.metadata), const Spacer(), Text('₹${t.reward.toStringAsFixed(0)}', style: AppTypography.money)]),
            const SizedBox(height: 6),
            Wrap(spacing: 6, children: t.tags.take(2).map((tag) => Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: _tagBg(tag), borderRadius: BorderRadius.circular(10)), child: Text(tag, style: AppTypography.metadata.copyWith(fontSize: 9.5, color: _tagFg(tag), fontWeight: FontWeight.w700)))).toList()),
          ])),
        ]),
      ),
    );
  }

  String _assetFor(TaskModel task) {
    if (task.category.contains('Product')) return 'assets/ui/product_pharmacy.png';
    if (task.category.contains('Restaurant')) return 'assets/ui/restaurant.png';
    if (task.category.contains('Survey')) return 'assets/ui/survey.png';
    return 'assets/ui/store_dmart.png';
  }

  Color _tagBg(String tag) {
    if (tag == 'New' || tag == 'Quick') return AppColors.blueChipBg;
    if (tag == 'Easy' || tag == 'On-site') return AppColors.greenChipBg;
    return AppColors.purpleChipBg;
  }
  Color _tagFg(String tag) {
    if (tag == 'New' || tag == 'Quick') return AppColors.primaryBlue;
    if (tag == 'Easy' || tag == 'On-site') return AppColors.successGreen;
    return AppColors.purple;
  }
}
