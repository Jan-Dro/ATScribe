import type { Message, FillResult } from '../shared/types';
import { getProfile } from '../shared/storage';
import { detectPlatform } from './detector';
import { extractFields } from './extractor';
import { matchFields } from './matcher';
import { fillFields } from './filler';
import { enhanceGreenhouseSignatures } from './platforms/greenhouse';
import { enhanceLeverSignatures } from './platforms/lever';
import { enhanceGenericSignatures } from './platforms/generic';

async function handleFillPage(): Promise<FillResult> {
  const profile = await getProfile();

  if (!profile) {
    return {
      filled: 0,
      skipped: 0,
      errors: ['No profile found. Please set up your profile in the extension options.'],
      matches: [],
    };
  }

  const platform = detectPlatform();
  console.log('Detected platform:', platform);

  let signatures = extractFields();
  console.log(`Extracted ${signatures.length} fields`);

  switch (platform) {
    case 'greenhouse':
      signatures = enhanceGreenhouseSignatures(signatures);
      break;
    case 'lever':
      signatures = enhanceLeverSignatures(signatures);
      break;
    case 'generic':
      signatures = enhanceGenericSignatures(signatures);
      break;
  }

  const matches = matchFields(signatures);
  console.log(`Matched ${matches.length} fields`);

  const result = fillFields(matches, profile);
  console.log('Fill result:', result);

  return result;
}

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message.type === 'FILL_PAGE') {
    handleFillPage()
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        sendResponse({
          success: false,
          result: {
            filled: 0,
            skipped: 0,
            errors: [error.message],
            matches: [],
          },
        });
      });
    return true;
  }

  if (message.type === 'DETECT_PLATFORM') {
    const platform = detectPlatform();
    sendResponse({ platform });
    return true;
  }
});

console.log('Job Autofill Extension content script loaded');
