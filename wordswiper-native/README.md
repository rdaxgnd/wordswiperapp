# WordSwiper (React Native / Expo)

A simple swipeable flashcard app for English–Turkish words, ported from the web app. Swipe left/right or tap to advance to the next word.

## Features
- Loads words from `assets/words.json` with inline fallback
- Shuffle on launch
- Swipe gesture with threshold and smooth animations
- Tap-to-advance when not dragging

## Requirements
- Node.js 18+
- Expo CLI (installed automatically via `npx`) and Expo Go app (for running on a physical device)
- iOS Simulator (Xcode) or Android Emulator (Android Studio) if you want to run locally on a simulator

## Getting Started

1. Install dependencies (already installed by scaffold, but you can re-run if needed):

```bash
npm install
```

2. Start the Expo dev server:

```bash
npm start
```

3. Run on your target:

- iOS Simulator:

```bash
npm run ios
```

- Android Emulator:

```bash
npm run android
```

- Web (for quick preview):

```bash
npm run web
```

4. Physical device (Expo Go):
- Make sure your phone and computer are on the same network.
- Open the Expo Go app.
- Scan the QR code printed in the terminal/Expo DevTools.

## Project Structure
- `App.js` — Main RN implementation including gestures and animations
- `assets/words.json` — Word list (EN/TR). You can edit or replace this file.
- `app.json` — Expo config

## Customization
- Update `assets/words.json` to add/remove words.
- Adjust styles in `App.js` within the `StyleSheet.create` block.
- Change the swipe threshold (`SWIPE_THRESHOLD`) or animation durations if desired.

## Notes
- The app uses React Native `Animated` + `PanResponder` to replicate web swipe interactions.
- If you encounter build issues, ensure Xcode/Android Studio are installed and their simulators/emulators work independently.
