import type { FieldSignature, FieldMatch } from '../shared/types';
import { normalizeString } from '../shared/utils';

const SYNONYMS: Record<string, string[]> = {
  firstName: ['first name', 'given name', 'forename', 'fname'],
  lastName: ['last name', 'surname', 'family name', 'lname'],
  fullName: ['full name', 'name', 'your name'],
  email: ['email', 'e mail', 'email address', 'mail'],
  phone: ['phone', 'mobile', 'cell', 'telephone', 'phone number', 'tel'],
  address1: ['address', 'street address', 'address line 1', 'street', 'address1'],
  address2: ['address line 2', 'address2', 'apt', 'apartment', 'suite', 'unit'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'zipcode', 'postal', 'postal code', 'postcode'],
  country: ['country', 'nation'],
  linkedin: ['linkedin', 'linked in'],
  github: ['github', 'git hub'],
  portfolio: ['portfolio', 'website', 'personal site', 'site', 'web site'],
};

const AUTOCOMPLETE_MAP: Record<string, string> = {
  'given-name': 'firstName',
  'family-name': 'lastName',
  'name': 'fullName',
  'email': 'email',
  'tel': 'phone',
  'tel-national': 'phone',
  'street-address': 'address1',
  'address-line1': 'address1',
  'address-line2': 'address2',
  'address-level2': 'city',
  'address-level1': 'state',
  'postal-code': 'zip',
  'country': 'country',
  'country-name': 'country',
  'url': 'portfolio',
};

const MATCH_THRESHOLD = 0.72;

export function matchFields(signatures: FieldSignature[]): FieldMatch[] {
  const matches: FieldMatch[] = [];

  for (const signature of signatures) {
    const match = findBestMatch(signature);
    if (match && match.score >= MATCH_THRESHOLD) {
      matches.push(match);
    }
  }

  return matches;
}

function findBestMatch(signature: FieldSignature): FieldMatch | null {
  let bestProfileKey = '';
  let bestScore = 0;

  for (const [profileKey, synonyms] of Object.entries(SYNONYMS)) {
    const score = calculateScore(signature, profileKey, synonyms);
    if (score > bestScore) {
      bestScore = score;
      bestProfileKey = profileKey;
    }
  }

  if (bestScore === 0) {
    return null;
  }

  return {
    element: signature.element,
    profileKey: bestProfileKey,
    score: bestScore,
    signature,
  };
}

function calculateScore(
  signature: FieldSignature,
  profileKey: string,
  synonyms: string[]
): number {
  let score = 0;

  if (signature.autocomplete) {
    const mappedKey = AUTOCOMPLETE_MAP[signature.autocomplete.toLowerCase()];
    if (mappedKey === profileKey) {
      score += 1.0;
      return score;
    }
  }

  if (signature.type === 'email' && profileKey === 'email') {
    score += 0.95;
  }

  if (signature.type === 'tel' && profileKey === 'phone') {
    score += 0.95;
  }

  if (signature.type === 'url' && profileKey === 'portfolio') {
    score += 0.9;
  }

  const normalizedLabel = normalizeString(signature.label);
  const labelScore = calculateTextScore(normalizedLabel, synonyms);
  score += labelScore * 0.9;

  const normalizedName = normalizeString(signature.name);
  const nameScore = calculateTextScore(normalizedName, synonyms);
  score += nameScore * 0.85;

  const normalizedId = normalizeString(signature.id);
  const idScore = calculateTextScore(normalizedId, synonyms);
  score += idScore * 0.8;

  const normalizedPlaceholder = normalizeString(signature.placeholder);
  const placeholderScore = calculateTextScore(normalizedPlaceholder, synonyms);
  score += placeholderScore * 0.7;

  const normalizedAriaLabel = normalizeString(signature.ariaLabel);
  const ariaScore = calculateTextScore(normalizedAriaLabel, synonyms);
  score += ariaScore * 0.85;

  const normalizedNearbyText = normalizeString(signature.nearbyText);
  const nearbyScore = calculateTextScore(normalizedNearbyText, synonyms);
  score += nearbyScore * 0.5;

  return Math.min(score, 1.0);
}

function calculateTextScore(text: string, synonyms: string[]): number {
  if (!text) {
    return 0;
  }

  for (const synonym of synonyms) {
    if (text === synonym) {
      return 1.0;
    }
  }

  for (const synonym of synonyms) {
    if (text.includes(synonym)) {
      return 0.8;
    }
  }

  for (const synonym of synonyms) {
    const words = text.split(' ');
    const synonymWords = synonym.split(' ');

    let matchCount = 0;
    for (const word of synonymWords) {
      if (words.includes(word)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      return matchCount / synonymWords.length * 0.6;
    }
  }

  return 0;
}
