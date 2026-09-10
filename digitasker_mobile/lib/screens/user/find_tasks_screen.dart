import 'package:flutter/material.dart';
import '../../models/task_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_typography.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/task_card.dart';
import 'task_detail_screen.dart';

class FindTasksScreen extends StatefulWidget {
  const FindTasksScreen({super.key});

  @override
  State<FindTasksScreen> createState() => _FindTasksScreenState();
}

class _FindTasksScreenState extends State<FindTasksScreen> {
  String _selectedPill = 'All';
  String _selectedCategory = 'All';
  String _selectedLocationType = 'All';
  String _sortBy = 'Default';

  final List<TaskModel> _allAvailableTasks = [
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

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                top: 24,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Filter & Sort Tasks', style: AppTypography.sectionTitle),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: AppColors.secondaryText),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Category Filter
                  const Text('Task Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: ['All', 'Store Audit', 'Product Check', 'Restaurant Audit', 'Surveys'].map((cat) {
                      final isSelected = _selectedCategory == cat;
                      return ChoiceChip(
                        selected: isSelected,
                        label: Text(cat),
                        selectedColor: AppColors.primaryBlue,
                        backgroundColor: AppColors.appBackground,
                        labelStyle: TextStyle(
                          fontSize: 12,
                          color: isSelected ? Colors.white : AppColors.darkNavy,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        onSelected: (selected) {
                          setModalState(() => _selectedCategory = cat);
                          setState(() => _selectedCategory = cat);
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Location Type
                  const Text('Task Location Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: ['All', 'On-site', 'Online'].map((type) {
                      final isSelected = _selectedLocationType == type;
                      return ChoiceChip(
                        selected: isSelected,
                        label: Text(type == 'All' ? 'All Types' : type),
                        selectedColor: AppColors.primaryBlue,
                        backgroundColor: AppColors.appBackground,
                        labelStyle: TextStyle(
                          fontSize: 12,
                          color: isSelected ? Colors.white : AppColors.darkNavy,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        onSelected: (selected) {
                          setModalState(() => _selectedLocationType = type);
                          setState(() => _selectedLocationType = type);
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Sort By Reward
                  const Text('Sort By Payout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: ['Default', 'Highest Payout First'].map((sort) {
                      final isSelected = _sortBy == sort;
                      return ChoiceChip(
                        selected: isSelected,
                        label: Text(sort),
                        selectedColor: AppColors.purple,
                        backgroundColor: AppColors.appBackground,
                        labelStyle: TextStyle(
                          fontSize: 12,
                          color: isSelected ? Colors.white : AppColors.darkNavy,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        onSelected: (selected) {
                          setModalState(() => _sortBy = sort);
                          setState(() => _sortBy = sort);
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 28),

                  PrimaryButton(
                    label: 'Apply Filters',
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  List<TaskModel> _getFilteredTasks() {
    var list = _allAvailableTasks.where((task) {
      // Category filter
      if (_selectedCategory != 'All' &&
          task.category.toLowerCase() != _selectedCategory.toLowerCase()) {
        return false;
      }

      // Location type filter
      if (_selectedLocationType != 'All' &&
          task.locationType.toLowerCase() != _selectedLocationType.toLowerCase()) {
        return false;
      }

      // Pill filter
      if (_selectedPill == 'Nearby' && task.locationType == 'Online') return false;
      if (_selectedPill == 'High Reward' && task.reward < 250) return false;
      if (_selectedPill == 'Surveys' && task.category != 'Surveys') return false;

      return true;
    }).toList();

    if (_sortBy == 'Highest Payout First') {
      list.sort((a, b) => b.reward.compareTo(a.reward));
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    final filteredTasks = _getFilteredTasks();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text(
          'Available Tasks',
          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.darkNavy),
        ),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.darkNavy,
        elevation: 0,
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.tune_rounded, color: AppColors.primaryBlue),
                tooltip: 'Filter Tasks',
                onPressed: _showFilterBottomSheet,
              ),
              if (_selectedCategory != 'All' || _selectedLocationType != 'All' || _sortBy != 'Default')
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.orange,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Choice Chips Row (All, Nearby, High Reward, Surveys)
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
                        color: isSelected ? Colors.white : AppColors.secondaryText,
                      ),
                      selectedColor: AppColors.primaryBlue,
                      backgroundColor: AppColors.appBackground,
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

          // Active filter indicator badge if filters selected
          if (_selectedCategory != 'All' || _selectedLocationType != 'All' || _sortBy != 'Default')
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              child: Row(
                children: [
                  const Text('Active Filters: ', style: TextStyle(fontSize: 12, color: AppColors.secondaryText)),
                  if (_selectedCategory != 'All')
                    _buildFilterBadge('Category: $_selectedCategory'),
                  if (_selectedLocationType != 'All')
                    _buildFilterBadge('Type: $_selectedLocationType'),
                  if (_sortBy != 'Default')
                    _buildFilterBadge(_sortBy),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedCategory = 'All';
                        _selectedLocationType = 'All';
                        _sortBy = 'Default';
                        _selectedPill = 'All';
                      });
                    },
                    child: const Text('Reset All', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.errorRed)),
                  ),
                ],
              ),
            ),

          // Tasks List
          Expanded(
            child: filteredTasks.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search_off_rounded, size: 48, color: Colors.grey),
                        SizedBox(height: 12),
                        Text(
                          'No tasks match active filters',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.darkNavy),
                        ),
                        SizedBox(height: 4),
                        Text('Try resetting category or location filters.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pageHorizontalPadding),
                    itemCount: filteredTasks.length,
                    itemBuilder: (ctx, i) {
                      final task = filteredTasks[i];
                      return TaskCard(
                        task: task,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBadge(String label) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.blueChipBg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
      ),
    );
  }
}
