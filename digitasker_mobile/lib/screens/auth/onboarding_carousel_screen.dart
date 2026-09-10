import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/brand_logo.dart';
import 'login_screen.dart';
import 'multi_step_register_screen.dart';

class OnboardingCarouselScreen extends StatefulWidget {
  const OnboardingCarouselScreen({super.key});
  @override
  State<OnboardingCarouselScreen> createState() => _OnboardingCarouselScreenState();
}

class _OnboardingCarouselScreenState extends State<OnboardingCarouselScreen> {
  final PageController controller = PageController();
  int page = 0;

  final slides = const [
    ('Real Tasks. Real Insights.', 'Real Rewards.', 'Explore, perform and earn with trusted brands around you.'),
    ('Opportunities Around You.', 'Flexible Work.', 'Find store audits, surveys, product checks and shopping tasks nearby or online.'),
    ('Complete Verified Tasks.', 'Get Rewarded.', 'Submit evidence, track approvals and withdraw earnings securely.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 14, 14, 0),
              child: Row(
                children: [
                  const BrandLogo(width: 86, height: 54),
                  const Spacer(),
                  if (page != slides.length - 1)
                    TextButton(
                      onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                      child: const Text('Skip'),
                    ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: controller,
                itemCount: slides.length,
                onPageChanged: (i) => setState(() => page = i),
                itemBuilder: (_, i) {
                  final s = slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 12),
                        Text(s.$1, style: AppTypography.heroTitle.copyWith(fontSize: 29)),
                        Text(s.$2, style: AppTypography.heroTitle.copyWith(fontSize: 29, color: AppColors.primaryBlue)),
                        const SizedBox(height: 10),
                        Text(s.$3, style: AppTypography.body.copyWith(fontSize: 14.5)),
                        const SizedBox(height: 18),
                        Expanded(
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Positioned.fill(
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [AppColors.surfaceBlue, Colors.white, AppColors.blueChipBg.withOpacity(.35)],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(32),
                                  ),
                                ),
                              ),
                              Positioned(right: -4, bottom: 0, top: 12, child: Image.asset('assets/ui/hero_person.png', fit: BoxFit.contain)),
                              Positioned(left: 12, top: 38, child: _featurePill(Icons.shopping_bag_rounded, 'Shop & Review', AppColors.primaryBlue, AppColors.blueChipBg)),
                              Positioned(left: 12, top: 100, child: _featurePill(Icons.storefront_rounded, 'Store Audit', AppColors.successGreen, AppColors.greenChipBg)),
                              Positioned(left: 12, top: 162, child: _featurePill(Icons.quiz_rounded, 'Take Survey', AppColors.orange, AppColors.orangeChipBg)),
                              Positioned(left: 12, top: 224, child: _featurePill(Icons.card_giftcard_rounded, 'Earn Rewards', AppColors.purple, AppColors.purpleChipBg)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 22),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: () {
                        if (page < slides.length - 1) {
                          controller.nextPage(duration: const Duration(milliseconds: 280), curve: Curves.easeOutCubic);
                        } else {
                          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MultiStepRegisterScreen()));
                        }
                      },
                      style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(17))),
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text(page == slides.length - 1 ? 'Create Free Account' : 'Get Started'), const SizedBox(width: 8), const Icon(Icons.arrow_forward_rounded, size: 19)]),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(slides.length, (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: i == page ? 18 : 6,
                      height: 6,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(color: i == page ? AppColors.primaryBlue : const Color(0xFFD9E3F1), borderRadius: BorderRadius.circular(10)),
                    )),
                  ),
                  const SizedBox(height: 13),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Text('Already have an account? ', style: AppTypography.metadata),
                    GestureDetector(
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                      child: Text('Login', style: AppTypography.metadata.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w800)),
                    ),
                  ]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _featurePill(IconData icon, String text, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.fromLTRB(9, 8, 13, 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(13), boxShadow: [BoxShadow(color: AppColors.darkNavy.withOpacity(.09), blurRadius: 18, offset: const Offset(0, 6))]),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 30, height: 30, decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(9)), child: Icon(icon, color: color, size: 17)),
        const SizedBox(width: 8),
        Text(text, style: AppTypography.cardTitle.copyWith(fontSize: 12.5)),
      ]),
    );
  }
}
