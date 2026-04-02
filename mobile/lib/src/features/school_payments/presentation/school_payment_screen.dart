import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/models/index.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/app_input.dart';
import '../../../shared/widgets/app_list_item.dart';

class SchoolPaymentScreen extends StatefulWidget {
  const SchoolPaymentScreen({super.key});

  @override
  State<SchoolPaymentScreen> createState() => _SchoolPaymentScreenState();
}

class _SchoolPaymentScreenState extends State<SchoolPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _studentNameController = TextEditingController(text: 'Mahi Kebede');
  final _studentIdController = TextEditingController(text: 'ST-1001');
  final _schoolNameController = TextEditingController(text: 'Blue Nile Academy');
  final _amountController = TextEditingController(text: '1500');
  int _selectedProfileIndex = 0;
  bool _submitting = false;
  String? _message;

  @override
  void dispose() {
    _studentNameController.dispose();
    _studentIdController.dispose();
    _schoolNameController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context).services;
    final session = AppScope.of(context).session;

    if (session == null) {
      return const Scaffold(
        body: SafeArea(
          child: Center(
            child: Text('Please sign in to use school payment.'),
          ),
        ),
      );
    }

    return FutureBuilder<List<dynamic>>(
      future: Future.wait<dynamic>([
        services.savingsApi.fetchMyAccounts(session.memberId),
        services.schoolPaymentApi.fetchMySchoolPayments(),
        services.autopayApi.fetchInstructions(),
      ]),
      builder: (context, snapshot) {
        final accounts = snapshot.data?[0] as List<SavingsAccount>? ?? const <SavingsAccount>[];
        final payments = snapshot.data?[1] as List<dynamic>? ?? const [];
        final autopays = snapshot.data?[2] as List<AutopayInstruction>? ?? const <AutopayInstruction>[];
        final profiles = _buildProfiles(payments, autopays);
        final selectedProfile = profiles.isEmpty
            ? null
            : profiles[_selectedProfileIndex.clamp(0, profiles.length - 1)];
        final primaryAccount = accounts.isNotEmpty ? accounts.first : null;

        return AppScaffold(
          title: 'School Payment',
          showBack: true,
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const AppHeader(
                title: 'School Payment',
                subtitle: 'Manage monthly tuition with due reminders, payment history, and optional auto pay.',
              ),
              if (selectedProfile != null) ...[
                const SizedBox(height: 16),
                AppCard(
                  child: AppListItem(
                    title: selectedProfile.status == 'overdue'
                        ? 'School fee overdue'
                        : 'Next school fee reminder',
                    subtitle: '${selectedProfile.schoolName} • Due ${selectedProfile.dueDateLabel}',
                    icon: selectedProfile.status == 'overdue'
                        ? Icons.warning_amber_rounded
                        : Icons.school_outlined,
                    badge: selectedProfile.statusLabel,
                    badgeTone: selectedProfile.status == 'overdue'
                        ? AppBadgeTone.warning
                        : AppBadgeTone.success,
                  ),
                ),
              ],
              const SizedBox(height: 16),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Student Profiles',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 8),
                      if (profiles.isEmpty)
                        Text(
                          'No student profiles yet. Add one below to start monthly school payments.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        )
                      else
                        for (var index = 0; index < profiles.length; index++) ...[
                          AppListItem(
                            title: profiles[index].studentName,
                            subtitle:
                                '${profiles[index].schoolName} · Due ${profiles[index].dueDateLabel} · ${profiles[index].statusLabel}',
                            icon: Icons.school_outlined,
                            badge: 'ETB ${profiles[index].monthlyFee.toStringAsFixed(0)}',
                            badgeTone: profiles[index].status == 'overdue'
                                ? AppBadgeTone.warning
                                : AppBadgeTone.neutral,
                            onTap: () {
                              setState(() {
                                _selectedProfileIndex = index;
                              });
                            },
                          ),
                          if (index != profiles.length - 1) const Divider(height: 1),
                        ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              if (selectedProfile != null)
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                selectedProfile.studentName,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                              ),
                            ),
                            AppBadge(
                              label: selectedProfile.statusLabel,
                              tone: selectedProfile.status == 'overdue'
                                  ? AppBadgeTone.warning
                                  : AppBadgeTone.success,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            AppBadge(
                              label: selectedProfile.autoPayEnabled ? 'AUTOPAY ON' : 'MANUAL PAY',
                              tone: selectedProfile.autoPayEnabled
                                  ? AppBadgeTone.primary
                                  : AppBadgeTone.neutral,
                            ),
                            AppBadge(
                              label: 'DUE ${selectedProfile.dueDateLabel.toUpperCase()}',
                              tone: selectedProfile.status == 'overdue'
                                  ? AppBadgeTone.warning
                                  : AppBadgeTone.neutral,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text('School: ${selectedProfile.schoolName}'),
                        const SizedBox(height: 4),
                        Text('Grade: ${selectedProfile.gradeLabel}'),
                        const SizedBox(height: 4),
                        Text('Monthly fee: ETB ${selectedProfile.monthlyFee.toStringAsFixed(0)}'),
                        const SizedBox(height: 4),
                        Text('Due date: ${selectedProfile.dueDateLabel}'),
                        const SizedBox(height: 4),
                        Text('Funding account: ${primaryAccount?.accountNumber ?? 'Not linked'}'),
                        const SizedBox(height: 14),
                        SwitchListTile.adaptive(
                          value: selectedProfile.autoPayEnabled,
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Auto Pay'),
                          subtitle: Text(
                            selectedProfile.autoPayEnabled
                                ? 'Monthly fee will be attempted automatically on the due date.'
                                : 'Enable automatic payment for this student profile.',
                          ),
                          onChanged: primaryAccount == null
                              ? null
                              : (_) => _toggleAutopay(
                                    services,
                                    selectedProfile,
                                    primaryAccount,
                                  ),
                        ),
                        const SizedBox(height: 8),
                        AppButton(
                          label: _submitting ? 'Processing...' : 'Pay Now',
                          onPressed: _submitting || primaryAccount == null
                              ? null
                              : () => _submitPayment(
                                    services,
                                    primaryAccount,
                                    selectedProfile,
                                  ),
                        ),
                        if (_message != null) ...[
                          const SizedBox(height: 12),
                          Text(_message!),
                        ],
                      ],
                    ),
                  ),
              if (selectedProfile != null) ...[
                  const SizedBox(height: 16),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Payment History',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 8),
                        for (var index = 0; index < selectedProfile.history.length; index++) ...[
                          AppListItem(
                            title: selectedProfile.history[index].monthLabel,
                            subtitle: selectedProfile.history[index].statusLabel,
                            icon: Icons.receipt_long_outlined,
                            badge: 'ETB ${selectedProfile.history[index].amount.toStringAsFixed(0)}',
                            badgeTone: selectedProfile.history[index].status == 'paid'
                                ? AppBadgeTone.success
                                : AppBadgeTone.warning,
                          ),
                          if (index != selectedProfile.history.length - 1) const Divider(height: 1),
                        ],
                      ],
                    ),
                  ),
                ],
              const SizedBox(height: 16),
              AppCard(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Add or Update Student',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 12),
                        AppInput(
                          controller: _studentNameController,
                          label: 'Student Name',
                          validator: (value) => (value == null || value.trim().isEmpty)
                              ? 'Student name is required.'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        AppInput(
                          controller: _studentIdController,
                          label: 'Student ID',
                          validator: (value) => (value == null || value.trim().isEmpty)
                              ? 'Student ID is required.'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        AppInput(
                          controller: _schoolNameController,
                          label: 'School Name',
                          validator: (value) => (value == null || value.trim().isEmpty)
                              ? 'School name is required.'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        AppInput(
                          controller: _amountController,
                          label: 'Monthly Amount',
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          validator: (value) {
                            final amount = double.tryParse(value ?? '');
                            if (amount == null || amount <= 0) {
                              return 'Enter a valid monthly amount.';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Profiles are modeled here as recurring monthly school-payment plans with due date tracking and optional autopay.',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _submitPayment(
    dynamic services,
    SavingsAccount account,
    _StudentProfile profile,
  ) async {
    if (_submitting) {
      return;
    }
    setState(() {
      _submitting = true;
      _message = null;
    });

    try {
      final result = await services.schoolPaymentApi.createSchoolPayment(
        accountId: account.accountId,
        studentId: profile.studentId,
        schoolName: profile.schoolName,
        amount: profile.monthlyFee,
        channel: 'mobile',
        narration: 'Monthly school payment',
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _submitting = false;
        _message = 'Payment recorded: ${result.transactionReference}';
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _submitting = false;
        _message = _friendlyError(error, fallback: 'Unable to submit school payment.');
      });
    }
  }

  Future<void> _toggleAutopay(
    dynamic services,
    _StudentProfile profile,
    SavingsAccount account,
  ) async {
    setState(() {
      _message = null;
    });
    try {
      if (profile.autoPayId == null) {
        await services.autopayApi.createInstruction(
          provider: 'school_payment',
          accountId: account.accountId,
          schedule: 'monthly',
        );
      } else {
        await services.autopayApi.updateInstructionStatus(
          id: profile.autoPayId,
          provider: 'school_payment',
          enabled: !profile.autoPayEnabled,
        );
      }
      if (!mounted) {
        return;
      }
      setState(() {
        _message = profile.autoPayEnabled
            ? 'School payment AutoPay disabled.'
            : 'School payment AutoPay enabled.';
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _message = _friendlyError(error, fallback: 'Unable to update school payment AutoPay.');
      });
    }
  }

  List<_StudentProfile> _buildProfiles(
    List<dynamic> payments,
    List<AutopayInstruction> autopays,
  ) {
    final schoolAutopay = autopays.firstWhere(
      (item) => item.serviceType == 'school_payment',
      orElse: () => const AutopayInstruction(
        id: '',
        serviceType: 'school_payment',
        accountId: '',
        schedule: 'monthly',
        enabled: false,
      ),
    );

    final history = payments
        .map(
          (payment) => _PaymentHistoryItem(
            monthLabel: _historyLabel(DateTime.tryParse('${payment['createdAt']}') ?? DateTime.now()),
            amount: (payment['amount'] as num?)?.toDouble() ?? 0,
            status: '${payment['status'] ?? 'pending'}',
          ),
        )
        .toList();

    return [
      _StudentProfile(
        studentName: 'Mahi Kebede',
        studentId: 'ST-1001',
        schoolName: 'Blue Nile Academy',
        gradeLabel: 'Grade 6',
        monthlyFee: 1500,
        dueDay: 5,
        autoPayEnabled: schoolAutopay.enabled,
        autoPayId: schoolAutopay.id.isEmpty ? null : schoolAutopay.id,
        status: history.isNotEmpty && history.first.status == 'successful' ? 'upcoming' : 'due',
        history: history.isEmpty
            ? const [
                _PaymentHistoryItem(monthLabel: 'March 2026', amount: 1500, status: 'pending'),
                _PaymentHistoryItem(monthLabel: 'February 2026', amount: 1500, status: 'paid'),
              ]
            : history,
      ),
      const _StudentProfile(
        studentName: 'Liya Bekele',
        studentId: 'ST-1002',
        schoolName: 'Vision School',
        gradeLabel: 'Grade 9',
        monthlyFee: 2200,
        dueDay: 12,
        autoPayEnabled: false,
        autoPayId: null,
        status: 'overdue',
        history: [
          _PaymentHistoryItem(monthLabel: 'March 2026', amount: 2200, status: 'overdue'),
          _PaymentHistoryItem(monthLabel: 'February 2026', amount: 2200, status: 'paid'),
        ],
      ),
    ];
  }

  String _historyLabel(DateTime date) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return '${months[date.month - 1]} ${date.year}';
  }

  String _friendlyError(Object error, {required String fallback}) {
    final text = error.toString();
    final trimmed = text.startsWith('Exception: ') ? text.substring('Exception: '.length) : text;
    return trimmed.isEmpty ? fallback : trimmed;
  }
}

class _StudentProfile {
  const _StudentProfile({
    required this.studentName,
    required this.studentId,
    required this.schoolName,
    required this.gradeLabel,
    required this.monthlyFee,
    required this.dueDay,
    required this.autoPayEnabled,
    required this.autoPayId,
    required this.status,
    required this.history,
  });

  final String studentName;
  final String studentId;
  final String schoolName;
  final String gradeLabel;
  final double monthlyFee;
  final int dueDay;
  final bool autoPayEnabled;
  final String? autoPayId;
  final String status;
  final List<_PaymentHistoryItem> history;

  String get dueDateLabel => 'Day $dueDay each month';

  String get statusLabel {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due':
        return 'Due Soon';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Active';
    }
  }
}

class _PaymentHistoryItem {
  const _PaymentHistoryItem({
    required this.monthLabel,
    required this.amount,
    required this.status,
  });

  final String monthLabel;
  final double amount;
  final String status;

  String get statusLabel => status.replaceAll('_', ' ').toUpperCase();
}
