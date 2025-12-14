const STOPWORDS = new Set(['please', 'enter', 'your', 'the', 'a', 'an', 'and', 'or', 'but', 'for']);

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(word => !STOPWORDS.has(word))
    .join(' ');
}

export function createFieldId(element: Element): string {
  const name = element.getAttribute('name') || '';
  const id = element.getAttribute('id') || '';
  const label = findLabelText(element);
  const signature = `${name}|${id}|${normalizeString(label)}`;
  return hashString(signature);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function findLabelText(element: Element): string {
  const inputElement = element as HTMLInputElement;

  if (inputElement.labels && inputElement.labels.length > 0) {
    return inputElement.labels[0].textContent?.trim() || '';
  }

  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) {
      return label.textContent?.trim() || '';
    }
  }

  let current = element.parentElement;
  while (current) {
    if (current.tagName === 'LABEL') {
      return current.textContent?.trim() || '';
    }
    current = current.parentElement;
  }

  const prevSibling = element.previousElementSibling;
  if (prevSibling && prevSibling.tagName === 'LABEL') {
    return prevSibling.textContent?.trim() || '';
  }

  return '';
}

export function getNearbyText(element: Element, maxDistance = 2): string {
  const texts: string[] = [];
  let current = element.parentElement;
  let depth = 0;

  while (current && depth < maxDistance) {
    const text = Array.from(current.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent?.trim())
      .filter(Boolean)
      .join(' ');

    if (text) {
      texts.push(text);
    }

    current = current.parentElement;
    depth++;
  }

  return texts.join(' ');
}

export function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  );
}

export function fillInput(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): void {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set;

  if (element instanceof HTMLInputElement && nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else if (element instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
    nativeTextAreaValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function fillSelect(element: HTMLSelectElement, value: string): boolean {
  const normalizedValue = normalizeString(value);

  for (let i = 0; i < element.options.length; i++) {
    const option = element.options[i];
    const optionText = normalizeString(option.textContent || '');
    const optionValue = normalizeString(option.value);

    if (optionText === normalizedValue || optionValue === normalizedValue) {
      element.selectedIndex = i;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
      return true;
    }
  }

  for (let i = 0; i < element.options.length; i++) {
    const option = element.options[i];
    const optionText = normalizeString(option.textContent || '');
    const optionValue = normalizeString(option.value);

    if (optionText.includes(normalizedValue) || optionValue.includes(normalizedValue)) {
      element.selectedIndex = i;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
      return true;
    }
  }

  return false;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits;
}

export function formatWorkExperience(workExperience: Array<{
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  summary?: string;
}>): string {
  if (!workExperience || workExperience.length === 0) {
    return '';
  }

  return workExperience
    .map(job => {
      const lines: string[] = [];
      
      // Title at Company
      if (job.title && job.company) {
        lines.push(`${job.title} at ${job.company}`);
      } else if (job.title) {
        lines.push(job.title);
      } else if (job.company) {
        lines.push(job.company);
      }

      // Date range
      const startDate = job.startDate || '';
      const endDate = job.endDate || 'Present';
      if (startDate) {
        lines.push(`${startDate} - ${endDate}`);
      }

      // Location
      if (job.location) {
        lines.push(job.location);
      }

      // Summary/Description
      if (job.summary) {
        lines.push('');
        lines.push(job.summary);
      }

      return lines.join('\n');
    })
    .join('\n\n');
}
