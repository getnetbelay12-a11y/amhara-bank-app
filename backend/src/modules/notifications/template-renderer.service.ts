import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  NotificationCategory,
  NotificationTemplateType,
} from '../../common/enums';
import { MemberDocument } from '../members/schemas/member.schema';
import {
  getNotificationTemplateDefinition,
  type NotificationTemplateDefinition,
} from './notification-template.registry';
import {
  AMHARA_EMAIL_BRAND,
  buildAmharaLogoFallbackDataUrl,
  loadAmharaLogoAsset,
  type EmailAttachmentAsset,
} from './email-branding';

type TemplateRenderInput = {
  templateType: NotificationTemplateType | string;
  subject?: string;
  customMessageBody?: string;
  member: MemberDocument;
};

export type RenderedNotificationContent = {
  subject: string;
  emailHtml: string;
  emailText: string;
  inAppTitle: string;
  inAppMessage: string;
  smsMessage: string;
  telegramMessage: string;
  logMessageBody: string;
  emailAttachments?: EmailAttachmentAsset[];
  emailLogoSrc: string;
  emailLogoStrategy: 'cid' | 'fallback_data_url';
};

type TemplateData = Record<string, string>;

@Injectable()
export class TemplateRendererService {
  private readonly logger = new Logger(TemplateRendererService.name);
  private readonly repoRoot = join(__dirname, '..', '..', '..', '..');
  private readonly templateDir = join(
    this.repoRoot,
    'templates',
    'notifications',
  );
  private readonly layoutTemplate = readFileSync(
    join(this.templateDir, '_layout.html'),
    'utf8',
  );
  private readonly logoAsset = loadAmharaLogoAsset(this.repoRoot);
  private readonly colors = {
    pageBackground: AMHARA_EMAIL_BRAND.colors.pageBackground,
    cardBackground: AMHARA_EMAIL_BRAND.colors.cardBackground,
    softBackground: AMHARA_EMAIL_BRAND.colors.softBackground,
    border: AMHARA_EMAIL_BRAND.colors.border,
    primary: AMHARA_EMAIL_BRAND.colors.primary,
    primaryDark: AMHARA_EMAIL_BRAND.colors.primaryDark,
    teal: AMHARA_EMAIL_BRAND.colors.teal,
    gold: AMHARA_EMAIL_BRAND.colors.gold,
    title: AMHARA_EMAIL_BRAND.colors.titleText,
    body: AMHARA_EMAIL_BRAND.colors.bodyText,
    muted: AMHARA_EMAIL_BRAND.colors.mutedText,
  };

  render(input: TemplateRenderInput): RenderedNotificationContent {
    const definition = getNotificationTemplateDefinition(input.templateType);
    if (!definition) {
      const fallbackBody =
        input.customMessageBody ?? 'Amhara Bank reminder';

      return {
        subject: input.subject ?? 'Amhara Bank Notification',
        emailHtml: this.wrapHtml(
          input.subject ?? 'Amhara Bank Notification',
          `<p style="margin:0;font-size:16px;line-height:1.65;">${this.escapeHtml(
            fallbackBody,
          )}</p>`,
          `<p style="margin:0;font-size:16px;line-height:1.65;">${this.escapeHtml(
            fallbackBody,
          )}</p>`,
        ),
        emailText: fallbackBody,
        inAppTitle: input.subject ?? 'Amhara Bank Notification',
        inAppMessage: fallbackBody,
        smsMessage: fallbackBody,
        telegramMessage: fallbackBody,
        logMessageBody: fallbackBody,
        emailAttachments: this.logoAsset ? [this.logoAsset] : undefined,
        emailLogoSrc: this.resolveEmailLogo().src,
        emailLogoStrategy: this.resolveEmailLogo().strategy,
      };
    }

    const data = this.buildTemplateData(definition, input.member);
    const englishContent = this.interpolate(
      this.readTemplate(definition.templateFile),
      data,
    );
    const amharicContent = this.buildAmharicContent(definition, data);
    const subject = input.subject ?? definition.subject;
    const introMessage = input.customMessageBody?.trim();
    const emailHtml = this.wrapHtml(
      subject,
      introMessage ? this.prependInfoNote(introMessage, englishContent) : englishContent,
      introMessage
        ? this.prependInfoNote(
            this.buildAmharicIntroMessage(definition, data, introMessage),
            amharicContent,
          )
        : amharicContent,
    );
    const emailLogo = this.resolveEmailLogo();
    this.logger.log(
      `email logo strategy=${emailLogo.strategy} src=${emailLogo.src} attachment=${this.logoAsset ? 'present' : 'missing'} template=${definition.templateType}`,
    );

    return {
      subject,
      emailHtml,
      emailText: this.buildEmailText(definition, data, introMessage),
      inAppTitle: definition.title,
      inAppMessage: this.buildInAppMessage(definition, data),
      smsMessage: this.buildSmsMessage(definition, data),
      telegramMessage: this.buildTelegramMessage(definition, data),
      logMessageBody: introMessage ?? this.buildInAppMessage(definition, data),
      emailAttachments: this.logoAsset ? [this.logoAsset] : undefined,
      emailLogoSrc: emailLogo.src,
      emailLogoStrategy: emailLogo.strategy,
    };
  }

