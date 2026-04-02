# Amhara Bank Digital Banking UI Kit

This document is the download-ready design and Flutter handoff for the Amhara Bank mobile app UI system.

## Figma File

File name:

`Amhara Bank Digital Banking UI Kit`

## Figma Pages

1. `00 Cover`
2. `01 Foundations`
3. `02 Components`
4. `03 Mobile Screens`
5. `04 Console Screens`
6. `05 Flows`
7. `06 Archive`

## 01 Foundations

### Colors

- `Brand/Blue/500` `#0A4FA3`
- `Brand/Blue/700` `#083E82`
- `Brand/Yellow/500` `#F5C242`
- `Demo/New/LightBlue` `#3E7EDB`
- `Neutral/White` `#FFFFFF`
- `Neutral/Background` `#F5F7FA`
- `Neutral/Text/Primary` `#1E1E1E`
- `Neutral/Text/Secondary` `#6B7280`
- `Neutral/Border` `#E5E7EB`
- `State/Success` `#16A34A`
- `State/Warning` `#F59E0B`
- `State/Error` `#DC2626`

### Typography

- `Display/Balance` `28 Bold`
- `Heading/H1` `20 Semibold`
- `Heading/H2` `16 Semibold`
- `Body/Default` `14 Regular`
- `Body/Small` `12 Regular`
- `Label/Button` `16 Semibold`

### Spacing

Use `8pt` grid:

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`

### Radius

- `Small` `8`
- `Medium` `12`
- `Large` `16`
- `Pill` `999`

### Shadows

- `Card/Default` `y=4 blur=12 opacity 8%`
- `Floating/Action` `y=8 blur=20 opacity 12%`

## 02 Components

Create reusable components with exact naming.

### Navigation

- `AppBar/Root`
- `AppBar/Detail`
- `TabBar/Bottom`
- `Sidebar/Console`

### Cards

- `Card/Balance`
- `Card/Insight`
- `Card/Promo`
- `Card/KPI`
- `Card/LoanStatus`
- `Card/ShareholderSummary`

### Buttons

- `Button/Primary`
- `Button/Secondary`
- `Button/Ghost`
- `Button/Icon`
- `Button/FAB`

### Inputs

- `Input/Text`
- `Input/Dropdown`
- `Input/Search`
- `Input/Multiline`
- `Input/Upload`

### Rows

- `Row/ListItem`
- `Row/Transaction`
- `Row/Notification`
- `Row/ChatConversation`
- `Row/SupportQueue`

### Badges

- `Badge/New`
- `Badge/Warning`
- `Badge/Success`
- `Badge/Error`
- `Badge/Status`

## 03 Mobile Screens

Frame size:

`390 x 844`

Screen naming:

- `MOB/Home`
- `MOB/Payments`
- `MOB/Transactions`
- `MOB/Loans`
- `MOB/LoanDetail`
- `MOB/ChatList`
- `MOB/ChatDetail`
- `MOB/Notifications`
- `MOB/Profile`
- `MOB/KYC`
- `MOB/ShareholderDashboard`
- `MOB/Voting`
- `MOB/SchoolPayment`

## 04 Console Screens

Desktop frame:

`1440 x 1024`

Naming:

- `WEB/Login`
- `WEB/HeadOfficeDashboard`
- `WEB/DistrictDashboard`
- `WEB/BranchDashboard`
- `WEB/SupportInbox`
- `WEB/ChatDetail`
- `WEB/LoanQueue`
- `WEB/NotificationCampaigns`
- `WEB/Governance`
- `WEB/Performance`

## 05 Flows

Use arrows and notes for:

- `Onboarding/KYC`
- `Loan workflow`
- `Live chat`
- `School payment`
- `Shareholder voting`
- `Notification flow`

## Figma Spacing Rules

- `Screen edge padding` `16`
- `Section spacing` `24`
- `Card internal padding` `16`
- `Button height` `48`
- `Input height` `48`
- `List row height` `64`
- `KPI card height` `104`
- `Balance card height` `160`

## Naming Rules

Use:

- `Platform/Screen/Version`
- `Component/Type/State`

Examples:

- `MOB/Home/V1`
- `Button/Primary/Default`

## Flutter UI Code Structure

Use this folder structure:

```text
lib/
  app.dart
  theme/
    app_colors.dart
    app_text_styles.dart
    app_spacing.dart
    app_theme.dart
  core/
    widgets/
      app_scaffold.dart
      app_card.dart
      app_button.dart
      app_input.dart
      app_badge.dart
      app_list_tile.dart
      app_section_header.dart
  features/
    home/
      presentation/
        home_screen.dart
        widgets/
          balance_card.dart
          quick_actions_grid.dart
          smart_insights_section.dart
          recent_activity_list.dart
    payments/
      presentation/
        payments_screen.dart
    transactions/
      presentation/
        transactions_screen.dart
    loans/
      presentation/
        loans_screen.dart
        loan_detail_screen.dart
        widgets/
          loan_timeline.dart
    chat/
      presentation/
        chat_list_screen.dart
        chat_detail_screen.dart
    notifications/
      presentation/
        notifications_screen.dart
    profile/
      presentation/
        profile_screen.dart
    kyc/
      presentation/
        kyc_onboarding_screen.dart
    shareholder/
      presentation/
        shareholder_dashboard_screen.dart
        voting_screen.dart
```

## Flutter Theme Reference

### `app_colors.dart`

```dart
import 'package:flutter/material.dart';

