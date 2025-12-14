# Job Application Autofill Extension

A Chrome Extension (Manifest V3) that detects common job application forms and autofills them using your stored profile data. Works on major ATS platforms including Greenhouse, Lever, and generic HTML forms.

## Features

- **Profile Management**: Store your personal information, work experience, education, and skills securely
- **Encrypted Storage**: All data is encrypted using AES-GCM before being stored locally
- **Platform Detection**: Automatically detects Greenhouse, Lever, and generic application forms
- **Smart Field Matching**: Uses intelligent matching with synonyms and scoring to fill the right fields
- **Visual Feedback**: Highlights filled fields (green) and skipped fields (orange)
- **Safe**: No auto-submit, no network calls, no data collection
- **Export/Import**: Backup and restore your profile data

## Supported Platforms

### MVP (Current)
- ✅ Greenhouse
- ✅ Lever
- ✅ Generic HTML forms

### Future
- Workday (complex)
- Ashby
- iCIMS

## Installation

### Development Build

1. Install dependencies:
```bash
cd extension
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Add icons (required):
   - Create or download 16x16, 48x48, and 128x128 PNG icons
   - Place them in `public/icons/` as `icon16.png`, `icon48.png`, `icon128.png`

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension/dist` folder

### Development Mode (Watch)

```bash
npm run dev
```

This will watch for file changes and rebuild automatically. You'll need to click the refresh button in `chrome://extensions/` to reload the extension after changes.

## Usage

### 1. Set Up Your Profile

1. Click the extension icon in Chrome
2. Click "Open Options"
3. Fill in your information:
   - Basic info (name, email, phone)
   - Location (address, city, state, zip, country)
   - Links (LinkedIn, GitHub, portfolio)
   - Work experience
   - Education
   - Skills
4. Click "Save Profile"

### 2. Fill a Job Application

1. Navigate to a job application page (Greenhouse, Lever, or any form)
2. Click the extension icon
3. The extension will show the detected platform
4. Click "Fill This Page"
5. The extension will fill matching fields and show you the results

### 3. Backup/Restore

- **Export**: Click "Export Profile" in options to download your profile as JSON
- **Import**: Click "Import Profile" and select a previously exported JSON file

## Architecture

```
extension/
├── src/
│   ├── background/
│   │   └── serviceWorker.ts      # Background service worker
│   ├── content/
│   │   ├── index.ts               # Content script entry point
│   │   ├── detector.ts            # Platform detection
│   │   ├── extractor.ts           # Field extraction
│   │   ├── matcher.ts             # Field matching with scoring
│   │   ├── filler.ts              # Autofill engine
│   │   └── platforms/
│   │       ├── greenhouse.ts      # Greenhouse-specific logic
│   │       ├── lever.ts           # Lever-specific logic
│   │       └── generic.ts         # Generic fallback
│   ├── popup/
│   │   ├── popup.html
│   │   └── Popup.tsx              # Popup UI
│   ├── options/
│   │   ├── options.html
│   │   └── Options.tsx            # Options page UI
│   └── shared/
│       ├── types.ts               # TypeScript types
│       ├── storage.ts             # Storage utilities
│       ├── crypto.ts              # Encryption utilities
│       └── utils.ts               # Shared utilities
├── public/
│   └── icons/                     # Extension icons
├── manifest.json                  # Extension manifest
├── vite.config.ts                 # Build configuration
└── package.json
```

## How It Works

### 1. Platform Detection

The extension checks the URL and DOM for platform-specific signatures:
- **Greenhouse**: `greenhouse.io` domains, `#application_form`, `[data-qa="application-form"]`
- **Lever**: `lever.co` domains, `.application-form` classes
- **Generic**: Fallback for any other forms

### 2. Field Extraction

Extracts all visible input, textarea, and select elements that are:
- Not hidden, disabled, or readonly
- Not submit buttons or file inputs
- Actually visible in the DOM

### 3. Field Matching

For each field, creates a signature containing:
- Label text (via `<label for>`, wrapper, or sibling)
- Attributes (name, id, aria-label, placeholder, autocomplete)
- Nearby text nodes

Matches against profile keys using:
- **Strong signals** (1.0 score):
  - `autocomplete` attribute matches (e.g., `given-name` → `firstName`)
  - Input type matches (e.g., `type="email"` → `email`)
- **Medium signals** (0.8-0.9):
  - Label/name/id contains exact synonym
- **Weak signals** (0.5-0.7):
  - Partial matches, nearby text

Only fills if match score > 0.72 threshold.

### 4. Autofill

Fills fields by:
1. Setting the value using native setters
2. Dispatching `input`, `change`, and `blur` events (required for React/Vue forms)
3. For selects: matching option text or value (normalized)
4. Highlighting filled fields (green) and skipped fields (orange) for 2 seconds

### 5. Security

- All profile data is encrypted with AES-GCM using WebCrypto
- Encryption key is generated on first use and stored locally
- No network calls (everything is local)
- No data collection or tracking

## Field Matching Synonyms

The matcher recognizes these synonyms:

| Profile Key | Synonyms |
|-------------|----------|
| firstName | first name, given name, forename, fname |
| lastName | last name, surname, family name, lname |
| email | email, e-mail, email address, mail |
| phone | phone, mobile, cell, telephone, phone number, tel |
| address1 | address, street address, address line 1, street |
| city | city, town |
| state | state, province, region |
| zip | zip, zipcode, postal, postal code, postcode |
| linkedin | linkedin, linked in |
| github | github, git hub |
| portfolio | portfolio, website, personal site, site |

## Troubleshooting

### Extension not loading
- Ensure you've built the extension (`npm run build`)
- Check that icons exist in `public/icons/`
- Look for errors in `chrome://extensions/` with Developer mode enabled

### Fields not filling
- Check that you've saved your profile in Options
- Open DevTools Console to see matching debug logs
- Some fields may have low match scores (< 0.72 threshold)
- Try manually checking the field labels and names

### Profile not saving
- Check for errors in DevTools Console
- Ensure you have storage permissions
- Try exporting/importing to verify data

## Development

### Adding a New Platform

1. Create `src/content/platforms/yourplatform.ts`:
```typescript
import type { FieldSignature } from '../../shared/types';

export function enhanceYourPlatformSignatures(signatures: FieldSignature[]): FieldSignature[] {
  return signatures.map(sig => {
    // Add platform-specific enhancements
    return sig;
  });
}
```

2. Add detection in `src/content/detector.ts`:
```typescript
function isYourPlatform(url: string, hostname: string): boolean {
  // Add detection logic
  return false;
}
```

3. Wire it up in `src/content/index.ts`

### Adding New Profile Fields

1. Update `Profile` type in `src/shared/types.ts`
2. Add synonyms in `src/content/matcher.ts`
3. Update UI in `src/options/Options.tsx`
4. Update value extraction in `src/content/filler.ts`

## Non-Goals

This extension is designed to be a **safe, assistive tool**:

- ❌ No bulk applying to multiple jobs
- ❌ No CAPTCHA bypassing
- ❌ No auto-submitting applications
- ❌ No scraping private data
- ❌ No network requests

## Privacy

- All data stays on your device
- No analytics or tracking
- No external API calls
- Encrypted storage
- Open source (you can audit the code)

## License

MIT

## Contributing

Contributions welcome! Please:
1. Test on real job application sites
2. Add new platform support
3. Improve matching accuracy
4. Report bugs and edge cases
