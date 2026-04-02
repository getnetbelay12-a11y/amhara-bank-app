import { readFileSync } from 'fs';
import { join } from 'path';

export const AMHARA_EMAIL_BRAND = {
  colors: {
    primary: '#0A4FA3',
    primaryDark: '#083B79',
    teal: '#3E7EDB',
    gold: '#F2C94C',
    pageBackground: '#F5F7FA',
    cardBackground: '#FFFFFF',
    softBackground: '#EAF1FB',
    border: '#D6E1F1',
    titleText: '#15314B',
    bodyText: '#243844',
    mutedText: '#60758C',
  },
  logoCid: 'amhara-bank-logo',
} as const;

export type EmailAttachmentAsset = {
  filename: string;
  content: Buffer;
  contentType: string;
  cid?: string;
};

export function loadAmharaLogoAsset(repoRoot: string): EmailAttachmentAsset | null {
  try {
    const logoPath = join(repoRoot, 'assets', 'amhara-bank-logo.png');
    return {
      filename: 'amhara-bank-logo.png',
      content: readFileSync(logoPath),
      contentType: 'image/png',
      cid: AMHARA_EMAIL_BRAND.logoCid,
    };
  } catch {
    return null;
  }
}

export function buildAmharaLogoFallbackDataUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="28" fill="#ffffff"/>
      <text x="60" y="56" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0A4FA3">AMHARA</text>
      <text x="60" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#F2C94C">BANK</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
