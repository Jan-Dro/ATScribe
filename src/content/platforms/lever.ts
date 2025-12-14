import type { FieldSignature } from '../../shared/types';

export function enhanceLeverSignatures(signatures: FieldSignature[]): FieldSignature[] {
  return signatures.map(sig => {
    const enhanced = { ...sig };

    const formField = sig.element.closest('.application-field');
    if (formField) {
      const labelText = formField.querySelector('label')?.textContent?.trim();
      if (labelText && !enhanced.label) {
        enhanced.label = labelText;
      }
    }

    if (sig.name.includes('name') && sig.name.includes('first')) {
      enhanced.autocomplete = 'given-name';
    } else if (sig.name.includes('name') && sig.name.includes('last')) {
      enhanced.autocomplete = 'family-name';
    } else if (sig.name.includes('email')) {
      enhanced.autocomplete = 'email';
    } else if (sig.name.includes('phone')) {
      enhanced.autocomplete = 'tel';
    }

    return enhanced;
  });
}
