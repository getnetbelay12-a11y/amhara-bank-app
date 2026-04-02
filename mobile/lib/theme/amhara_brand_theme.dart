import 'package:flutter/material.dart';

const Color abayPrimary = Color(0xFF0A4FA3);
const Color abayPrimaryDark = Color(0xFF083B79);
const Color abaySecondary = Color(0xFF3E7EDB);
const Color abayAccent = Color(0xFFF2C94C);
const Color abayBackground = Colors.white;
const Color abaySurfaceAlt = Color(0xFFEAF1FB);
const Color abayBorder = Color(0xFFD6E1F1);
const Color abayCard = Colors.white;
const Color abayText = Color(0xFF1E1E1E);
const Color abayTextSoft = Color(0xFF63758A);
const Color abaySuccess = Color(0xFF2F7A57);
const Color abaySuccessBg = Color(0xFFE7F2EC);
const Color abayWarning = Color(0xFFB5852F);
const Color abayWarningBg = Color(0xFFF9F0DE);
const Color abayDanger = Color(0xFFB23A3A);
const Color abayDangerBg = Color(0xFFF9E8E8);
const Color abayInfo = abaySecondary;
const Color abayInfoBg = Color(0xFFE7F0FC);
const Color abaySecondarySoft = Color(0xFFDCE8FA);
const Color abayAccentSoft = Color(0xFFFFF4CC);
const Color abayShadow = Color(0x140A2A4A);
const Color abayPrimarySoft = Color(0xFFE6EFFB);
const Color abayBorderStrong = Color(0xFFB6C8E3);
const Color abaySurfaceElevated = Color(0xFFF8FAFE);
const Color abayTextMutedDark = Color(0xFF4C6178);
const Color abayAccentText = Color(0xFF7A5A00);
const Color abayTopBarForeground = Color(0xFFF2C94C);
const Color abayTopBarMuted = Color(0xFFF9E7A3);
const Color abayNavUnselected = Color(0xFFD9E5F6);

const Color abayPrimaryDeep = abayPrimaryDark;
const Color abayRoseTint = abaySecondarySoft;
const Color abaySurfaceTint = abaySurfaceAlt;
const Color abayMutedText = abayTextSoft;

final ThemeData amharaBrandTheme = ThemeData(
  useMaterial3: true,
  primaryColor: abayPrimary,
  scaffoldBackgroundColor: abayBackground,
  cardColor: abayCard,
  colorScheme: const ColorScheme(
    brightness: Brightness.light,
    primary: abayPrimary,
    onPrimary: Colors.white,
    secondary: abaySecondary,
    onSecondary: Colors.white,
    error: abayDanger,
    onError: Colors.white,
    surface: abayCard,
    onSurface: abayText,
    tertiary: abayAccent,
    onTertiary: abayText,
  ),
  textTheme: const TextTheme(
    headlineSmall: TextStyle(color: abayText, fontWeight: FontWeight.w700, fontSize: 28),
    titleLarge: TextStyle(color: abayText, fontWeight: FontWeight.w700, fontSize: 20),
    titleMedium: TextStyle(color: abayText, fontWeight: FontWeight.w600),
    bodyLarge: TextStyle(color: abayText, fontWeight: FontWeight.w400),
    bodyMedium: TextStyle(color: abayText, fontWeight: FontWeight.w400),
    bodySmall: TextStyle(color: abayTextSoft, fontWeight: FontWeight.w400),
    labelLarge: TextStyle(color: abayPrimary, fontWeight: FontWeight.w700),
  ),
  cardTheme: const CardThemeData(
    elevation: 0,
    color: abayCard,
    margin: EdgeInsets.zero,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.all(Radius.circular(16)),
      side: BorderSide(color: abayBorder),
    ),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: abayPrimary,
    foregroundColor: abayTopBarForeground,
    elevation: 0,
    centerTitle: false,
    shape: Border(
      bottom: BorderSide(
        color: abayAccent,
        width: 4,
      ),
    ),
    titleTextStyle: TextStyle(
      color: abayTopBarForeground,
      fontWeight: FontWeight.w700,
      fontSize: 20,
    ),
    iconTheme: IconThemeData(
      color: abayTopBarForeground,
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: abaySurfaceAlt,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: abayBorder),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: abayBorder),
    ),
    focusedBorder: const OutlineInputBorder(
      borderRadius: BorderRadius.all(Radius.circular(16)),
      borderSide: BorderSide(color: abaySecondary, width: 1.6),
    ),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: abayPrimary,
      foregroundColor: Colors.white,
      minimumSize: const Size.fromHeight(48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      textStyle: const TextStyle(fontWeight: FontWeight.w700),
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: abayPrimary,
      side: const BorderSide(color: abayPrimary),
      minimumSize: const Size.fromHeight(48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      textStyle: const TextStyle(fontWeight: FontWeight.w700),
    ),
  ),
  textButtonTheme: TextButtonThemeData(
    style: TextButton.styleFrom(
      foregroundColor: abayPrimary,
      textStyle: const TextStyle(fontWeight: FontWeight.w700),
    ),
  ),
  filledButtonTheme: FilledButtonThemeData(
    style: FilledButton.styleFrom(
      backgroundColor: abayPrimary,
      foregroundColor: Colors.white,
      minimumSize: const Size.fromHeight(48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      textStyle: const TextStyle(fontWeight: FontWeight.w700),
    ),
  ),
  bottomNavigationBarTheme: const BottomNavigationBarThemeData(
    backgroundColor: abayPrimary,
    selectedItemColor: abayAccent,
    unselectedItemColor: abayNavUnselected,
    elevation: 10,
    type: BottomNavigationBarType.fixed,
  ),
  navigationBarTheme: const NavigationBarThemeData(
    backgroundColor: abayPrimary,
    indicatorColor: Color(0x33F2C94C),
    labelTextStyle: WidgetStatePropertyAll(
      TextStyle(fontWeight: FontWeight.w600),
    ),
  ),
  chipTheme: ChipThemeData(
    backgroundColor: abayAccentSoft,
    selectedColor: abayAccentSoft,
    secondarySelectedColor: abayAccentSoft,
    side: const BorderSide(color: abayBorder),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
    labelStyle: const TextStyle(color: abayAccentText, fontWeight: FontWeight.w600),
  ),
  dividerTheme: const DividerThemeData(
    color: abayBorder,
    thickness: 1,
    space: 1,
  ),
);
