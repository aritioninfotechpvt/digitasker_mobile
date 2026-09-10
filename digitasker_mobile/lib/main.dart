import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/task_provider.dart';
import 'providers/wallet_provider.dart';
import 'screens/splash_screen.dart';
import 'theme/app_colors.dart';
import 'theme/app_spacing.dart';
import 'widgets/mobile_viewport_wrapper.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
  ));
  runApp(const DigiLitesStudioApp());
}

class DigiLitesStudioApp extends StatelessWidget {
  const DigiLitesStudioApp({super.key});

  @override
  Widget build(BuildContext context) {
    final inter = GoogleFonts.interTextTheme();
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TaskProvider()),
        ChangeNotifierProvider(create: (_) => WalletProvider()),
      ],
      child: MaterialApp(
        title: 'DigiLites Studio',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primaryBlue,
            primary: AppColors.primaryBlue,
            surface: Colors.white,
            background: AppColors.appBackground,
          ),
          textTheme: inter.apply(bodyColor: AppColors.bodyText, displayColor: AppColors.darkNavy),
          scaffoldBackgroundColor: AppColors.appBackground,
          appBarTheme: AppBarTheme(
            elevation: 0,
            scrolledUnderElevation: 0,
            backgroundColor: Colors.white,
            foregroundColor: AppColors.darkNavy,
            centerTitle: false,
            titleTextStyle: GoogleFonts.manrope(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.darkNavy,
            ),
            systemOverlayStyle: SystemUiOverlayStyle.dark,
          ),
          cardTheme: CardThemeData(
            elevation: 0,
            margin: EdgeInsets.zero,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
              side: const BorderSide(color: AppColors.borderColor),
            ),
            color: Colors.white,
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: Colors.white,
            hintStyle: GoogleFonts.inter(color: AppColors.secondaryText, fontSize: 13),
            labelStyle: GoogleFonts.inter(color: AppColors.bodyText, fontSize: 13, fontWeight: FontWeight.w600),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.primaryBlue, width: 1.6),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
              foregroundColor: Colors.white,
              elevation: 0,
              textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ),
        builder: (context, child) => MobileViewportWrapper(child: child ?? const SizedBox()),
        home: const SplashScreen(),
      ),
    );
  }
}
