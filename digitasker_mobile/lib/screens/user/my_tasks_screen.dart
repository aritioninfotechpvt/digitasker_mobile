import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/task_model.dart';
import '../../providers/task_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import 'multi_step_task_completion_screen.dart';
import 'task_detail_screen.dart';

class MyTasksScreen extends StatefulWidget {
  const MyTasksScreen({super.key});

  @override
  State<MyTasksScreen> createState() => _MyTasksScreenState();
}

class _MyTasksScreenState extends State<MyTasksScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _sortBy = 'Highest Reward';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final taskProvider = Provider.of<TaskProvider>(context, listen: false);
      taskProvider.fetchUserTasks();
      taskProvider.fetchFeaturedTasks();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final allUserTasks = _getSampleMyTasks(taskProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('My Tasks', style: AppTypography.screenTitle.copyWith(fontSize: 20)),
            Text('InsightLoop USER Workspace', style: AppTypography.metadata.copyWith(fontSize: 11, color: const Color(0xFF64748B))),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryBlue,
          unselectedLabelColor: const Color(0xFF64748B),
          indicatorColor: AppColors.primaryBlue,
          indicatorWeight: 3,
          labelStyle: AppTypography.cardTitle.copyWith(fontSize: 13),
          unselectedLabelStyle: AppTypography.body.copyWith(fontSize: 13),
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'In Progress'),
            Tab(text: 'Under Review'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: Column(
        children: [
          // QC Revision Requested Banner
          _buildQCRevisionBanner(context, allUserTasks),

          // Search and Sort Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
                      decoration: const InputDecoration(
                        hintText: 'Search my tasks by title, brand, platform...',
                        prefixIcon: Icon(Icons.search_rounded, size: 20, color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 11),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _sortBy,
                      icon: const Icon(Icons.sort_rounded, color: AppColors.primaryBlue, size: 20),
                      style: AppTypography.metadata.copyWith(color: AppColors.darkNavy, fontWeight: FontWeight.w700),
                      onChanged: (val) {
                        if (val != null) setState(() => _sortBy = val);
                      },
                      items: const [
                        DropdownMenuItem(value: 'Highest Reward', child: Text('Sort: Reward')),
                        DropdownMenuItem(value: 'Latest', child: Text('Sort: Latest')),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // TabBar Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildTaskList(allUserTasks, filterStatus: 'all'),
                _buildTaskList(allUserTasks, filterStatus: 'in_progress'),
                _buildTaskList(allUserTasks, filterStatus: 'under_review'),
                _buildTaskList(allUserTasks, filterStatus: 'completed'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQCRevisionBanner(BuildContext context, List<MyTaskItem> tasks) {
    final revisionTask = tasks.firstWhere(
      (t) => t.status == 'revision_needed',
      orElse: () => MyTaskItem(
        id: 4178,
        title: 'Google Rating & Review',
        brand: 'DigiLites Studio',
        reward: 30,
        status: 'revision_needed',
        submittedTime: '10:45 PM',
        revisionNote: 'Review screenshot missing profile handle name. Please re-upload photo showing your 5-star Google review and handle.',
        category: 'Google Rating & Review',
      ),
    );

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDBA74)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Color(0xFFEA580C), size: 22),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'QC Revision Requested (SUB-${revisionTask.id})',
                  style: AppTypography.cardTitle.copyWith(color: const Color(0xFFC2410C), fontSize: 13.5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '*${revisionTask.revisionNote}*',
            style: AppTypography.body.copyWith(fontSize: 12, color: const Color(0xFF9A3412), height: 1.35),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 38,
            child: ElevatedButton(
              onPressed: () {
                final dummyTask = TaskModel(
                  id: revisionTask.id,
                  title: revisionTask.title,
                  storeName: revisionTask.brand,
                  description: revisionTask.revisionNote,
                  reward: revisionTask.reward,
                  category: revisionTask.category,
                  status: 'open',
                );
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MultiStepTaskCompletionScreen(task: dummyTask)),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEA580C),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Re-submit Evidence', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  SizedBox(width: 6),
                  Icon(Icons.arrow_forward_rounded, size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaskList(List<MyTaskItem> tasks, {required String filterStatus}) {
    var filtered = tasks.where((t) {
      if (filterStatus == 'in_progress') return t.status == 'in_progress' || t.status == 'open';
      if (filterStatus == 'under_review') return t.status == 'under_review' || t.status == 'revision_needed';
      if (filterStatus == 'completed') return t.status == 'completed';
      return true;
    }).toList();

    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((t) {
        return t.title.toLowerCase().contains(_searchQuery) || t.brand.toLowerCase().contains(_searchQuery) || t.category.toLowerCase().contains(_searchQuery);
      }).toList();
    }

    if (_sortBy == 'Highest Reward') {
      filtered.sort((a, b) => b.reward.compareTo(a.reward));
    }

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.assignment_outlined, size: 48, color: Color(0xFFCBD5E1)),
            const SizedBox(height: 10),
            Text('No tasks found in this section', style: AppTypography.cardTitle.copyWith(color: const Color(0xFF64748B))),
            const SizedBox(height: 4),
            Text('Complete nearby audits or surveys to earn rewards!', style: AppTypography.metadata),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
      itemCount: filtered.length,
      itemBuilder: (context, index) {
        final item = filtered[index];
        return _buildMyTaskCard(item);
      },
    );
  }

  Widget _buildMyTaskCard(MyTaskItem item) {
    Color statusBg = const Color(0xFFFEF3C7);
    Color statusColor = const Color(0xFFD97706);
    String statusLabel = 'Under QA Review';

    if (item.status == 'completed') {
      statusBg = const Color(0xFFD1FAE5);
      statusColor = const Color(0xFF059669);
      statusLabel = 'Completed';
    } else if (item.status == 'revision_needed') {
      statusBg = const Color(0xFFFFE4E6);
      statusColor = const Color(0xFFE11D48);
      statusLabel = 'Revision Needed';
    } else if (item.status == 'in_progress') {
      statusBg = const Color(0xFFE0F2FE);
      statusColor = const Color(0xFF0284C7);
      statusLabel = 'In Progress';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  item.imageUrl,
                  width: 72,
                  height: 72,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 72,
                    height: 72,
                    color: const Color(0xFFF1F5F9),
                    child: const Icon(Icons.photo_library_outlined, color: Color(0xFF94A3B8)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('🇮🇳 India', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: statusBg,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (item.status == 'completed') const Icon(Icons.check_circle_rounded, size: 11, color: Color(0xFF059669)),
                              if (item.status == 'under_review') const Icon(Icons.hourglass_top_rounded, size: 11, color: Color(0xFFD97706)),
                              const SizedBox(width: 3),
                              Text(statusLabel, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: statusColor)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(item.title, style: AppTypography.cardTitle.copyWith(fontSize: 15)),
                    const SizedBox(height: 2),
                    Text('${item.brand} · Chandigarh, NCR (25 mins)', style: AppTypography.metadata),
                  ],
                ),
              ),
              Text(
                '₹${item.reward.toStringAsFixed(0)}',
                style: AppTypography.screenTitle.copyWith(fontSize: 18, color: AppColors.successGreen),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_rounded, size: 12, color: AppColors.primaryBlue),
                    const SizedBox(width: 4),
                    Text('Category: ${item.category}', style: AppTypography.metadata.copyWith(fontSize: 11, color: AppColors.darkNavy, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              const Spacer(),
              Text('Submitted: ${item.submittedTime}', style: AppTypography.metadata.copyWith(fontSize: 11)),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: OutlinedButton(
              onPressed: () {
                final dummyTask = TaskModel(
                  id: item.id,
                  title: item.title,
                  storeName: item.brand,
                  description: item.title,
                  reward: item.reward,
                  category: item.category,
                  status: item.status,
                );
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => TaskDetailScreen(task: dummyTask)),
                );
              },
              style: OutlinedButton.styleFrom(
                backgroundColor: item.status == 'completed' ? const Color(0xFFF0FDF4) : const Color(0xFFF8FAFC),
                foregroundColor: item.status == 'completed' ? const Color(0xFF047857) : AppColors.primaryBlue,
                side: BorderSide(color: item.status == 'completed' ? const Color(0xFFA7F3D0) : const Color(0xFFCBD5E1)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    item.status == 'completed' ? 'View Completed Proof' : (item.status == 'under_review' ? 'Submitted (Reviewing)' : 'View Task Details'),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.chevron_right_rounded, size: 18),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<MyTaskItem> _getSampleMyTasks(TaskProvider provider) {
    return [
      MyTaskItem(
        id: 4178,
        title: 'Google Rating & Review',
        brand: 'DigiLites Studio',
        reward: 30,
        status: 'under_review',
        submittedTime: '10:45 PM',
        revisionNote: 'Review screenshot missing profile handle name. Please re-upload photo showing your 5-star Google review and handle.',
        category: 'Google Rating & Review',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=300&q=80',
      ),
      MyTaskItem(
        id: 101,
        title: 'Delhi NCR Electronics Hub Store Audit',
        brand: 'Electronics Hub',
        reward: 400,
        status: 'completed',
        submittedTime: 'Yesterday, 4:15 PM',
        revisionNote: '',
        category: 'Mystery Audit',
        imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80',
      ),
      MyTaskItem(
        id: 102,
        title: 'Bengaluru Flagship Outlets Branding Check',
        brand: 'Brand Outlet',
        reward: 300,
        status: 'in_progress',
        submittedTime: 'In Progress',
        revisionNote: '',
        category: 'Photo Verification',
        imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=300&q=80',
      ),
    ];
  }
}

class MyTaskItem {
  final int id;
  final String title;
  final String brand;
  final double reward;
  final String status;
  final String submittedTime;
  final String revisionNote;
  final String category;
  final String imageUrl;

  MyTaskItem({
    required this.id,
    required this.title,
    required this.brand,
    required this.reward,
    required this.status,
    required this.submittedTime,
    required this.revisionNote,
    required this.category,
    this.imageUrl = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=300&q=80',
  });
}
