import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../widgets/brand_logo.dart';
import 'auth/onboarding_carousel_screen.dart';
import 'user/tasker_home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    bool loggedIn = false;
    try { loggedIn = await auth.initAuth(); } catch (_) {}
    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => loggedIn ? const TaskerHomeScreen() : const OnboardingCarouselScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: LinearGradient(colors: [Colors.white, Color(0xFFF0F7FF)], begin: Alignment.topCenter, end: Alignment.bottomCenter)),
        child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: AppColors.primaryBlue.withOpacity(.10), blurRadius: 28, offset: const Offset(0, 10))]), child: const BrandLogo(width: 118, height: 74)),
          const SizedBox(height: 18),
          Text('DigiLites Studio', style: AppTypography.screenTitle),
          const SizedBox(height: 5),
          Text('Real Tasks. Real Insights. Real Rewards.', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w700)),
          const SizedBox(height: 28),
          const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.3, color: AppColors.primaryBlue)),
        ])),
      ),
    );
  }
}
