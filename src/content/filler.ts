import type { Profile, FieldMatch, FillResult } from '../shared/types';
import { fillInput, fillSelect, formatPhone } from '../shared/utils';

export function fillFields(matches: FieldMatch[], profile: Profile): FillResult {
  const result: FillResult = {
    filled: 0,
    skipped: 0,
    errors: [],
    matches: [],
  };

  for (const match of matches) {
    try {
      const value = getProfileValue(match.profileKey, profile);

      if (!value) {
        result.skipped++;
        continue;
      }

      const success = fillField(match, value);

      result.matches.push({
        profileKey: match.profileKey,
        value,
        success,
      });

      if (success) {
        result.filled++;
        highlightField(match.element, true);
      } else {
        result.skipped++;
        highlightField(match.element, false);
      }
    } catch (error) {
      result.errors.push(`Failed to fill ${match.profileKey}: ${error}`);
      result.skipped++;
    }
  }

  return result;
}

function getProfileValue(profileKey: string, profile: Profile): string {
  const parts = profileKey.split('.');

  if (parts.length === 1) {
    const key = parts[0] as keyof Profile['basics'] | keyof Profile['location'] | keyof Profile['links'];

    if (key in profile.basics) {
      const value = profile.basics[key as keyof Profile['basics']];
      if (key === 'phone') {
        return formatPhone(value || '');
      }
      return value || '';
    }

    if (key in profile.location) {
      return profile.location[key as keyof Profile['location']] || '';
    }

    if (key in profile.links) {
      return profile.links[key as keyof Profile['links']] || '';
    }
  }

  const basicKeys: (keyof Profile['basics'])[] = ['firstName', 'lastName', 'fullName', 'email', 'phone'];
  for (const key of basicKeys) {
    if (profileKey === key) {
      const value = profile.basics[key];
      if (key === 'phone') {
        return formatPhone(value || '');
      }
      return value || '';
    }
  }

  const locationKeys: (keyof Profile['location'])[] = ['address1', 'address2', 'city', 'state', 'zip', 'country'];
  for (const key of locationKeys) {
    if (profileKey === key) {
      return profile.location[key] || '';
    }
  }

  const linkKeys: (keyof Profile['links'])[] = ['linkedin', 'github', 'portfolio', 'other'];
  for (const key of linkKeys) {
    if (profileKey === key) {
      return profile.links[key] || '';
    }
  }

  return '';
}

function fillField(match: FieldMatch, value: string): boolean {
  const { element } = match;

  try {
    if (element instanceof HTMLSelectElement) {
      return fillSelect(element, value);
    }

    if (element instanceof HTMLInputElement && element.type === 'checkbox') {
      return false;
    }

    if (element instanceof HTMLInputElement && element.type === 'radio') {
      return false;
    }

    fillInput(element, value);
    return true;
  } catch (error) {
    console.error('Failed to fill field:', error);
    return false;
  }
}

function highlightField(element: HTMLElement, success: boolean): void {
  const originalBorder = element.style.border;
  const originalOutline = element.style.outline;

  if (success) {
    element.style.border = '2px solid #10b981';
    element.style.outline = 'none';
  } else {
    element.style.border = '2px solid #f59e0b';
    element.style.outline = 'none';
  }

  setTimeout(() => {
    element.style.border = originalBorder;
    element.style.outline = originalOutline;
  }, 2000);
}
