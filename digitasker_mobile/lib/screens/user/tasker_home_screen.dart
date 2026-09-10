import 'package:flutter/material.dart';

import '../../data/demo_data.dart';
import '../../models/task_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/app_drawer.dart';
import 'find_tasks_screen.dart';
import 'notifications_screen.dart';
import 'profile_screen.dart';
import 'task_detail_screen.dart';
import 'wallet_screen.dart';

class TaskerHomeScreen extends StatefulWidget {
  const TaskerHomeScreen({super.key});

  @override
  State<TaskerHomeScreen> createState() => _TaskerHomeScreenState();
}

class _TaskerHomeScreenState extends State<TaskerHomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _HomeTab(),
      const FindTasksScreen(),
      const WalletScreen(),
      const NotificationsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      drawer: AppSideDrawer(
        onTabSelected: (index) => setState(() => _selectedIndex = index),
      ),
      body: IndexedStack(index: _selectedIndex, children: pages),
      bottomNavigationBar: _BottomNav(
        selectedIndex: _selectedIndex,
        onChanged: (index) => setState(() => _selectedIndex = index),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  const _BottomNav({required this.selectedIndex, required this.onChanged});

  final int selectedIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    const items = [
      (Icons.home_outlined, Icons.home_rounded, 'Home'),
      (Icons.assignment_outlined, Icons.assignment_rounded, 'Tasks'),
      (Icons.account_balance_wallet_outlined, Icons.account_balance_wallet_rounded, 'Wallet'),
      (Icons.chat_bubble_outline_rounded, Icons.chat_bubble_rounded, 'Messages'),
      (Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.borderColor.withOpacity(.95))),
        boxShadow: [
          BoxShadow(
            color: AppColors.darkNavy.withOpacity(.06),
            blurRadius: 18,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 67,
          child: Row(
            children: List.generate(items.length, (index) {
              final selected = index == selectedIndex;
              final item = items[index];
              return Expanded(
                child: InkWell(
                  onTap: () => onChanged(index),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        selected ? item.$2 : item.$1,
                        color: selected ? AppColors.primaryBlue : const Color(0xFF65748A),
                        size: 23,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.$3,
                        style: AppTypography.metadata.copyWith(
                          fontSize: 10.5,
                          color: selected ? AppColors.primaryBlue : const Color(0xFF65748A),
                          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(child: _header(context)),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _hero(context),
                const SizedBox(height: 18),
                _categoryGrid(context),
                const SizedBox(height: 21),
                _sectionHeader(
                  context,
                  title: 'Nearby Tasks',
                  action: 'View All',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FindTasksScreen()),
                  ),
                ),
                const SizedBox(height: 9),
                ...DemoData.tasks.take(3).map(
                      (task) => Padding(
                        padding: const EdgeInsets.only(bottom: 11),
                        child: _nearbyTask(context, task),
                      ),
                    ),
                const SizedBox(height: 8),
                _earningsStrip(),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _header(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1677FF), Color(0xFF075EBB)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 17),
      child: Column(
        children: [
          Row(
            children: [
              Builder(
                builder: (ctx) => InkWell(
                  onTap: () => Scaffold.of(ctx).openDrawer(),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.menu_rounded, color: Colors.white, size: 22),
                  ),
                ),
              ),
              const SizedBox(width: 9),
              const Icon(Icons.location_on_rounded, color: Colors.white, size: 18),
              const SizedBox(width: 4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your location',
                      style: AppTypography.metadata.copyWith(
                        color: Colors.white.withOpacity(.72),
                        fontSize: 9.5,
                      ),
                    ),
                    Text(
                      'Zirakpur, Punjab',
                      style: AppTypography.body.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 12.5,
                      ),
                    ),
                  ],
                ),
              ),
              _notificationButton(context),
              const SizedBox(width: 8),
              Container(
                width: 36,
                height: 36,
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                child: ClipOval(
                  child: Image.asset(
                    'assets/ui/profile_avatar.png',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Container(
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF003D7A).withOpacity(.14),
                  blurRadius: 16,
                  offset: const Offset(0, 7),
                ),
              ],
            ),
            child: TextField(
              textAlignVertical: TextAlignVertical.center,
              decoration: InputDecoration(
                hintText: 'Search tasks, brands or locations',
                hintStyle: AppTypography.metadata.copyWith(fontSize: 11.5),
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF5F6F85), size: 21),
                suffixIcon: Container(
                  width: 38,
                  margin: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF3FF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.tune_rounded, color: AppColors.primaryBlue, size: 19),
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                filled: false,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _notificationButton(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        InkWell(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NotificationsScreen()),
          ),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 22),
          ),
        ),
        Positioned(
          right: 6,
          top: 5,
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: const Color(0xFFFF4D4F),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 1.4),
            ),
          ),
        ),
      ],
    );
  }

  Widget _hero(BuildContext context) {
    return Container(
      height: 158,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0D5AAA), Color(0xFF0D83DF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryBlue.withOpacity(.18),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Stack(
          children: [
            Positioned(
              right: -24,
              top: -22,
              child: Container(
                width: 155,
                height: 155,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Image.asset(
                'assets/ui/home_banner_person_only.png',
                width: 120,
                height: 150,
                fit: BoxFit.cover,
                alignment: Alignment.centerRight,
              ),
            ),
            Positioned(
              left: 17,
              top: 17,
              right: 112,
              bottom: 14,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'TASKS NEAR YOU',
                      style: AppTypography.metadata.copyWith(
                        color: Colors.white,
                        fontSize: 8.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: .5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 7),
                  Text(
                    'Small Tasks.\nBig Rewards!',
                    style: AppTypography.screenTitle.copyWith(
                      color: Colors.white,
                      fontSize: 23,
                      height: 1.02,
                      letterSpacing: -.7,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Complete verified tasks and earn real cash.',
                    maxLines: 2,
                    style: AppTypography.metadata.copyWith(
                      color: Colors.white.withOpacity(.9),
                      fontSize: 10.5,
                      height: 1.25,
                    ),
                  ),
                  const Spacer(),
                  SizedBox(
                    height: 34,
                    child: ElevatedButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const FindTasksScreen()),
                      ),
                      style: ElevatedButton.styleFrom(
                        elevation: 0,
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.darkNavy,
                        padding: const EdgeInsets.symmetric(horizontal: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('View Tasks', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800)),
                          SizedBox(width: 5),
                          Icon(Icons.arrow_forward_rounded, size: 15),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _categoryGrid(BuildContext context) {
    final items = [
      (Icons.storefront_rounded, 'Store Audit', const Color(0xFF1378F2), const Color(0xFFE8F3FF)),
      (Icons.shopping_bag_rounded, 'Shopping\nTasks', const Color(0xFFEF476F), const Color(0xFFFFEBF0)),
      (Icons.location_on_rounded, 'Surveys', const Color(0xFFFF9800), const Color(0xFFFFF1DF)),
      (Icons.description_rounded, 'Product\nCheck', const Color(0xFF10B981), const Color(0xFFE7F9F1)),
      (Icons.camera_alt_rounded, 'Photo Tasks', const Color(0xFFFF3D57), const Color(0xFFFFEBEE)),
      (Icons.travel_explore_rounded, 'Visit & Review', const Color(0xFF05A6D8), const Color(0xFFE6F8FE)),
      (Icons.star_rounded, 'Special\nCampaigns', const Color(0xFFFF8A00), const Color(0xFFFFF1DF)),
      (Icons.more_horiz_rounded, 'More', const Color(0xFF132A4A), const Color(0xFFF0F3F7)),
    ];

    return GridView.builder(
      itemCount: items.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisExtent: 84,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemBuilder: (_, index) {
        final item = items[index];
        return InkWell(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const FindTasksScreen()),
          ),
          borderRadius: BorderRadius.circular(16),
          child: Column(
            children: [
              Container(
                width: 47,
                height: 47,
                decoration: BoxDecoration(
                  color: item.$4,
                  shape: BoxShape.circle,
                ),
                child: Icon(item.$1, color: item.$3, size: 22),
              ),
              const SizedBox(height: 6),
              Text(
                item.$2,
                textAlign: TextAlign.center,
                maxLines: 2,
                style: AppTypography.metadata.copyWith(
                  color: AppColors.darkNavy,
                  fontSize: 9.6,
                  height: 1.15,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _sectionHeader(
    BuildContext context, {
    required String title,
    required String action,
    required VoidCallback onTap,
  }) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: AppTypography.sectionTitle.copyWith(fontSize: 20),
          ),
        ),
        TextButton(
          onPressed: onTap,
          style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 4)),
          child: Text(
            action,
            style: AppTypography.metadata.copyWith(
              color: AppColors.primaryBlue,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _nearbyTask(BuildContext context, TaskModel task) {
    return InkWell(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
      ),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.borderColor),
          boxShadow: [
            BoxShadow(
              color: AppColors.darkNavy.withOpacity(.035),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(13),
              child: Image.asset(
                _assetFor(task),
                width: 74,
                height: 67,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 11),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          task.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.cardTitle.copyWith(fontSize: 14),
                        ),
                      ),
                      if (task.isFeatured) _badge('Featured'),
                    ],
                  ),
                  const SizedBox(height: 1),
                  Text(task.storeName, style: AppTypography.metadata.copyWith(fontSize: 10.5)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 13, color: AppColors.secondaryText),
                      const SizedBox(width: 2),
                      Text(task.distance, style: AppTypography.metadata.copyWith(fontSize: 10)),
                      const Spacer(),
                      Text(
                        '₹${task.reward.toStringAsFixed(0)}',
                        style: AppTypography.money.copyWith(fontSize: 17),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _earningsStrip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFEFF7FF), Color(0xFFF9FBFF)],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFDCEBFB)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: const BoxDecoration(
              color: AppColors.primaryBlue,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.workspace_premium_rounded, color: Colors.white, size: 21),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Complete more. Unlock more.', style: AppTypography.cardTitle.copyWith(fontSize: 13.2)),
                const SizedBox(height: 2),
                Text('Your next reward level is just 2 tasks away.', style: AppTypography.metadata.copyWith(fontSize: 10.2)),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.primaryBlue),
        ],
      ),
    );
  }

  String _assetFor(TaskModel task) {
    if (task.category.contains('Product')) return 'assets/ui/product_pharmacy.png';
    if (task.category.contains('Restaurant')) return 'assets/ui/restaurant.png';
    if (task.category.contains('Survey')) return 'assets/ui/survey.png';
    return 'assets/ui/store_dmart.png';
  }

  Widget _badge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1E2),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        style: AppTypography.metadata.copyWith(
          fontSize: 8.8,
          color: AppColors.orange,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