  private buildTemplateData(
    definition: NotificationTemplateDefinition,
    member: MemberDocument,
  ): TemplateData {
    return {
      customerName: member.fullName,
      customerNameAmharic: this.resolveAmharicCustomerName(member),
      paymentAmount: '502,346.00',
      dueDate: this.formatDate(this.daysFromNow(5), 'en-US'),
      dueDateAmharic: this.formatDate(this.daysFromNow(5), 'am-ET'),
      lateInterest: '0.00',
      lateDays: '0',
      paymentDate: this.formatDate(this.daysFromNow(0), 'en-US'),
      paymentDateAmharic: this.formatDate(this.daysFromNow(0), 'am-ET'),
      provider: 'Amhara Insurance',
      providerAmharic: 'አማራ ኢንሹራንስ',
      policyNumber: `${member.customerId}-INS-001`,
      referenceNumber: member.customerId,
      renewalDate: this.formatDate(this.daysFromNow(7), 'en-US'),
      renewalDateAmharic: this.formatDate(this.daysFromNow(7), 'am-ET'),
      daysRemaining:
        definition.category === NotificationCategory.INSURANCE ? '7' : '5',
    };
  }

  private buildAmharicContent(
    definition: NotificationTemplateDefinition,
    data: TemplateData,
  ): string {
    switch (definition.templateType) {
      case NotificationTemplateType.INSURANCE_RENEWAL_REMINDER:
        return `
          <section>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:${this.colors.body};">ክቡር/ክብርት ${this.escapeHtml(
              data.customerNameAmharic,
            )},</p>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:${this.colors.body};">የኢንሹራንስ ፖሊሲዎ የማደስ ጊዜ በ<strong>${this.escapeHtml(
              data.daysRemaining,
            )}</strong> ቀናት ውስጥ ይደርሳል።</p>
            <div style="margin:0 0 20px;padding:18px;border:1px solid ${this.colors.border};border-radius:18px;background:${this.colors.softBackground};">
              <div style="margin-bottom:12px;font-size:12px;letter-spacing:0.08em;color:${this.colors.muted};font-weight:800;">የኢንሹራንስ እድሳት ማስታወሻ</div>
              <div style="margin-bottom:10px;font-size:15px;color:${this.colors.body};"><strong>አቅራቢ:</strong> ${this.escapeHtml(
                data.providerAmharic,
              )}</div>
              <div style="margin-bottom:10px;font-size:15px;color:${this.colors.body};"><strong>ፖሊሲ ቁጥር:</strong> ${this.escapeHtml(
                data.policyNumber,
              )}</div>
              <div style="font-size:15px;color:${this.colors.body};"><strong>የማደስ ቀን:</strong> ${this.escapeHtml(
                data.renewalDateAmharic,
              )}</div>
            </div>
            <p style="margin:0 0 12px;font-size:15px;line-height:1.8;color:${this.colors.body};">ከአንድ በላይ ፖሊሲ ካሉዎት ሲልኩ <strong>ፖሊሲ:${this.escapeHtml(
              data.policyNumber,
            )}</strong> ብለው በርዕስ ወይም በመግለጫ ውስጥ ያስገቡ።</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:${this.colors.body};">እባክዎ የማደስ ሰነድዎን ፎቶ/PDF በቴሌግራም ይላኩ ወይም በአባሪ ፋይል ለዚህ ኢሜይል ይመልሱ።</p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:${this.colors.body};">እናመሰግናለን፣<br />የኢንሹራንስ አገልግሎት ቡድን<br />አማራ ባንክ</p>
          </section>
        `;
      case NotificationTemplateType.PAYMENT_CONFIRMATION:
      case NotificationTemplateType.SCHOOL_PAYMENT_DUE:
        return `
          <section>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:${this.colors.body};">ክቡር/ክብርት ${this.escapeHtml(
              data.customerNameAmharic,
            )},</p>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:${this.colors.body};">${
              definition.templateType === NotificationTemplateType.SCHOOL_PAYMENT_DUE
                  ? 'የትምህርት ክፍያዎ ቀርቧል። እባክዎ የተማሪውን መረጃ ይመልከቱ እና ክፍያውን በወቅቱ ያጠናቅቁ።'
                  : 'ክፍያዎ በተሳካ ሁኔታ ተቀብሏል።'
            }</p>
            <div style="margin:0 0 20px;padding:18px;border:1px solid ${this.colors.border};border-radius:18px;background:${this.colors.softBackground};">
              <div style="margin-bottom:12px;font-size:12px;letter-spacing:0.08em;color:${this.colors.muted};font-weight:800;">${
                definition.templateType === NotificationTemplateType.SCHOOL_PAYMENT_DUE
                    ? 'የትምህርት ክፍያ ማስታወሻ'
                    : 'የክፍያ ማረጋገጫ'
              }</div>
              <div style="margin-bottom:10px;font-size:15px;color:${this.colors.body};"><strong>የዘገየ ክፍያ ወለድ (${this.escapeHtml(
                data.lateDays,
              )} ቀናት):</strong> ብር ${this.escapeHtml(data.lateInterest)}</div>
              <div style="margin-bottom:10px;font-size:15px;color:${this.colors.body};"><strong>የክፍያ መጠን:</strong> ብር ${this.escapeHtml(
                data.paymentAmount,
              )}</div>
              <div style="font-size:15px;color:${this.colors.body};"><strong>የክፍያ ቀን:</strong> ${this.escapeHtml(
                data.paymentDateAmharic,
              )}</div>
            </div>
            <p style="margin:0;font-size:15px;line-height:1.8;color:${this.colors.body};">እናመሰግናለን፣<br />የብድር አገልግሎት ዳይሬክቶሬት<br />አማራ ባንክ</p>
          </section>
        `;
      case NotificationTemplateType.LOAN_DUE_SOON:
      case NotificationTemplateType.LOAN_PAYMENT_REMINDER:
      default:
        return `
          <section>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:${this.colors.body};">ሰላም ${this.escapeHtml(
              data.customerNameAmharic,
            )},</p>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:${this.colors.body};">የብድር ክፍያዎ ቀን ቀርቧል። እባክዎ ከታች ያለውን የክፍያ መረጃ ይመልከቱ።</p>
            <div style="margin:0 0 20px;padding:18px;border:1px solid ${this.colors.border};border-radius:18px;background:${this.colors.softBackground};">
              <div style="margin-bottom:12px;font-size:12px;letter-spacing:0.08em;color:${this.colors.muted};font-weight:800;">የብድር ክፍያ ማስታወሻ</div>
              <div style="margin-bottom:10px;font-size:15px;color:${this.colors.body};"><strong>የክፍያ መጠን:</strong> ብር ${this.escapeHtml(
                data.paymentAmount,
              )}</div>
              <div style="margin-bottom:10px;font-size:15px;color:${this.colors.body};"><strong>የመጨረሻ ቀን:</strong> ${this.escapeHtml(
                data.dueDateAmharic,
              )}</div>
              <div style="font-size:15px;color:${this.colors.body};"><strong>ማጣቀሻ ቁጥር:</strong> ${this.escapeHtml(
                data.referenceNumber,
              )}</div>
            </div>
            <p style="margin:0;font-size:15px;line-height:1.8;color:${this.colors.body};">እናመሰግናለን፣<br />የብድር አገልግሎት ዳይሬክቶሬት<br />አማራ ባንክ</p>
          </section>
        `;
    }
  }

