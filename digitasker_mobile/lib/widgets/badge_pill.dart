import 'package:flutter/material.dart';

class BadgePill extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Color color;
  final Color textColor;

  const BadgePill({
    super.key,
    required this.label,
    this.icon,
    this.color = const Color(0xFFEEF2FF),
    this.textColor = const Color(0xFF4F46E5),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
