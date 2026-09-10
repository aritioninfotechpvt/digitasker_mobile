import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/demo_data.dart';
import '../../models/task_model.dart';
import '../../providers/task_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/animated_press.dart';
import '../../widgets/fade_slide_transition.dart';
import 'multi_step_task_completion_screen.dart';
import 'task_detail_screen.dart';

class FindTasksScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialSearchQuery;
  const FindTasksScreen({super.key, this.initialCategory, this.initialSearchQuery});

  @override
  State<FindTasksScreen> createState() => _FindTasksScreenState();
}

class _FindTasksScreenState extends State<FindTasksScreen> {
  late String _selectedCategory;
  late TextEditingController _searchController;
  bool _isMatchedFilter = false;
  String _searchQuery = '';
  String _sortBy = 'Reward (High to Low)';

  final List<String> _webCategories = [
    'All',
    'Mystery Audit',
    'Social Media',
    'E-commerce',
    'Google Rating & Review',
    'IMDb & Movie Rating',
    'Survey',
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All';
    _searchQuery = widget.initialSearchQuery ?? '';
    _searchController = TextEditingController(text: _searchQuery);
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim();
      });
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final taskProvider = Provider.of<TaskProvider>(context, listen: false);
      taskProvider.fetchUserTasks();
      taskProvider.fetchFeaturedTasks();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final rawTasks = taskProvider.availableTasks.isNotEmpty
        ? taskProvider.availableTasks
        : (taskProvider.featuredTasks.isNotEmpty ? taskProvider.featuredTasks : DemoData.tasks);

    // Apply Filter & Search
    final filteredTasks = rawTasks.where((t) {
      if (_selectedCategory != 'All') {
        if (_selectedCategory == 'Mystery Audit' && !t.category.toLowerCase().contains('audit')) return false;
        if (_selectedCategory == 'Social Media' && !t.category.toLowerCase().contains('social')) return false;
        if (_selectedCategory == 'E-commerce' && !t.category.toLowerCase().contains('check') && !t.category.toLowerCase().contains('product')) return false;
        if (_selectedCategory == 'Google Rating & Review' && !t.title.toLowerCase().contains('rating') && !t.category.toLowerCase().contains('review')) return false;
        if (_selectedCategory == 'Survey' && !t.category.toLowerCase().contains('survey')) return false;
      }
      if (_isMatchedFilter && t.locationType == 'Online') return false;
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        return t.title.toLowerCase().contains(query) || t.storeName.toLowerCase().contains(query) || t.category.toLowerCase().contains(query);
      }
      return true;
    }).toList();

    if (_sortBy == 'Reward (High to Low)') {
      filteredTasks.sort((a, b) => b.reward.compareTo(a.reward));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Find Available Tasks & Audits', style: AppTypography.screenTitle.copyWith(fontSize: 18)),
            Text('InsightLoop USER Workspace', style: AppTypography.metadata.copyWith(fontSize: 11, color: const Color(0xFF64748B))),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => _showFilterBottomSheet(context),
            icon: const Icon(Icons.tune_rounded, color: AppColors.darkNavy),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          // Live Search Bar
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: TextField(
                  controller: _searchController,
                  textAlignVertical: TextAlignVertical.center,
                  style: AppTypography.body.copyWith(color: AppColors.darkNavy, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: 'Search by task, brand, category or location...',
                    hintStyle: AppTypography.metadata.copyWith(fontSize: 12.5, color: const Color(0xFF64748B)),
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF475569), size: 22),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18, color: Color(0xFF64748B)),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
              ),
            ),
          ),

          // QC Revision Requested Alert Banner
          SliverToBoxAdapter(child: _buildQCRevisionBanner(context)),

          // Horizontal Categories Scroll
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: _webCategories.map((cat) {
                    final active = _selectedCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(cat),
                        selected: active,
                        onSelected: (_) => setState(() => _selectedCategory = cat),
                        showCheckmark: false,
                        labelStyle: TextStyle(
                          fontSize: 12.5,
                          fontWeight: active ? FontWeight.bold : FontWeight.w600,
                          color: active ? Colors.white : AppColors.bodyText,
                        ),
                        selectedColor: AppColors.primaryBlue,
                        backgroundColor: const Color(0xFFF1F5F9),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ),

          // Filter Mode Toggles (Show All vs Matched for My Address)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _isMatchedFilter = false),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        height: 42,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: !_isMatchedFilter ? AppColors.primaryBlue : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: !_isMatchedFilter ? AppColors.primaryBlue : const Color(0xFFCBD5E1)),
                        ),
                        child: Text(
                          'Show All Tasks',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: !_isMatchedFilter ? Colors.white : AppColors.darkNavy,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _isMatchedFilter = true),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        height: 42,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: _isMatchedFilter ? AppColors.primaryBlue : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _isMatchedFilter ? AppColors.primaryBlue : const Color(0xFFCBD5E1)),
                        ),
                        child: Text(
                          '✨ Matched for My Address',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            color: _isMatchedFilter ? Colors.white : AppColors.darkNavy,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Search Bar & Sort Dropdown
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
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
                        onChanged: (val) => setState(() => _searchQuery = val.trim()),
                        decoration: const InputDecoration(
                          hintText: 'Search task title, brand, platform (e.g. Samsung, Flipkart)...',
                          prefixIcon: Icon(Icons.search_rounded, size: 20, color: Color(0xFF94A3B8)),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 11),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
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
                        icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.primaryBlue),
                        style: AppTypography.metadata.copyWith(color: AppColors.darkNavy, fontWeight: FontWeight.w700),
                        onChanged: (val) {
                          if (val != null) setState(() => _sortBy = val);
                        },
                        items: const [
                          DropdownMenuItem(value: 'Reward (High to Low)', child: Text('Reward (High to Low)')),
                          DropdownMenuItem(value: 'Latest', child: Text('Latest')),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Tasks List / Grid
          if (taskProvider.isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (filteredTasks.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.search_off_rounded, size: 48, color: Color(0xFFCBD5E1)),
                    const SizedBox(height: 10),
                    Text('No matching tasks found', style: AppTypography.cardTitle.copyWith(color: const Color(0xFF64748B))),
                    const SizedBox(height: 4),
                    Text('Try clearing category or search filters.', style: AppTypography.metadata),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final task = filteredTasks[index];
                    return _buildWebTaskCard(context, task, index);
                  },
                  childCount: filteredTasks.length,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildQCRevisionBanner(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFCA5A5), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 22),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'QC Revision Requested (SUB-4178)',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.cardTitle.copyWith(color: const Color(0xFF991B1B), fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '*Review screenshot missing profile handle name. Please re-upload photo showing your 5-star Google review and handle.*',
            style: AppTypography.body.copyWith(fontSize: 12, color: const Color(0xFF7F1D1D), height: 1.4),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: () {
                final dummyTask = TaskModel(
                  id: 4178,
                  title: 'Google Rating & Review',
                  storeName: 'DigiLites Studio',
                  description: 'Review screenshot missing profile handle name.',
                  reward: 30,
                  category: 'Google Rating & Review',
                  status: 'open',
                );
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MultiStepTaskCompletionScreen(task: dummyTask)),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFDC2626),
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Re-submit Evidence & Fix',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                  ),
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

  Widget _buildWebTaskCard(BuildContext context, TaskModel task, int index) {
    final slotsLeft = 16 + (index * 4);
    return FadeSlideTransition(
      delayIndex: index > 6 ? 6 : index,
      child: AnimatedPress(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
        ),
        child: Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: const [
              BoxShadow(color: Color(0x0A000000), blurRadius: 12, offset: Offset(0, 4)),
            ],
          ),
          child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Store Image Header with Targeted Match Badge
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                child: Image.network(
                  task.imageUrl.isNotEmpty ? task.imageUrl : 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 140,
                    color: const Color(0xFF0E2244),
                    alignment: Alignment.center,
                    child: const Icon(Icons.storefront_rounded, size: 48, color: Colors.white54),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0284C7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.gps_fixed_rounded, color: Colors.white, size: 13),
                      SizedBox(width: 5),
                      Text('Targeted Match', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Card Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category Chips & Reward Row
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('🇮🇳 India', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(task.locationType, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3E8FF),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(task.category, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF7E22CE))),
                    ),
                    const Spacer(),
                    Text(
                      '₹${task.reward.toStringAsFixed(0)}',
                      style: AppTypography.screenTitle.copyWith(fontSize: 22, color: AppColors.primaryBlue),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Title & Subtitle
                Text(task.title, style: AppTypography.cardTitle.copyWith(fontSize: 16)),
                const SizedBox(height: 3),
                Text('Partner Brand · ${task.category}', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),

                // Location Pin
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text('${task.location} · 20 mins', style: AppTypography.metadata.copyWith(fontSize: 12.5)),
                  ],
                ),
                const SizedBox(height: 6),

                // Expiry & KYC Badges
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, size: 14, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text('Starts: 2026-09-01 · ⏳ Expires: 2026-09-30', style: AppTypography.metadata.copyWith(fontSize: 11.5)),
                  ],
                ),
                const SizedBox(height: 8),

                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFE2E8F0))),
                      child: const Text('✓ Country: India 🇮🇳', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFE2E8F0))),
                      child: const Text('✓ KYC Verified', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Bottom Action & Slots Counter
                Row(
                  children: [
                    Text('$slotsLeft slots left', style: AppTypography.metadata.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.w600)),
                    const Spacer(),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Row(
                        children: [
                          Text('View Task Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_rounded, size: 16),
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
  ),
);
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Filter Available Tasks', style: AppTypography.cardTitle.copyWith(fontSize: 18)),
              const SizedBox(height: 16),
              const Text('Task Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _webCategories.map((c) {
                  final active = _selectedCategory == c;
                  return ChoiceChip(
                    label: Text(c),
                    selected: active,
                    onSelected: (_) {
                      setState(() => _selectedCategory = c);
                      Navigator.pop(ctx);
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    );
  }
}
