Sart Expo Go server:
 npx expo start -c 

build release app
npx expo build:android

Production ABB build
npx eas build -p android
eas build -p android --preview development

faster APK build
eas build -p android --profile development

Use:
react-native-google-mobile-ads

"plugins": [
      [
        "react-native-google-mobile-ads",
        {
          //"android_app_id": "ca-app-pub-5939388532042811~8359733839"
          "android_app_id": "ca-app-pub-3940256099942544~3347511713"   // Demo APP ID
        }
      ],

                <BannerAd
            unitId="ca-app-pub-5939388532042811/1522862745"
            unitId="ca-app-pub-3940256099942544/6300978111"   // Demo Banner ID

ChatGPT:
- Generate Vorstellungsgraphik:
Erstelle eine Vorstellungsgraphik für den Google App store. Mit max 1024 × 500 Pixeln. Die app zeigt ein Overlay Bild über der Kameraansicht an, so dass der Verwender das Overlay Bild auf eine Zieloberfläche abzeichnen kann. Die App heisst SketchLens. Das Farbschema ist aus dem angefügten icon ersichtlich. Das Bild soll die App in Aktion zeigen. Das Smartphone liegt auf einem umgedrehten Wasserglass. Der Anwender sieht eine Graphic durch den Bildschirm des Smartphones und zeichnet auf den Untergrund unter dem Smartphone. Das Bild soll stilisiert sein.

Ideas:
- Add camera Zoom option
- Move icons/Buttons in separate container to avoid missed touch events
- Switch on flashlight option

Todo:
- expo doctor
- reduce resolution of assets

V1_8
  1) Fixed Expo Doctor findings
  expo@54.0.7 - expected version: 54.0.12
  react-native-reanimated@4.1.0 - expected version: ~4.1.1
  2) Rewrote privacy statement on web page
  3) Change orientation settings


  Full App Description
SketchLens - Digital Tracing Made Simple
Turn your smartphone into the ultimate artist's companion! SketchLens transforms any surface into your canvas by overlaying reference images through your camera, making tracing and sketching easier than ever before.

🎨 Perfect for Artists & Creators: • Students learning to draw - Practice proportions and techniques • Professional artists - Speed up initial sketches and compositions
• Hobbyists & crafters - Transfer designs to paper, wood, fabric, or any surface • Kids & beginners - Learn drawing fundamentals with guided tracing

📱 Powerful Features: ✅ Live Camera Overlay - See your reference image transparently over real surfaces ✅ Precision Controls - Pan, zoom, and rotate overlays with intuitive gestures
✅ Adjustable Transparency - Fine-tune opacity for perfect visibility ✅ Photo Integration - Import any image from your gallery as reference ✅ Screen Lock Prevention - Keep your screen bright during long drawing sessions ✅ Simple Interface - Clean, distraction-free design focused on creation

🔥 How It Works:

1) Select or take a reference photo
2) Position your phone over paper or canvas
3) Adjust the overlay size and transparency
4) Start tracing with confidence!

💡 Pro Tips: • Use a phone stand or glass for steady positioning • Adjust opacity to balance reference visibility with your work • Perfect for transferring sketches, logos, patterns, or any design

📚 Educational Value: Ideal for art classes, workshops, and self-taught artists. Learn proper proportions, practice line work, and build confidence in your drawing skills.
