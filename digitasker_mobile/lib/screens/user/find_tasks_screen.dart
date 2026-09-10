import 'package:flutter/material.dart';
import '../../models/task_model.dart';
import 'task_detail_screen.dart';

class FindTasksScreen extends StatefulWidget {
  const FindTasksScreen({super.key});

  @override
  State<FindTasksScreen> createState() => _FindTasksScreenState();
}

class _FindTasksScreenState extends State<FindTasksScreen> {
  String _selectedPill = 'All';

  final List<TaskModel> _mockAvailableTasks = [
    TaskModel(
      id: 101,
      title: 'Store Audit',
      storeName: 'DMart',
      description: 'Evaluate store hygiene, product displays, staff behavior and pricing.',
      reward: 250.0,
      distance: '0.8 km',
      duration: '30-45 mins',
      locationType: 'On-site',
      category: 'Store Audit',
      tags: ['New', 'Easy'],
      status: 'open',
    ),
    TaskModel(
      id: 102,
      title: 'Product Check',
      storeName: 'Pharmacy',
      description: 'Check medicine stock levels and promotional banners.',
      reward: 180.0,
      distance: '1.3 km',
      duration: '15-20 mins',
      locationType: 'On-site',
      category: 'Product Check',
      tags: ['Photo', 'Quick'],
      status: 'open',
    ),
    TaskModel(
      id: 103,
      title: 'Restaurant Audit',
      storeName: "Domino's",
      description: 'Inspect seating cleanliness, order turnaround time and staff greeting.',
      reward: 300.0,
      distance: '2.1 km',
      duration: '40 mins',
      locationType: 'On-site',
      category: 'Restaurant Audit',
      tags: ['Popular', 'On-site'],
      status: 'open',
    ),
    TaskModel(
      id: 104,
      title: 'Consumer Survey',
      storeName: 'Online Task',
      description: 'Share your feedback on retail shopping experience online.',
      reward: 100.0,
      distance: '0.0 km',
      duration: '5-10 mins',
      locationType: 'Online',
      category: 'Surveys',
      tags: ['Survey', '5-10 mins'],
      status: 'open',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Available Tasks',
          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: Color(0xFF0F172A)),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Pills Row (All, Nearby, High Reward, Surveys)
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Nearby', 'High Reward', 'Surveys'].map((pill) {
                  final isSelected = _selectedPill == pill;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      selected: isSelected,
                      label: Text(pill),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? Colors.white : const Color(0xFF64748B),
                      ),
                      selectedColor: const Color(0xFF2563EB),
                      backgroundColor: const Color(0xFFF1F5F9),
                      onSelected: (selected) {
                        setState(() => _selectedPill = pill);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Tasks List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _mockAvailableTasks.length,
              itemBuilder: (ctx, i) {
                final task = _mockAvailableTasks[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Row(
                          children: [
                            // Store Thumbnail Box
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.storefront_rounded,
                                color: Color(0xFF2563EB),
                                size: 32,
                              ),
                            ),
                            const SizedBox(width: 14),

                            // Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        task.title,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                          color: Color(0xFF0F172A),
                                        ),
                                      ),
                                      const Icon(Icons.favorite_border_rounded,
                                          size: 18, color: Color(0xFF94A3B8)),
                                    ],
                                  ),
                                  Text(
                                    task.storeName,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on_outlined,
                                          size: 13, color: Color(0xFF64748B)),
                                      const SizedBox(width: 2),
                                      Text(
                                        task.distance,
                                        style: const TextStyle(
                                            fontSize: 11, color: Color(0xFF64748B)),
                                      ),
                                      const SizedBox(width: 12),
                                      Text(
                                        '₹${task.reward.toStringAsFixed(0)}',
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF10B981),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: task.tags.map((tag) {
                                      return Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 3),
                                        margin: const EdgeInsets.only(right: 6),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFEFF6FF),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          tag,
                                          style: const TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF2563EB),
                                          ),
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
