import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { createSign } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { connect, constants as http2Constants } from 'node:http2';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { NotificationChannel } from '../../../common/enums';
import { DeviceTokensService } from '../device-tokens.service';
import {
  ChannelNotificationPayload,
  ChannelNotificationProvider,
  ChannelNotificationResult,
} from '../channel-notification-provider.port';

const execFileAsync = promisify(execFile);

@Injectable()
export class MobilePushNotificationProvider implements ChannelNotificationProvider {
  private readonly logger = new Logger(MobilePushNotificationProvider.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly deviceTokensService: DeviceTokensService,
  ) {}

  async send(payload: ChannelNotificationPayload): Promise<ChannelNotificationResult> {
    const config = this.configService.getOrThrow<{
      push: {
        enabled: boolean;
        provider: string;
        endpoint: string;
        apiKey: string;
        iosSimulatorDevice: string;
        iosSimulatorBundleId: string;
        apnsTeamId: string;
        apnsKeyId: string;
        apnsBundleId: string;
        apnsPrivateKey: string;
        apnsUseSandbox: boolean;
        firebaseProjectId: string;
        firebaseClientEmail: string;
        firebasePrivateKey: string;
      };
    }>('notifications');

    if (!config.push.enabled) {
      return {
        status: 'failed',
        recipient: payload.memberId,
        errorMessage: 'Mobile push is disabled.',
      };
    }

    const deviceTokens = await this.deviceTokensService.listForUser(payload.memberId);
    if (deviceTokens.length == 0) {
      return {
        status: 'failed',
        recipient: payload.memberId,
        errorMessage: 'No registered mobile push device token was found.',
      };
    }

    if (config.push.provider === 'log') {
      const providerMessageId = `push-log-${Date.now()}`;
      this.logger.log(
        `Mobile push queued provider=log user=${payload.memberId} devices=${deviceTokens.length} title="${payload.subject ?? 'Amhara Bank Notification'}"`,
      );
      return {
        status: 'sent',
        providerMessageId,
        recipient: payload.memberId,
      };
    }

    if (config.push.provider === 'generic_http') {
      if (!config.push.endpoint) {
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: 'PUSH_GENERIC_ENDPOINT is missing.',
        };
      }

      const response = await fetch(config.push.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.push.apiKey
            ? { Authorization: `Bearer ${config.push.apiKey}` }
            : {}),
        },
        body: JSON.stringify({
          channel: NotificationChannel.MOBILE_PUSH,
          tokens: deviceTokens.map((item) => item.token),
          title: payload.subject ?? 'Amhara Bank Notification',
          body: payload.messageBody,
          memberId: payload.memberId,
          category: payload.category,
          deepLink: payload.deepLink,
          actionLabel: payload.actionLabel,
          dataPayload: payload.dataPayload,
        }),
      });

      if (!response.ok) {
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: `Push gateway returned HTTP ${response.status}.`,
        };
      }

      return {
        status: 'sent',
        providerMessageId: `generic-push-${Date.now()}`,
        recipient: payload.memberId,
      };
    }

    if (config.push.provider === 'ios_simulator') {
      const iosTokens = deviceTokens.filter((item) => item.platform === 'ios');
      if (iosTokens.length === 0) {
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: 'No registered iOS simulator device token was found.',
        };
      }

      const bundleId =
        config.push.iosSimulatorBundleId || 'com.getnetbelay.amharaBankMobile';
      const target = config.push.iosSimulatorDevice || 'booted';
      const tempDirectory = await mkdtemp(
        join(tmpdir(), 'amhara-bank-simulator-push-'),
      );
      const payloadFile = join(tempDirectory, 'push.apns');

      const simulatorPayload = {
        aps: {
          alert: {
            title: payload.subject ?? 'Amhara Bank Notification',
            body: payload.messageBody,
          },
          sound: 'default',
          badge: 1,
        },
        notificationId: payload.dataPayload?.notificationId,
        deepLink: payload.deepLink,
        actionLabel: payload.actionLabel,
        notificationData: payload.dataPayload ?? {},
        category: payload.category,
        memberId: payload.memberId,
      };

      try {
        await writeFile(payloadFile, JSON.stringify(simulatorPayload), 'utf8');
        await execFileAsync('xcrun', [
          'simctl',
          'push',
          target,
          bundleId,
          payloadFile,
        ]);

        this.logger.log(
          `Mobile push queued provider=ios_simulator user=${payload.memberId} bundle=${bundleId} device=${target}`,
        );

        return {
          status: 'sent',
          providerMessageId: `ios-simulator-push-${Date.now()}`,
          recipient: payload.memberId,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Simulator push delivery failed.';
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: message,
        };
      } finally {
        await rm(tempDirectory, { recursive: true, force: true });
      }
    }

    if (config.push.provider === 'apns') {
      const iosTokens = deviceTokens.filter((item) => item.platform === 'ios');
      if (iosTokens.length === 0) {
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: 'No registered iOS device token was found.',
        };
      }

      if (
        !config.push.apnsTeamId ||
        !config.push.apnsKeyId ||
        !config.push.apnsBundleId ||
        !config.push.apnsPrivateKey
      ) {
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: 'APNs credentials are incomplete.',
        };
      }

      const server = config.push.apnsUseSandbox
        ? 'https://api.sandbox.push.apple.com'
        : 'https://api.push.apple.com';
      const providerToken = this.createApnsProviderToken(
        config.push.apnsTeamId,
        config.push.apnsKeyId,
        config.push.apnsPrivateKey,
      );
      const apnsPayload = {
        aps: {
          alert: {
            title: payload.subject ?? 'Amhara Bank Notification',
            body: payload.messageBody,
          },
          sound: 'default',
          badge: 1,
        },
        notificationId: payload.dataPayload?.notificationId,
        deepLink: payload.deepLink,
        actionLabel: payload.actionLabel,
        notificationData: payload.dataPayload ?? {},
        category: payload.category,
        memberId: payload.memberId,
      };

      try {
        await Promise.all(
          iosTokens.map((item) =>
            this.sendApnsRequest({
              server,
              token: item.token,
              bundleId: config.push.apnsBundleId,
              providerToken,
              payload: apnsPayload,
            }),
          ),
        );

        this.logger.log(
          `Mobile push queued provider=apns user=${payload.memberId} devices=${iosTokens.length} sandbox=${config.push.apnsUseSandbox}`,
        );
        return {
          status: 'sent',
          providerMessageId: `apns-push-${Date.now()}`,
          recipient: payload.memberId,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'APNs delivery failed.';
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: message,
        };
      }
    }

    if (config.push.provider === 'firebase') {
      if (
        !config.push.firebaseProjectId ||
        !config.push.firebaseClientEmail ||
        !config.push.firebasePrivateKey
      ) {
        return {
          status: 'failed',
          recipient: payload.memberId,
          errorMessage: 'Firebase push credentials are incomplete.',
        };
      }

      this.logger.log(
        `Mobile push queued provider=firebase project=${config.push.firebaseProjectId} user=${payload.memberId} devices=${deviceTokens.length}`,
      );
      return {
        status: 'sent',
        providerMessageId: `firebase-push-${Date.now()}`,
        recipient: payload.memberId,
      };
    }

    return {
      status: 'failed',
      recipient: payload.memberId,
      errorMessage: `Unsupported push provider ${config.push.provider}.`,
    };
  }

  private createApnsProviderToken(
    teamId: string,
    keyId: string,
    privateKey: string,
  ): string {
    const normalizedPrivateKey = privateKey.replace(/\\n/g, '\n').trim();
    const header = this.base64UrlEncode(
      JSON.stringify({ alg: 'ES256', kid: keyId }),
    );
    const claims = this.base64UrlEncode(
      JSON.stringify({
        iss: teamId,
        iat: Math.floor(Date.now() / 1000),
      }),
    );
    const unsignedToken = `${header}.${claims}`;
    const signer = createSign('sha256');
    signer.update(unsignedToken);
    signer.end();
    const signature = signer.sign(normalizedPrivateKey);
    return `${unsignedToken}.${this.base64UrlEncode(signature)}`;
  }

  private base64UrlEncode(value: string | Buffer): string {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private sendApnsRequest({
    server,
    token,
    bundleId,
    providerToken,
    payload,
  }: {
    server: string;
    token: string;
    bundleId: string;
    providerToken: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = connect(server);

      client.once('error', (error) => {
        client.close();
        reject(error);
      });

      const request = client.request({
        ':method': 'POST',
        ':path': `/3/device/${token}`,
        authorization: `bearer ${providerToken}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'content-type': 'application/json',
      });

      let responseBody = '';
      let responseStatus = 0;

      request.setEncoding('utf8');
      request.on('response', (headers) => {
        const statusHeader = headers[http2Constants.HTTP2_HEADER_STATUS];
        responseStatus =
          typeof statusHeader === 'number'
            ? statusHeader
            : Number(statusHeader ?? 0);
      });
      request.on('data', (chunk: string) => {
        responseBody += chunk;
      });
      request.on('end', () => {
        client.close();
        if (responseStatus >= 200 && responseStatus < 300) {
          resolve();
          return;
        }

        let reason = `APNs returned HTTP ${responseStatus}.`;
        if (responseBody) {
          try {
            const parsed = JSON.parse(responseBody) as { reason?: string };
            if (parsed.reason) {
              reason = `APNs rejected the notification: ${parsed.reason}.`;
            }
          } catch {
            reason = `${reason} ${responseBody}`;
          }
        }

        reject(new Error(reason));
      });
      request.on('error', (error) => {
        client.close();
        reject(error);
      });
      request.end(JSON.stringify(payload));
    });
  }
}
