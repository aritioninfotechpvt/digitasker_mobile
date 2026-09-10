import 'package:flutter/material.dart';
import '../../models/task_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/animated_press.dart';
import 'multi_step_task_completion_screen.dart';

class TaskDetailScreen extends StatefulWidget {
  final TaskModel task;
  const TaskDetailScreen({super.key, required this.task});

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.task;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.darkNavy),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Task Details', style: AppTypography.screenTitle.copyWith(fontSize: 18)),
            Text('InsightLoop USER Workspace', style: AppTypography.metadata.copyWith(fontSize: 11, color: const Color(0xFF64748B))),
          ],
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.share_outlined, color: AppColors.darkNavy)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.bookmark_border_rounded, color: AppColors.darkNavy)),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // QC Revision Requested Banner
                  _buildQCRevisionBanner(context),

                  // Main Store Header Card
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Store Image Thumbnail
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            t.imageUrl.isNotEmpty ? t.imageUrl : 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              height: 180,
                              color: AppColors.darkNavy,
                              alignment: Alignment.center,
                              child: const Icon(Icons.storefront_rounded, size: 54, color: Colors.white54),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Badges Row
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(6)),
                              child: const Text('🇮🇳 Country: India', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFF3E8FF), borderRadius: BorderRadius.circular(6)),
                              child: Text(t.locationType == 'Online' ? 'Digital Task' : 'Physical / Digital', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF7E22CE))),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(6)),
                              child: Text(t.category, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0369A1))),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Title & Partner Subtitle
                        Text(t.title, style: AppTypography.screenTitle.copyWith(fontSize: 20)),
                        const SizedBox(height: 3),
                        Text('Verified Brand · ${t.category}', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w700, fontSize: 13.5)),
                        const SizedBox(height: 12),

                        // Metadata line
                        Wrap(
                          spacing: 16,
                          runSpacing: 8,
                          children: [
                            _buildMetaItem(Icons.public_rounded, t.location),
                            _buildMetaItem(Icons.timer_outlined, t.duration),
                            _buildMetaItem(Icons.people_outline_rounded, '16 slots left'),
                          ],
                        ),
                        const SizedBox(height: 8),

                        Row(
                          children: [
                            const Icon(Icons.calendar_month_outlined, size: 15, color: Color(0xFF64748B)),
                            const SizedBox(width: 5),
                            Text('Task Starts: 2026-09-01 · ⏳ Expires: 2026-09-30', style: AppTypography.metadata.copyWith(fontSize: 12)),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Reward Payout
                        Text(
                          '₹${t.reward.toStringAsFixed(0)}',
                          style: AppTypography.screenTitle.copyWith(fontSize: 26, color: AppColors.successGreen),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Navigation Tabs Bar (Overview / Eligibility & Rules / Required Submissions / Location)
                  Container(
                    color: Colors.white,
                    child: TabBar(
                      controller: _tabController,
                      isScrollable: true,
                      labelColor: AppColors.primaryBlue,
                      unselectedLabelColor: const Color(0xFF64748B),
                      indicatorColor: AppColors.primaryBlue,
                      indicatorWeight: 3,
                      labelStyle: AppTypography.cardTitle.copyWith(fontSize: 13),
                      unselectedLabelStyle: AppTypography.body.copyWith(fontSize: 13),
                      tabs: const [
                        Tab(text: 'Overview'),
                        Tab(text: 'Eligibility & Rules'),
                        Tab(text: 'Required Submissions'),
                        Tab(text: 'Location / Platform'),
                      ],
                    ),
                  ),

                  // Tab Views Content
                  Container(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Overview Content
                        Text('Task Description', style: AppTypography.sectionTitle.copyWith(fontSize: 16)),
                        const SizedBox(height: 6),
                        Text(
                          'Complete this ${t.category} task for Verified Brand. Ensure you satisfy all eligibility criteria and upload requested proof before completing your slot.',
                          style: AppTypography.body.copyWith(fontSize: 13.5, height: 1.45),
                        ),
                        const SizedBox(height: 20),

                        // Eligibility Criteria
                        Text('Eligibility Criteria', style: AppTypography.sectionTitle.copyWith(fontSize: 16)),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(8)),
                              child: const Row(
                                children: [
                                  Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF15803D)),
                                  SizedBox(width: 5),
                                  Text('Country: India 🇮🇳', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(8)),
                              child: const Row(
                                children: [
                                  Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF15803D)),
                                  SizedBox(width: 5),
                                  Text('KYC Verified', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Required Evidence Submissions (5)
                        Text('Required Evidence Submissions (5)', style: AppTypography.sectionTitle.copyWith(fontSize: 16)),
                        const SizedBox(height: 10),
                        _buildSubmissionItem('Store front photo', isRequired: true),
                        _buildSubmissionItem('Product shelf & display photo', isRequired: true),
                        _buildSubmissionItem('Staff courtesy check & pricing notes', isRequired: true),
                        _buildSubmissionItem('5-Star Google Review & Profile Handle', isRequired: true),
                        _buildSubmissionItem('Purchase invoice or receipt photo', isRequired: false),

                        const SizedBox(height: 20),

                        // Target Platform / Location Card
                        _buildTargetLocationCard(t),
                        const SizedBox(height: 16),

                        // About the Brand & Company Card
                        _buildAboutBrandCard(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
              boxShadow: [BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, -4))],
            ),
            child: SafeArea(
              top: false,
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: AnimatedPress(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => MultiStepTaskCompletionScreen(task: t)),
                    );
                  },
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => MultiStepTaskCompletionScreen(task: t)),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryBlue,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Start Task & Upload Evidence', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQCRevisionBanner(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 12),
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
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MultiStepTaskCompletionScreen(task: widget.task)),
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

  Widget _buildMetaItem(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: const Color(0xFF64748B)),
        const SizedBox(width: 5),
        Text(label, style: AppTypography.metadata.copyWith(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.darkNavy)),
      ],
    );
  }

  Widget _buildSubmissionItem(String title, {required bool isRequired}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle_outline_rounded, color: AppColors.primaryBlue, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(title, style: AppTypography.body.copyWith(fontWeight: FontWeight.w600, fontSize: 13)),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: isRequired ? const Color(0xFFFEE2E2) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              isRequired ? 'Required' : 'Optional',
              style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: isRequired ? const Color(0xFFDC2626) : const Color(0xFF64748B)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTargetLocationCard(TaskModel task) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Target Platform / Location', style: AppTypography.cardTitle.copyWith(fontSize: 15)),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                const Icon(Icons.location_on_rounded, color: Color(0xFFDC2626), size: 24),
                const SizedBox(height: 6),
                Text('Verified Brand', style: AppTypography.cardTitle.copyWith(fontSize: 14)),
                const SizedBox(height: 2),
                Text('${task.locationType} · ${task.location}', style: AppTypography.metadata.copyWith(fontSize: 12)),
                const SizedBox(height: 4),
                const Text('🇮🇳 India', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAboutBrandCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('About the Brand & Company', style: AppTypography.cardTitle.copyWith(fontSize: 15)),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFE0F2FE),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.verified_user_rounded, color: AppColors.primaryBlue, size: 24),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Verified Brand', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkNavy)),
                    SizedBox(height: 2),
                    Text('✓ Verified Partner Brand', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Leading brand analytics and retail mystery audit studio delivering real-time field data & verified reviews across India.',
            style: AppTypography.metadata.copyWith(fontSize: 12, height: 1.4),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFCBD5E1)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('🌐 Visit Official Website', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primaryBlue)),
                  SizedBox(width: 4),
                  Icon(Icons.open_in_new_rounded, size: 15, color: AppColors.primaryBlue),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
