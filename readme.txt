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

