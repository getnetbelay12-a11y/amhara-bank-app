import { registerAs } from '@nestjs/config';

import { getExternalEmailSettings } from './external-email.config';
import { getExternalTelegramSettings } from './external-telegram.config';

export const notificationsConfig = registerAs('notifications', () => {
  const externalEmail = getExternalEmailSettings();
  const externalTelegram = getExternalTelegramSettings();

  return {
    sms: {
      enabled: (process.env.SMS_ENABLED ?? 'true') === 'true',
      provider: process.env.SMS_PROVIDER ?? 'log',
      senderId: process.env.SMS_SENDER_ID ?? 'AMHARA_BANK',
      endpoint: process.env.SMS_GENERIC_ENDPOINT ?? '',
      apiKey: process.env.SMS_GENERIC_API_KEY ?? '',
    },
    email: {
      enabled: (process.env.EMAIL_ENABLED ?? 'true') === 'true',
      provider: process.env.EMAIL_PROVIDER ?? externalEmail?.provider ?? 'log',
      sender:
        process.env.EMAIL_SENDER ??
        externalEmail?.sender ??
        'notifications@amhara-bank.local',
      endpoint: process.env.EMAIL_GENERIC_ENDPOINT ?? '',
      apiKey: process.env.EMAIL_GENERIC_API_KEY ?? '',
      smtpHost: process.env.EMAIL_SMTP_HOST ?? externalEmail?.smtpHost ?? '',
      smtpPort: Number(
        process.env.EMAIL_SMTP_PORT ?? externalEmail?.smtpPort ?? 587,
      ),
      smtpSecure:
        (process.env.EMAIL_SMTP_SECURE ?? String(externalEmail?.smtpSecure ?? false)) ===
        'true',
      smtpUser: process.env.EMAIL_SMTP_USER ?? externalEmail?.smtpUser ?? '',
      smtpPass: process.env.EMAIL_SMTP_PASS ?? externalEmail?.smtpPass ?? '',
      testRecipient:
        process.env.TEST_EMAIL_RECIPIENT ??
        process.env.DEMO_NOTIFICATION_EMAIL ??
        'write2get@gmail.com',
      forceTestRecipient: process.env.EMAIL_FORCE_TEST_RECIPIENT ?? '',
      externalSourcePath: externalEmail?.sourcePath ?? '',
    },
    push: {
      enabled: (process.env.PUSH_ENABLED ?? 'true') === 'true',
      provider: process.env.PUSH_PROVIDER ?? 'log',
      endpoint: process.env.PUSH_GENERIC_ENDPOINT ?? '',
      apiKey: process.env.PUSH_GENERIC_API_KEY ?? '',
      iosSimulatorDevice: process.env.PUSH_IOS_SIMULATOR_DEVICE ?? 'booted',
      iosSimulatorBundleId:
        process.env.PUSH_IOS_SIMULATOR_BUNDLE_ID ?? 'com.getnetbelay.amharaBankMobile',
      apnsTeamId: process.env.APNS_TEAM_ID ?? '',
      apnsKeyId: process.env.APNS_KEY_ID ?? '',
      apnsBundleId:
        process.env.APNS_BUNDLE_ID ?? 'com.getnetbelay.amharaBankMobile',
      apnsPrivateKey: process.env.APNS_PRIVATE_KEY ?? '',
      apnsUseSandbox: (process.env.APNS_USE_SANDBOX ?? 'true') === 'true',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
      firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
      firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? '',
    },
    telegram: {
      enabled:
        (process.env.TELEGRAM_ENABLED ??
          String(Boolean(process.env.TELEGRAM_BOT_TOKEN || externalTelegram?.botToken))) ===
        'true',
      botToken: process.env.TELEGRAM_BOT_TOKEN ?? externalTelegram?.botToken ?? '',
      apiBase:
        process.env.TELEGRAM_BOT_API_BASE ??
        externalTelegram?.apiBase ??
        'https://api.telegram.org',
      forceTestChatId:
        process.env.TELEGRAM_FORCE_TEST_CHAT_ID ??
        externalTelegram?.forceTestChatId ??
        '',
      webhookSecret:
        process.env.TELEGRAM_WEBHOOK_SECRET ??
        process.env.TELEGRAM_WEBHOOK_TOKEN ??
        '',
      externalSourcePath: externalTelegram?.sourcePath ?? '',
    },
  };
});
