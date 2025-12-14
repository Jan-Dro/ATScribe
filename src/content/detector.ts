import type { PlatformType } from '../shared/types';

export function detectPlatform(): PlatformType {
  const url = window.location.href;
  const hostname = window.location.hostname;

  if (isGreenhouse(url, hostname)) {
    return 'greenhouse';
  }

  if (isLever(url, hostname)) {
    return 'lever';
  }

  return 'generic';
}

function isGreenhouse(_url: string, hostname: string): boolean {
  if (hostname.includes('greenhouse.io') || hostname.includes('boards.greenhouse.io')) {
    return true;
  }

  const hasGreenhouseForm = document.querySelector('#application_form') !== null ||
    document.querySelector('[data-qa="application-form"]') !== null ||
    document.querySelector('.application-form') !== null;

  const hasGreenhouseScript = Array.from(document.querySelectorAll('script'))
    .some(script => script.src.includes('greenhouse'));

  return hasGreenhouseForm || hasGreenhouseScript;
}

function isLever(_url: string, hostname: string): boolean {
  if (hostname.includes('jobs.lever.co') || hostname.includes('lever.co')) {
    return true;
  }

  const hasLeverForm = document.querySelector('.application-form') !== null ||
    document.querySelector('[class*="lever"]') !== null;

  const hasLeverScript = Array.from(document.querySelectorAll('script'))
    .some(script => script.src.includes('lever'));

  return hasLeverForm || hasLeverScript;
}