  private buildInAppMessage(
    definition: NotificationTemplateDefinition,
    data: TemplateData,
  ) {
    switch (definition.templateType) {
      case NotificationTemplateType.INSURANCE_RENEWAL_REMINDER:
        return `Your insurance policy ${data.policyNumber} expires in ${data.daysRemaining} days.`;
      case NotificationTemplateType.PAYMENT_CONFIRMATION:
        return `We received your ETB ${data.paymentAmount} payment on ${data.paymentDate}.`;
      case NotificationTemplateType.SCHOOL_PAYMENT_DUE:
        return `School fee reminder: ETB ${data.paymentAmount} is due on ${data.dueDate}. Open School Pay to review and pay.`;
      case NotificationTemplateType.LOAN_DUE_SOON:
      case NotificationTemplateType.LOAN_PAYMENT_REMINDER:
      default:
        return `Your loan payment of ETB ${data.paymentAmount} is due on ${data.dueDate}.`;
    }
  }

  private buildSmsMessage(
    definition: NotificationTemplateDefinition,
    data: TemplateData,
  ) {
    switch (definition.templateType) {
      case NotificationTemplateType.INSURANCE_RENEWAL_REMINDER:
        return `Amhara Bank: Your insurance policy ${data.policyNumber} is due for renewal on ${data.renewalDate}.`;
      case NotificationTemplateType.PAYMENT_CONFIRMATION:
        return `Amhara Bank: We received your ETB ${data.paymentAmount} payment on ${data.paymentDate}.`;
      case NotificationTemplateType.SCHOOL_PAYMENT_DUE:
        return `Amhara Bank: School fee of ETB ${data.paymentAmount} is due on ${data.dueDate}. Open School Pay to review and pay.`;
      case NotificationTemplateType.LOAN_DUE_SOON:
      case NotificationTemplateType.LOAN_PAYMENT_REMINDER:
      default:
        return `Amhara Bank: Your loan payment of ETB ${data.paymentAmount} is due on ${data.dueDate}.`;
    }
  }

