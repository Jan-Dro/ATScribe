import type { FieldSignature } from '../shared/types';
import { findLabelText, getNearbyText, isElementVisible } from '../shared/utils';

export function extractFields(): FieldSignature[] {
  const fields: FieldSignature[] = [];

  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select'
  );

  inputs.forEach(element => {
    if (!shouldIncludeField(element)) {
      return;
    }

    const signature = createFieldSignature(element);
    fields.push(signature);
  });

  return fields;
}

function shouldIncludeField(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
  if (element.hasAttribute('hidden')) {
    return false;
  }

  if (element.disabled) {
    return false;
  }

  if ((element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) && element.readOnly) {
    return false;
  }

  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    if (['submit', 'button', 'image', 'reset', 'file'].includes(type)) {
      return false;
    }

    if (type === 'hidden') {
      return false;
    }
  }

  if (!isElementVisible(element)) {
    return false;
  }

  return true;
}

function createFieldSignature(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): FieldSignature {
  const label = findLabelText(element);
  const name = element.getAttribute('name') || '';
  const id = element.getAttribute('id') || '';
  const placeholder = element.getAttribute('placeholder') || '';
  const autocomplete = element.getAttribute('autocomplete') || '';
  const ariaLabel = element.getAttribute('aria-label') || '';
  const nearbyText = getNearbyText(element);

  let type = '';
  if (element instanceof HTMLInputElement) {
    type = element.type.toLowerCase();
  } else if (element instanceof HTMLTextAreaElement) {
    type = 'textarea';
  } else if (element instanceof HTMLSelectElement) {
    type = 'select';
  }

  return {
    element,
    label,
    name,
    id,
    type,
    placeholder,
    autocomplete,
    ariaLabel,
    nearbyText,
  };
}
