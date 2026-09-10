import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTypography {
  // Hero / Onboarding Title (Manrope 800, 30-36px, 1.08 height)
  static TextStyle heroTitle = GoogleFonts.manrope(
    fontSize: 32,
    fontWeight: FontWeight.w800,
    height: 1.08,
    letterSpacing: -0.5,
    color: AppColors.darkNavy,
  );

  // Screen Title (Manrope 700-800, 24-28px)
  static TextStyle screenTitle = GoogleFonts.manrope(
    fontSize: 26,
    fontWeight: FontWeight.w800,
    color: AppColors.darkNavy,
  );

  // Section Title (Manrope 700, 18-22px)
  static TextStyle sectionTitle = GoogleFonts.manrope(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: AppColors.darkNavy,
  );

  // Card Title (Manrope 700, 16-18px)
  static TextStyle cardTitle = GoogleFonts.manrope(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    color: AppColors.darkNavy,
  );

  // Body Text (Inter 400, 14-16px, 1.45 height)
  static TextStyle body = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.45,
    color: AppColors.bodyText,
  );

  // Secondary / Metadata (Inter 400-500, 12-13px)
  static TextStyle metadata = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.secondaryText,
  );

  // Button Label (Inter 600-700, 15-16px)
  static TextStyle button = GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );

  // Money / Reward Text (Inter 700, 18-24px)
  static TextStyle money = GoogleFonts.inter(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: AppColors.successGreen,
  );
}
