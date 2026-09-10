import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../data/demo_data.dart';
import '../../models/task_model.dart';
import '../../providers/task_provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/animated_press.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/fade_slide_transition.dart';
import 'find_tasks_screen.dart';
import 'my_tasks_screen.dart';
import 'notifications_screen.dart';
import 'offline_mode_screen.dart';
import 'profile_screen.dart';
import 'task_detail_screen.dart';
import 'training_screen.dart';
import 'wallet_screen.dart';

class TaskerHomeScreen extends StatefulWidget {
  const TaskerHomeScreen({super.key});

  @override
  State<TaskerHomeScreen> createState() => _TaskerHomeScreenState();
}

class _TaskerHomeScreenState extends State<TaskerHomeScreen> {
  int _selectedIndex = 0;
  DateTime? _lastBackPressTime;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final taskProvider = Provider.of<TaskProvider>(context, listen: false);
      taskProvider.fetchFeaturedTasks();
      taskProvider.fetchUserTasks();
      
      // Real-time admin task creation listener & polling
      taskProvider.startPollingTasks(onNewTaskAlert: (newTask) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF0F172A),
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 5),
              content: Row(
                children: [
                  const Icon(Icons.new_releases_rounded, color: Color(0xFF38BDF8), size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '🔔 New Task Added by Admin!',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                        ),
                        Text(
                          '${newTask.title} - Earn ₹${newTask.reward.toStringAsFixed(0)}',
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              action: SnackBarAction(
                label: 'VIEW',
                textColor: const Color(0xFF38BDF8),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => TaskDetailScreen(task: newTask)),
                  );
                },
              ),
            ),
          );
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _HomeTab(),
      const FindTasksScreen(),
      const MyTasksScreen(),
      const TrainingScreen(),
      const OfflineModeScreen(),
      const WalletScreen(),
      const NotificationsScreen(),
      const ProfileScreen(),
    ];

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (_selectedIndex != 0) {
          setState(() => _selectedIndex = 0);
          return;
        }
        final now = DateTime.now();
        if (_lastBackPressTime == null || now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
          _lastBackPressTime = now;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Press back again to exit DigiLites Studio'),
              duration: Duration(seconds: 2),
            ),
          );
          return;
        }
        SystemNavigator.pop();
      },
      child: Scaffold(
        backgroundColor: AppColors.appBackground,
        drawer: AppSideDrawer(
          onTabSelected: (index) => setState(() => _selectedIndex = index),
        ),
        body: IndexedStack(index: _selectedIndex, children: pages),
        bottomNavigationBar: _BottomNav(
          selectedIndex: _selectedIndex > 4 ? 4 : _selectedIndex,
          onChanged: (index) {
            int mappedIndex = index;
            if (index == 2) mappedIndex = 2; // My Tasks
            if (index == 3) mappedIndex = 5; // Wallet
            if (index == 4) mappedIndex = 7; // Profile
            setState(() => _selectedIndex = mappedIndex);
          },
        ),
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
      (Icons.search_rounded, Icons.search_rounded, 'Find'),
      (Icons.assignment_outlined, Icons.assignment_rounded, 'My Tasks'),
      (Icons.account_balance_wallet_outlined, Icons.account_balance_wallet_rounded, 'Wallet'),
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

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  @override
  Widget build(BuildContext context) {
    final taskProvider = Provider.of<TaskProvider>(context);
    final displayTasks = taskProvider.availableTasks.isNotEmpty 
        ? taskProvider.availableTasks 
        : (taskProvider.featuredTasks.isNotEmpty ? taskProvider.featuredTasks : DemoData.tasks);

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
                const _HeroImageSlider(),
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
                ...displayTasks.take(4).toList().asMap().entries.map(
                      (entry) => Padding(
                        padding: const EdgeInsets.only(bottom: 11),
                        child: _nearbyTask(context, entry.value, entry.key),
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
              textInputAction: TextInputAction.search,
              onSubmitted: (query) {
                if (query.trim().isNotEmpty) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => FindTasksScreen(initialSearchQuery: query.trim()),
                    ),
                  );
                }
              },
              decoration: InputDecoration(
                hintText: 'Search tasks, brands or locations...',
                hintStyle: AppTypography.metadata.copyWith(fontSize: 12, color: const Color(0xFF64748B)),
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF475569), size: 21),
                suffixIcon: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const FindTasksScreen(),
                      ),
                    );
                  },
                  child: Container(
                    width: 38,
                    margin: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEAF3FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.tune_rounded, color: AppColors.primaryBlue, size: 19),
                  ),
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
    final taskProvider = Provider.of<TaskProvider>(context);
    final hasUnread = taskProvider.hasUnreadNotifications;

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
        if (hasUnread)
          Positioned(
            right: 6,
            top: 5,
            child: Container(
              width: 9,
              height: 9,
              decoration: BoxDecoration(
                color: const Color(0xFFFF4D4F),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 1.5),
              ),
            ),
          ),
      ],
    );
  }

  Widget _categoryGrid(BuildContext context) {
    final categories = [
      (Icons.search_rounded, 'Mystery Audit', AppColors.primaryBlue, const Color(0xFFEBF3FE)),
      (Icons.share_rounded, 'Social Media', const Color(0xFF00B2A9), const Color(0xFFE6F7F6)),
      (Icons.shopping_cart_rounded, 'E-commerce', AppColors.orange, const Color(0xFFFFF4EB)),
      (Icons.star_rounded, 'Google Rating', const Color(0xFF722ED1), const Color(0xFFF9F0FF)),
      (Icons.movie_rounded, 'IMDb & Movie', const Color(0xFFEB2F96), const Color(0xFFFFF0F6)),
      (Icons.poll_rounded, 'Survey', const Color(0xFF13C2C2), const Color(0xFFE6FFFB)),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Popular Categories',
          style: AppTypography.cardTitle.copyWith(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.05,
          ),
          itemCount: categories.length,
          itemBuilder: (ctx, i) {
            final item = categories[i];
            return AnimatedPress(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => FindTasksScreen(initialCategory: item.$2),
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.darkNavy.withOpacity(.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: item.$4,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(item.$1, color: item.$3, size: 21),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item.$2,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.metadata.copyWith(
                        color: AppColors.darkNavy,
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _sectionHeader(
    BuildContext context, {
    required String title,
    required String action,
    required VoidCallback onTap,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: AppTypography.cardTitle.copyWith(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        GestureDetector(
          onTap: onTap,
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

  Widget _nearbyTask(BuildContext context, TaskModel task, int index) {
    return FadeSlideTransition(
      delayIndex: index + 1,
      child: AnimatedPress(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
        ),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderColor),
            boxShadow: [
              BoxShadow(
                color: AppColors.darkNavy.withOpacity(.04),
                blurRadius: 12,
                offset: const Offset(0, 5),
              ),
            ],
          ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: const Color(0xFFF0F5FF),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.storefront_rounded, color: AppColors.primaryBlue, size: 26),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.blueChipBg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          task.category.toUpperCase(),
                          style: AppTypography.metadata.copyWith(
                            color: AppColors.primaryBlue,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '• ${task.duration}',
                        style: AppTypography.metadata.copyWith(fontSize: 10),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    task.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.cardTitle.copyWith(fontSize: 13.5),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    task.location,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.metadata.copyWith(fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹${task.reward.toStringAsFixed(0)}',
                  style: AppTypography.cardTitle.copyWith(
                    color: AppColors.successGreen,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${task.distance} • ${task.duration}',
                  style: AppTypography.metadata.copyWith(
                    color: AppColors.orange,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}

  Widget _earningsStrip() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF334155),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.stars_rounded, color: Color(0xFFF59E0B), size: 26),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Earn More With Verified Audits',
                  style: AppTypography.cardTitle.copyWith(color: Colors.white, fontSize: 13.5),
                ),
                const SizedBox(height: 3),
                Text(
                  'Complete profile & KYC to get instant payouts.',
                  style: AppTypography.metadata.copyWith(color: const Color(0xFF94A3B8), fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroImageSlider extends StatefulWidget {
  const _HeroImageSlider();

  @override
  State<_HeroImageSlider> createState() => _HeroImageSliderState();
}

class _HeroImageSliderState extends State<_HeroImageSlider> {
  final PageController _controller = PageController();
  int _currentPage = 0;
  Timer? _timer;

  final List<Map<String, dynamic>> _slides = [
    {
      'tag': '✨ HIGH REWARD AUDITS',
      'title': 'Earn up to ₹1,500\nper Store Audit!',
      'subtitle': 'Verified mystery audits nearby in Zirakpur.',
      'buttonText': 'Explore Audits',
      'colors': [const Color(0xFF0D5AAA), const Color(0xFF0D83DF)],
      'targetScreen': 'find',
    },
    {
      'tag': '🚀 INSTANT PAYOUTS',
      'title': 'Fast-Track KYC &\nDirect UPI Transfer!',
      'subtitle': 'Withdraw your earnings safely into your bank account.',
      'buttonText': 'Verify Profile',
      'colors': [const Color(0xFF15803D), const Color(0xFF22C55E)],
      'targetScreen': 'profile',
    },
    {
      'tag': '🎓 CERTIFIED TASKER',
      'title': 'Complete Training &\nEarn 20% Bonus!',
      'subtitle': 'Unlock premium corporate audit tasks.',
      'buttonText': 'Start Training',
      'colors': [const Color(0xFF6D28D9), const Color(0xFF9333EA)],
      'targetScreen': 'training',
    },
    {
      'tag': '🔥 LIVE TASKS',
      'title': '100+ Active Tasks\nWaiting For You!',
      'subtitle': 'Submit photos & receipts to claim rewards.',
      'buttonText': 'Find Tasks',
      'colors': [const Color(0xFFC2410C), const Color(0xFFF97316)],
      'targetScreen': 'find',
    },
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (_controller.hasClients) {
        final nextPage = (_currentPage + 1) % _slides.length;
        _controller.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 380),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onSlideTap(String targetScreen) {
    if (targetScreen == 'find') {
      Navigator.push(context, MaterialPageRoute(builder: (_) => const FindTasksScreen()));
    } else if (targetScreen == 'profile') {
      Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
    } else if (targetScreen == 'training') {
      Navigator.push(context, MaterialPageRoute(builder: (_) => const TrainingScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 164,
          child: PageView.builder(
            controller: _controller,
            itemCount: _slides.length,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemBuilder: (context, index) {
              final slide = _slides[index];
              final List<Color> colors = slide['colors'];
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: colors,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: colors.first.withOpacity(.25),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
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
                        top: 15,
                        right: 112,
                        bottom: 12,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(.18),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                slide['tag'],
                                style: AppTypography.metadata.copyWith(
                                  color: Colors.white,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: .5,
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              slide['title'],
                              style: AppTypography.screenTitle.copyWith(
                                color: Colors.white,
                                fontSize: 20,
                                height: 1.05,
                                letterSpacing: -.6,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              slide['subtitle'],
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.metadata.copyWith(
                                color: Colors.white.withOpacity(.92),
                                fontSize: 10.5,
                              ),
                            ),
                            const Spacer(),
                            SizedBox(
                              height: 32,
                              child: ElevatedButton(
                                onPressed: () => _onSlideTap(slide['targetScreen']),
                                style: ElevatedButton.styleFrom(
                                  elevation: 0,
                                  backgroundColor: Colors.white,
                                  foregroundColor: AppColors.darkNavy,
                                  padding: const EdgeInsets.symmetric(horizontal: 13),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      slide['buttonText'],
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.arrow_forward_rounded, size: 14),
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
            },
          ),
        ),
        const SizedBox(height: 9),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            _slides.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 240),
              width: index == _currentPage ? 18 : 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              decoration: BoxDecoration(
                color: index == _currentPage ? AppColors.primaryBlue : const Color(0xFFD0D7E2),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