  private buildTelegramMessage(
    definition: NotificationTemplateDefinition,
    data: TemplateData,
  ) {
    switch (definition.templateType) {
      case NotificationTemplateType.INSURANCE_RENEWAL_REMINDER:
        return [
          'Amhara Bank',
          '',
          'Insurance Renewal Reminder',
          '',
          `Dear ${data.customerName},`,
          'Your insurance policy is approaching renewal.',
          '',
          `Provider: ${data.provider}`,
          `Policy Number: ${data.policyNumber}`,
          `Renewal Due Date: ${data.renewalDate}`,
          '',
          'Please complete renewal before the deadline.',
          '',
          'አማራ ባንክ',
          '',
          'የኢንሹራንስ እድሳት ማስታወሻ',
          '',
          `ክቡር/ክብርት ${data.customerNameAmharic},`,
          'የኢንሹራንስ ፖሊሲዎ የማደስ ጊዜ ቀርቧል።',
          '',
          `አቅራቢ: ${data.providerAmharic}`,
          `ፖሊሲ ቁጥር: ${data.policyNumber}`,
          `የማደስ ቀን: ${data.renewalDateAmharic}`,
          '',
          'እባክዎ ከቀነ ገደቡ በፊት እድሳቱን ያጠናቅቁ።',
        ].join('\n');
      case NotificationTemplateType.PAYMENT_CONFIRMATION:
        return [
          'Amhara Bank',
          '',
          'Payment Confirmation',
          '',
          `Dear ${data.customerName},`,
          `Payment Amount: ETB ${data.paymentAmount}`,
          `Payment Date: ${data.paymentDate}`,
          '',
          'Thank you for banking with Amhara Bank.',
          '',
          'አማራ ባንክ',
          '',
          'የክፍያ ማረጋገጫ',
          '',
          `ክቡር/ክብርት ${data.customerNameAmharic},`,
          `የክፍያ መጠን: ብር ${data.paymentAmount}`,
          `የክፍያ ቀን: ${data.paymentDateAmharic}`,
          '',
          'ከአማራ ባንክ ጋር ስለሚሰሩ እናመሰግናለን።',
        ].join('\n');
      case NotificationTemplateType.SCHOOL_PAYMENT_DUE:
        return [
          'Amhara Bank',
          '',
          'School Fee Reminder',
          '',
          `Dear ${data.customerName},`,
          `School fee amount: ETB ${data.paymentAmount}`,
          `Due Date: ${data.dueDate}`,
          'Open School Pay in the Amhara Bank app to review and complete payment.',
          '',
          'አማራ ባንክ',
          '',
          'የትምህርት ክፍያ ማስታወሻ',
          '',
          `ክቡር/ክብርት ${data.customerNameAmharic},`,
          `የክፍያ መጠን: ብር ${data.paymentAmount}`,
          `የመጨረሻ ቀን: ${data.dueDateAmharic}`,
          'እባክዎ የትምህርት ክፍያ ክፍልን በመክፈት ክፍያውን ያጠናቅቁ።',
        ].join('\n');
      case NotificationTemplateType.LOAN_DUE_SOON:
      case NotificationTemplateType.LOAN_PAYMENT_REMINDER:
      default:
        return [
          'Amhara Bank',
          '',
          'Loan Payment Reminder',
          '',
          `Dear ${data.customerName},`,
          'Your loan payment is due soon.',
          '',
          `Amount: ETB ${data.paymentAmount}`,
          `Due Date: ${data.dueDate}`,
          `Reference: ${data.referenceNumber}`,
          '',
          'Please make payment before the due date.',
          '',
          'አማራ ባንክ',
          '',
          'የብድር ክፍያ ማስታወሻ',
          '',
          `ክቡር/ክብርት ${data.customerNameAmharic},`,
          'የብድር ክፍያዎ ቀን ቀርቧል።',
          '',
          `የክፍያ መጠን: ብር ${data.paymentAmount}`,
          `የመጨረሻ ቀን: ${data.dueDateAmharic}`,
          `ማጣቀሻ ቁጥር: ${data.referenceNumber}`,
          '',
          'እባክዎ ከመጨረሻ ቀኑ በፊት ክፍያውን ያጠናቅቁ።',
        ].join('\n');
    }
  }

