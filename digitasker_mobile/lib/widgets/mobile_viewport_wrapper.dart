import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class MobileViewportWrapper extends StatelessWidget {
  final Widget child;

  const MobileViewportWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // If running on Desktop Web, wrap in a centered 430px mobile viewport frame
    return LayoutBuilder(
      builder: (context, constraints) {
        if (kIsWeb && constraints.maxWidth > 600) {
          return Scaffold(
            backgroundColor: const Color(0xFF0E1726),
            body: Center(
              child: Container(
                width: 430,
                height: constraints.maxHeight > 900 ? 880 : constraints.maxHeight,
                margin: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: AppColors.appBackground,
                  borderRadius: BorderRadius.circular(36),
                  border: Border.all(color: const Color(0xFF334155), width: 8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.5),
                      blurRadius: 40,
                      offset: const Offset(0, 20),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: child,
                ),
              ),
            ),
          );
        }
        return child;
      },
    );
  }
}
