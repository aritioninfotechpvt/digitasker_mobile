import 'package:flutter/material.dart';
import '../../data/demo_data.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/task_card.dart';
import 'task_detail_screen.dart';

class FindTasksScreen extends StatefulWidget {
  const FindTasksScreen({super.key});
  @override
  State<FindTasksScreen> createState() => _FindTasksScreenState();
}

class _FindTasksScreenState extends State<FindTasksScreen> {
  String selected = 'All';
  final pills = ['All', 'Nearby', 'High Reward', 'Surveys'];

  @override
  Widget build(BuildContext context) {
    final tasks = DemoData.tasks.where((t) {
      if (selected == 'All') return true;
      if (selected == 'Nearby') return t.locationType == 'On-site';
      if (selected == 'High Reward') return t.reward >= 250;
      return t.category == 'Surveys';
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Available Tasks'),
        actions: [IconButton(onPressed: _showFilters, icon: const Icon(Icons.filter_alt_outlined))],
      ),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: pills.map((p) {
              final active = selected == p;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(p),
                  selected: active,
                  onSelected: (_) => setState(() => selected = p),
                  showCheckmark: false,
                  labelStyle: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: active ? Colors.white : AppColors.bodyText),
                  selectedColor: AppColors.primaryBlue,
                  backgroundColor: const Color(0xFFF3F6FA),
                  side: BorderSide.none,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
              );
            }).toList()),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
            itemCount: tasks.length,
            itemBuilder: (_, i) => TaskCard(task: tasks[i], onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TaskDetailScreen(task: tasks[i])))),
          ),
        ),
      ]),
    );
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 42, height: 4, decoration: BoxDecoration(color: AppColors.borderColor, borderRadius: BorderRadius.circular(3)))),
          const SizedBox(height: 18),
          Text('Filter Tasks', style: AppTypography.sectionTitle),
          const SizedBox(height: 18),
          Text('Distance', style: AppTypography.cardTitle),
          Slider(value: 5, min: 1, max: 25, onChanged: (_) {}),
          const SizedBox(height: 8),
          SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Apply Filters'))),
        ]),
      ),
    );
  }
}