  private buildEmailText(
    definition: NotificationTemplateDefinition,
    data: TemplateData,
    introMessage?: string,
  ) {
    const lines = [definition.subject];
    if (introMessage) {
      lines.push('', introMessage);
    }

    switch (definition.templateType) {
      case NotificationTemplateType.INSURANCE_RENEWAL_REMINDER:
        lines.push(
          '',
          `Dear ${data.customerName},`,
          `Your insurance policy renewal is due in ${data.daysRemaining} days.`,
          `Provider: ${data.provider}`,
          `Policy Number: ${data.policyNumber}`,
          `Renewal Due Date: ${data.renewalDate}`,
        );
        break;
      case NotificationTemplateType.PAYMENT_CONFIRMATION:
        lines.push(
          '',
          `Dear ${data.customerName},`,
          'We have successfully received your payment.',
          `Late Payment Interest (${data.lateDays} days overdue): ETB ${data.lateInterest}`,
          `Payment Amount: ETB ${data.paymentAmount}`,
          `Payment Date: ${data.paymentDate}`,
        );
        break;
      case NotificationTemplateType.SCHOOL_PAYMENT_DUE:
        lines.push(
          '',
          `Dear ${data.customerName},`,
          'Your school fee is due soon.',
          `Payment Amount: ETB ${data.paymentAmount}`,
          `Due Date: ${data.dueDate}`,
          'Open School Pay in the Amhara Bank app to review and complete payment.',
        );
        break;
      default:
        lines.push(
          '',
          `Hello ${data.customerName},`,
          'Your loan payment details are below:',
          `Payment Amount: ETB ${data.paymentAmount}`,
          `Due Date: ${data.dueDate}`,
        );
    }

    return lines.join('\n');
  }

  private prependInfoNote(note: string, content: string) {
    return `<div style="margin:0 0 18px;padding:14px 16px;border-radius:14px;background:${this.colors.softBackground};border:1px solid ${this.colors.border};color:${this.colors.body};font-size:15px;line-height:1.65;">${this.escapeHtml(
      note,
    )}</div>${content}`;
  }

