# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd extension
npm install
```

### 2. Create Icons
You need three icon files in `public/icons/`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Quick way to create placeholder icons:
- Use https://www.favicon-generator.org/
- Upload any square image
- Download the generated icons
- Rename and place in `public/icons/`

### 3. Build
```bash
npm run build
```

### 4. Load in Chrome
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `extension/dist` folder

## Usage

### First Time Setup
1. Click the extension icon
2. Click "Open Options"
3. Fill in your profile (at minimum: name, email, phone)
4. Click "Save Profile"

### Fill a Job Application
1. Go to any job application (try Greenhouse or Lever)
2. Click the extension icon
3. Click "Fill This Page"
4. Watch your fields get filled!

## Test Sites

Try these example job boards to test:
- **Greenhouse**: Search "careers greenhouse" and find any company using it
- **Lever**: Search "careers lever" and find any company using it
- **Generic**: Any standard HTML form

## What Gets Filled

The extension will attempt to fill:
- ✅ Name fields (first, last, full)
- ✅ Email
- ✅ Phone
- ✅ Address fields
- ✅ Location (city, state, zip, country)
- ✅ LinkedIn, GitHub, Portfolio URLs

Fields are highlighted:
- 🟢 Green = Successfully filled
- 🟠 Orange = Skipped (couldn't match or no data)

## Development

Watch mode for development:
```bash
npm run dev
```

After making changes, reload the extension in `chrome://extensions/` by clicking the refresh icon.

## Troubleshooting

**Q: Fields aren't filling**
- Make sure you saved your profile in Options
- Check browser console for matching scores
- Some fields may not match if labels are unusual

**Q: Extension won't load**
- Ensure you ran `npm run build`
- Verify icons exist in `public/icons/`
- Check for errors in `chrome://extensions/`

**Q: Profile not saving**
- Check browser console for errors
- Try export/import to verify encryption works

## Next Steps

1. Add more profile data in Options (work experience, education)
2. Test on real job applications
3. Export your profile as backup
4. Customize field matching in `src/content/matcher.ts`

## File Structure Quick Reference

```
extension/
├── src/
│   ├── content/       → Field detection and autofill logic
│   ├── popup/         → Extension popup UI
│   ├── options/       → Profile settings page
│   ├── background/    → Background service worker
│   └── shared/        → Types, storage, crypto utils
├── manifest.json      → Extension configuration
└── README.md          → Full documentation
```

## Support

- Full docs: See [README.md](README.md)
- Architecture details: See README "How It Works" section
- Add new platforms: See README "Development" section
