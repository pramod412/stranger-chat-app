/**
 * Safety & Content Filtering Engine
 * Screens text messages for severe profanities, slurs, harassment patterns, personal data leaks, and spam.
 */

// Custom list of severe harassment patterns and abusive keywords
const SEVERE_PATTERNS = [
  /\b(kill\s*your\s*self|kys|die\s*in\s*a\s*fire)\b/i,
  /\b(nigg[ae]r|fagg?ot|kike|chink|spic|cunt)\b/i,
  /\b(send\s*nudes|cp|pedophil|underage\s*sex)\b/i
];

const MODERATE_PROFANITY = [
  /\b(fuck\w*|shit\w*|bitch\w*|asshole\w*|dick\w*|pussy\w*|bastard\w*|slut\w*|whore\w*)\b/i
];

// Anti-doxxing: Phone numbers, social handles, or suspicious links
const SENSITIVE_INFO_PATTERNS = [
  /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone numbers
  /\b(https?:\/\/[^\s]+|www\.[^\s]+)\b/i // URLs/links
];

export class ContentFilter {
  constructor() {
    this.customBlocklist = new Set();
  }

  /**
   * Evaluates text for safety violations
   * @param {string} text 
   * @returns {{ isAllowed: boolean, violation: string|null, cleanedText: string, severity: 'none'|'warning'|'blocked' }}
   */
  evaluate(text) {
    if (!text || typeof text !== 'string') {
      return { isAllowed: true, violation: null, cleanedText: '', severity: 'none' };
    }

    const trimmed = text.trim();

    // Check for severe harassment or hate speech
    for (const pattern of SEVERE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isAllowed: false,
          violation: 'Severe violation of Community Guidelines (Hate speech/Harassment).',
          cleanedText: trimmed.replace(pattern, '***'),
          severity: 'blocked'
        };
      }
    }

    // Check for excessive repetitive characters / spam flood
    if (/(.)\1{12,}/i.test(trimmed)) {
      return {
        isAllowed: false,
        violation: 'Message rejected: detected excessive repetitive spam.',
        cleanedText: trimmed,
        severity: 'warning'
      };
    }

    // Censor moderate profanities if needed (allowing conversation with masked text)
    let cleaned = trimmed;
    let containsModerate = false;

    for (const pattern of MODERATE_PROFANITY) {
      if (pattern.test(cleaned)) {
        containsModerate = true;
        cleaned = cleaned.replace(new RegExp(pattern.source, 'gi'), (match) => '*'.repeat(match.length));
      }
    }

    // Flag potential doxxing/links
    let containsSensitive = false;
    for (const pattern of SENSITIVE_INFO_PATTERNS) {
      if (pattern.test(trimmed)) {
        containsSensitive = true;
      }
    }

    return {
      isAllowed: true,
      violation: containsSensitive ? 'Warning: Never share personal phone numbers, passwords, or suspicious links.' : null,
      cleanedText: cleaned,
      severity: containsModerate || containsSensitive ? 'warning' : 'none'
    };
  }
}

export const contentFilter = new ContentFilter();