  private wrapHtml(title: string, englishContent: string, amharicContent: string) {
    const emailLogo = this.resolveEmailLogo();
    return this.interpolate(this.layoutTemplate, {
      title,
      logoUrl: emailLogo.src,
      englishContent,
      amharicContent,
    }, ['englishContent', 'amharicContent']);
  }

  private buildAmharicIntroMessage(
    definition: NotificationTemplateDefinition,
    data: TemplateData,
    fallbackNote: string,
  ) {
    switch (definition.templateType) {
      case NotificationTemplateType.INSURANCE_RENEWAL_REMINDER:
        return `የኢንሹራንስ ፖሊሲዎ የማደስ ጊዜ ቀርቧል። ከታች ያለውን የፖሊሲ መረጃ ይመልከቱ እና እድሳቱን በወቅቱ ያጠናቅቁ።`;
      case NotificationTemplateType.PAYMENT_CONFIRMATION:
        return `የ${data.paymentAmount} ብር ክፍያዎ በ${data.paymentDateAmharic} በተሳካ ሁኔታ ተቀብሏል።`;
      case NotificationTemplateType.SCHOOL_PAYMENT_DUE:
        return `የትምህርት ክፍያዎ ቀርቧል። የክፍያ መጠን ብር ${data.paymentAmount} ነው እና የመጨረሻ ቀኑ ${data.dueDateAmharic} ነው።`;
      case NotificationTemplateType.LOAN_DUE_SOON:
      case NotificationTemplateType.LOAN_PAYMENT_REMINDER:
        return `የብድር ክፍያዎ ቀን ቀርቧል። እባክዎ የሚከፈለውን መጠን እና የመጨረሻ ቀኑን ይመልከቱ እና ክፍያውን በወቅቱ ያጠናቅቁ።`;
      default:
        return `ማስታወሻ: ${fallbackNote}`;
    }
  }

  private readTemplate(fileName: string) {
    return readFileSync(join(this.templateDir, fileName), 'utf8');
  }

  private interpolate(template: string, data: TemplateData, rawKeys: string[] = []) {
    return template.replace(/{{\s*([\w]+)\s*}}/g, (_match, key: string) =>
      data[key] !== undefined
        ? rawKeys.includes(key)
          ? data[key]
          : this.escapeHtml(data[key])
        : '',
    );
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private formatDate(date: Date, locale: string = 'en-US') {
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private daysFromNow(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  private resolveEmailLogo() {
    if (this.logoAsset?.cid) {
      return {
        strategy: 'cid' as const,
        src: `cid:${this.logoAsset.cid}`,
      };
    }

    return {
      strategy: 'fallback_data_url' as const,
      src: buildAmharaLogoFallbackDataUrl(),
    };
  }

  private resolveAmharicCustomerName(member: MemberDocument) {
    const knownFullNameMap: Record<string, string> = {
      'Selamawit Molla': 'ሰላማዊት ሞላ',
      'Abebe Kebede': 'አበበ ከበደ',
      'Meseret Alemu': 'መሰረት አለሙ',
      'Mekdes Ali': 'መቅደስ አሊ',
      'Getnet Belay': 'ጌትነት በላይ',
      'Rahel Tesfaye': 'ራሄል ተስፋዬ',
      'Tigist Hailu': 'ትግስት ሃይሉ',
    };
    const normalizedFullName = member.fullName.trim();
    if (knownFullNameMap[normalizedFullName]) {
      return knownFullNameMap[normalizedFullName];
    }

    const knownPartMap: Record<string, string> = {
      Selamawit: 'ሰላማዊት',
      Molla: 'ሞላ',
      Abebe: 'አበበ',
      Kebede: 'ከበደ',
      Meseret: 'መሰረት',
      Alemu: 'አለሙ',
      Mekdes: 'መቅደስ',
      Ali: 'አሊ',
      Getnet: 'ጌትነት',
      Belay: 'በላይ',
      Rahel: 'ራሄል',
      Tesfaye: 'ተስፋዬ',
      Tigist: 'ትግስት',
      Hailu: 'ሃይሉ',
    };

    const translatedParts = normalizedFullName
      .split(/\s+/)
      .map((part) => knownPartMap[part] ?? part);

    return translatedParts.join(' ');
  }
}