class AppColors {
  static const primaryBlue = Color(0xFF0A4FA3);
  static const primaryBlueDark = Color(0xFF083E82);
  static const accentYellow = Color(0xFFF5C242);
  static const newFeatureBlue = Color(0xFF3E7EDB);
  static const background = Color(0xFFF5F7FA);
  static const surface = Colors.white;
  static const textPrimary = Color(0xFF1E1E1E);
  static const textSecondary = Color(0xFF6B7280);
  static const border = Color(0xFFE5E7EB);
  static const success = Color(0xFF16A34A);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFDC2626);
}
```

### `app_spacing.dart`

```dart
class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
}
```

### `app_text_styles.dart`

```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  static const h1 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const h2 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
  );

  static const caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
  );

  static const balance = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    color: Colors.white,
  );
}
```

### `app_theme.dart`

```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

ThemeData buildAppTheme() {
  return ThemeData(
    scaffoldBackgroundColor: AppColors.background,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primaryBlue,
      primary: AppColors.primaryBlue,
      surface: AppColors.surface,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: false,
    ),
    textTheme: const TextTheme(
      titleLarge: AppTextStyles.h1,
      titleMedium: AppTextStyles.h2,
      bodyMedium: AppTextStyles.body,
      bodySmall: AppTextStyles.caption,
    ),
    useMaterial3: true,
  );
}
```

## Core Widget Reference

### `app_card.dart`

```dart
import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.08),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }
}
```

### `app_button.dart`

```dart
import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryBlue,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(label),
      ),
    );
  }
}
```

### `app_scaffold.dart`

```dart
import 'package:flutter/material.dart';

class AppScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final bool showBack;

  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    this.showBack = false,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: showBack ? const BackButton() : null,
        title: Text(title),
      ),
      body: SafeArea(child: body),
    );
  }
}
```

## Home Screen Reference

### `home_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../theme/app_spacing.dart';
import 'widgets/balance_card.dart';
import 'widgets/quick_actions_grid.dart';
import 'widgets/smart_insights_section.dart';
import 'widgets/recent_activity_list.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Hello, Getnet',
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: const [
          BalanceCard(),
          SizedBox(height: AppSpacing.xl),
          QuickActionsGrid(),
          SizedBox(height: AppSpacing.xl),
          SmartInsightsSection(),
          SizedBox(height: AppSpacing.xl),
          RecentActivityList(),
        ],
      ),
    );
  }
}
```

### `balance_card.dart`

```dart
import 'package:flutter/material.dart';
import '../../../../theme/app_colors.dart';
import '../../../../theme/app_spacing.dart';
import '../../../../theme/app_text_styles.dart';

class BalanceCard extends StatelessWidget {
  const BalanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.primaryBlue,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Savings Account', style: TextStyle(color: Colors.white70)),
          Spacer(),
          Text('ETB 21,450', style: AppTextStyles.balance),
          SizedBox(height: 8),
          Text('Available balance', style: TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }
}
```

### `quick_actions_grid.dart`

```dart
import 'package:flutter/material.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../theme/app_spacing.dart';

class QuickActionsGrid extends StatelessWidget {
  const QuickActionsGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Send', Icons.send),
      ('Pay', Icons.receipt_long),
      ('Airtime', Icons.phone_android),
      ('Loan', Icons.account_balance),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.9,
      ),
      itemBuilder: (_, index) {
        return AppCard(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(items[index].$2),
              const SizedBox(height: 8),
              Text(items[index].$1),
            ],
          ),
        );
      },
    );
  }
}
```

### `smart_insights_section.dart`

```dart
import 'package:flutter/material.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_section_header.dart';
import '../../../../theme/app_spacing.dart';

class SmartInsightsSection extends StatelessWidget {
  const SmartInsightsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        AppSectionHeader(title: 'Smart Insights'),
        SizedBox(height: AppSpacing.md),
        AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.school),
            title: Text('School fee due in 3 days'),
            subtitle: Text('Bright Future School • ETB 5,000'),
            trailing: Icon(Icons.chevron_right),
          ),
        ),
        SizedBox(height: AppSpacing.md),
        AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.live_tv),
            title: Text('DSTV due in 5 days'),
            subtitle: Text('Monthly subscription reminder'),
            trailing: Icon(Icons.chevron_right),
          ),
        ),
      ],
    );
  }
}
```

### `app_section_header.dart`

```dart
import 'package:flutter/material.dart';
import '../../theme/app_text_styles.dart';

class AppSectionHeader extends StatelessWidget {
  final String title;

  const AppSectionHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(title, style: AppTextStyles.h2);
  }
}
```

### `recent_activity_list.dart`

```dart
import 'package:flutter/material.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_section_header.dart';
import '../../../../theme/app_spacing.dart';

class RecentActivityList extends StatelessWidget {
  const RecentActivityList({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        AppSectionHeader(title: 'Recent Activity'),
        SizedBox(height: AppSpacing.md),
        AppCard(
          child: Column(
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('Airtime Purchase'),
                subtitle: Text('Today'),
                trailing: Text('- ETB 500'),
              ),
              Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('Transfer Received'),
                subtitle: Text('Yesterday'),
                trailing: Text('+ ETB 10,000'),
              ),
              Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('School Payment'),
                subtitle: Text('2 days ago'),
                trailing: Text('- ETB 5,000'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
```

## Build Order

After Home, implement these screens in the same style:

1. `PaymentsScreen`
2. `TransactionsScreen`
3. `ChatListScreen`
4. `ChatDetailScreen`
5. `NotificationsScreen`
6. `ProfileScreen`
7. `LoanDetailScreen`
8. `ShareholderDashboardScreen`

## Dev Team Rules

Give the team these four rules:

1. Use reusable components only.
2. No page without `Scaffold + SafeArea`.
3. All detail pages must have a back arrow.
4. Keep Home limited to balance, 4 actions, insights, and recent activity.
