import 'package:flutter/material.dart';

class BrandLogo extends StatelessWidget {
  final double width;
  final double height;
  const BrandLogo({super.key, this.width = 92, this.height = 58});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.asset(
        'assets/logo.jpg',
        width: width,
        height: height,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => SizedBox(
          width: width,
          height: height,
          child: const Center(
            child: Text('DS', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF1677FF))),
          ),
        ),
      ),
    );
  }
}
