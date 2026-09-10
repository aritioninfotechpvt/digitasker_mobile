import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_typography.dart';
import '../../widgets/section_header.dart';
import '../user/tasker_home_screen.dart';

class VendorDashboardScreen extends StatefulWidget {
  const VendorDashboardScreen({super.key});

  @override
  State<VendorDashboardScreen> createState() => _VendorDashboardScreenState();
}

class _VendorDashboardScreenState extends State<VendorDashboardScreen> {
  int _selectedIndex = 0;

  final List<Map<String, dynamic>> _members = [
    {
      'name': 'Rahul Sharma',
      'city': 'Zirakpur',
      'activeTasks': 3,
      'score': '4.9 ★',
      'available': true
    },
    {
      'name': 'Priya Patel',
      'city': 'Chandigarh',
      'activeTasks': 1,
      'score': '4.8 ★',
      'available': true
    },
    {
      'name': 'Amit Kumar',
      'city': 'Delhi NCR',
      'activeTasks': 0,
      'score': '4.7 ★',
      'available': false
    },
  ];

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      _buildVendorDashboardTab(),
      _buildVendorTasksTab(),
      _buildMembersTab(),
      _buildPaymentsTab(),
      _buildVendorProfileTab(),
    ];

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.purpleChipBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'VENDOR PORTAL',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: AppColors.purple,
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Agency Dashboard',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.darkNavy,
                fontSize: 16,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.darkNavy,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded, color: AppColors.primaryBlue),
            tooltip: 'Switch to Tasker Mode',
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const TaskerHomeScreen()),
              );
            },
          ),
        ],
      ),
      body: pages[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.borderColor)),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          elevation: 0,
          selectedItemColor: AppColors.purple,
          unselectedItemColor: AppColors.secondaryText,
          onTap: (idx) => setState(() => _selectedIndex = idx),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard_rounded),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.assignment_outlined),
              activeIcon: Icon(Icons.assignment_rounded),
              label: 'Tasks',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.group_outlined),
              activeIcon: Icon(Icons.group_rounded),
              label: 'Members',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.payments_outlined),
              activeIcon: Icon(Icons.payments_rounded),
              label: 'Payments',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVendorDashboardTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vendor Balance Header Box
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.darkNavy,
              borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Vendor Agency Balance',
                        style: TextStyle(color: Colors.white70, fontSize: 13)),
                    SizedBox(height: 4),
                    Text(
                      '₹45,200',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Chip(
                  label: Text('ACTIVE VENDOR'),
                  backgroundColor: Colors.white24,
                  labelStyle: TextStyle(color: Colors.white, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Stats Grid
          Row(
            children: [
              _buildVendorStatCard('24', 'Assigned Tasks', AppColors.primaryBlue),
              const SizedBox(width: 12),
              _buildVendorStatCard('18', 'Completed', AppColors.successGreen),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildVendorStatCard('6', 'Pending QC', AppColors.orange),
              const SizedBox(width: 12),
              _buildVendorStatCard('₹12,400', 'Member Payout Due', AppColors.purple),
            ],
          ),
          const SizedBox(height: 24),

          const SectionHeader(title: 'Member Team Overview'),
          const SizedBox(height: 12),
          _buildMembersList(),
        ],
      ),
    );
  }

  Widget _buildVendorStatCard(String val, String label, Color accent) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(val,
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: accent)),
            const SizedBox(height: 4),
            Text(label, style: AppTypography.metadata),
          ],
        ),
      ),
    );
  }

  Widget _buildVendorTasksTab() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Agency Task Allocation', style: AppTypography.sectionTitle),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: 3,
              itemBuilder: (ctx, i) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderColor),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Retail Audit #${101 + i}',
                                style: AppTypography.cardTitle),
                            const Text('Zirakpur • DMart Store',
                                style: TextStyle(fontSize: 12)),
                            const SizedBox(height: 4),
                            Text('Reward: ₹${(i + 1) * 300}',
                                style: AppTypography.money),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.purple,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Assign'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMembersTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Agency Field Members', style: AppTypography.sectionTitle),
          const SizedBox(height: 16),
          _buildMembersList(),
        ],
      ),
    );
  }

  Widget _buildMembersList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _members.length,
      itemBuilder: (ctx, i) {
        final m = _members[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderColor),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.purpleChipBg,
                child: Text(
                  m['name'][0],
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, color: AppColors.purple),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(m['name'] as String, style: AppTypography.cardTitle),
                    Text('${m['city']} • ${m['activeTasks']} active tasks',
                        style: AppTypography.metadata),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.greenChipBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  m['score'] as String,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.successGreen,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPaymentsTab() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontalPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Agency Settlements & Payouts', style: AppTypography.sectionTitle),
          const SizedBox(height: 16),
          const ListTile(
            tileColor: Colors.white,
            title: Text('Admin → Vendor Settlement'),
            subtitle: Text('08 Sep 2026 • Verified'),
            trailing: Text('+₹24,000',
                style: TextStyle(
                    color: AppColors.successGreen,
                    fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 8),
          const ListTile(
            tileColor: Colors.white,
            title: Text('Vendor → Member Payout'),
            subtitle: Text('Rahul Sharma • 05 Sep 2026'),
            trailing: Text('-₹1,200',
                style: TextStyle(
                    color: AppColors.orange, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildVendorProfileTab() {
    return const Center(
      child: Text('Vendor Agency Profile Settings'),
    );
  }
}
