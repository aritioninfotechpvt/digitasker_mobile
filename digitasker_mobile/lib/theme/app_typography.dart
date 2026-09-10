import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTypography {
  static TextStyle heroTitle = GoogleFonts.manrope(
    fontSize: 32,
    fontWeight: FontWeight.w800,
    height: 1.08,
    letterSpacing: -1.0,
    color: AppColors.darkNavy,
  );
  static TextStyle screenTitle = GoogleFonts.manrope(
    fontSize: 25,
    fontWeight: FontWeight.w800,
    height: 1.15,
    letterSpacing: -0.6,
    color: AppColors.darkNavy,
  );
  static TextStyle sectionTitle = GoogleFonts.manrope(
    fontSize: 19,
    fontWeight: FontWeight.w800,
    height: 1.2,
    letterSpacing: -0.35,
    color: AppColors.darkNavy,
  );
  static TextStyle cardTitle = GoogleFonts.manrope(
    fontSize: 15.5,
    fontWeight: FontWeight.w700,
    height: 1.25,
    color: AppColors.darkNavy,
  );
  static TextStyle body = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.bodyText,
  );
  static TextStyle metadata = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 1.3,
    color: AppColors.secondaryText,
  );
  static TextStyle button = GoogleFonts.inter(
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: Colors.white,
  );
  static TextStyle money = GoogleFonts.inter(
    fontSize: 19,
    fontWeight: FontWeight.w800,
    color: AppColors.successGreen,
  );
}
