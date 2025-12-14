import type { FieldSignature } from '../../shared/types';

export function enhanceGreenhouseSignatures(signatures: FieldSignature[]): FieldSignature[] {
  return signatures.map(sig => {
    const enhanced = { ...sig };

    if (sig.element.closest('[data-qa]')) {
      const qaAttr = sig.element.closest('[data-qa]')?.getAttribute('data-qa');
      if (qaAttr) {
        enhanced.nearbyText = `${enhanced.nearbyText} ${qaAttr}`.trim();
      }
    }

    if (sig.name.includes('first_name') || sig.id.includes('first_name')) {
      enhanced.autocomplete = 'given-name';
    } else if (sig.name.includes('last_name') || sig.id.includes('last_name')) {
      enhanced.autocomplete = 'family-name';
    } else if (sig.name.includes('email')) {
      enhanced.autocomplete = 'email';
    } else if (sig.name.includes('phone')) {
      enhanced.autocomplete = 'tel';
    }

    return enhanced;
  });
}
