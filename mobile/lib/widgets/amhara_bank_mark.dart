import 'package:flutter/material.dart';

class AmharaBankMark extends StatelessWidget {
  const AmharaBankMark({
    super.key,
    this.width = 96,
  });

  final double width;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/amhara-bank-mark.png',
      width: width,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) {
        return SizedBox(
          width: width,
          child: const Icon(
            Icons.account_balance_rounded,
            size: 48,
          ),
        );
      },
    );
  }
}
