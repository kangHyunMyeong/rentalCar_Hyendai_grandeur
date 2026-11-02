import type { Choice, QuoteResult } from '../features/rental/types';

export type LeadSubmission = {
  name: string;
  phone: string;
  note: string;
  selection: Choice;
  quote: QuoteResult;
  privacyConsent: boolean;
  createdAt: string;
};

export async function submitLead(payload: LeadSubmission): Promise<'sent' | 'unconfigured'> {
  const endpoint = import.meta.env.VITE_LEADS_API_URL;
  if (!endpoint) return 'unconfigured';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('상담 신청 전송에 실패했습니다.');
  return 'sent';
}
