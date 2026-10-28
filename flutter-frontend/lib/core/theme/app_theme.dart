import 'package:flutter/material.dart';

class AppTheme {
  // Brand HSL Harmonious Colors
  static const Color primaryGreen = Color(0xFF1B5E20);      // Deep Forest Green
  static const Color accentEmerald = Color(0xFF2E7D32);     // Vibrant Green
  static const Color secondaryAmber = Color(0xFFE65100);    // Warm harvest Orange
  
  static const Color lightBackground = Color(0xFFF9FBE7);   // Mild cream-green shade
  static const Color lightSurface = Colors.white;
  
  static const Color darkBackground = Color(0xFF121212);    // Premium OLED black
  static const Color darkSurface = Color(0xFF1E1E1E);       // Charcoal gray cards

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryGreen,
      scaffoldBackgroundColor: lightBackground,
      colorScheme: const ColorScheme.light(
        primary: primaryGreen,
        secondary: secondaryAmber,
        surface: lightSurface,
        onPrimary: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      cardTheme: CardTheme(
        color: lightSurface,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: accentEmerald,
      scaffoldBackgroundColor: darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: accentEmerald,
        secondary: secondaryAmber,
        surface: darkSurface,
        onPrimary: Colors.black,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkSurface,
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      cardTheme: CardTheme(
        color: darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentEmerald,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
      ),
    );
  }
}
