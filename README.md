# SketchLens 🎨

A React Native app for tracing images using camera overlay. Perfect for artists, designers, and anyone who wants to trace drawings, patterns, or designs onto paper.

## Features

- 📷 **Camera Integration**: Use your device's camera to see your paper/canvas
- 🖼️ **Image Overlay**: Select any image from your gallery to overlay on the camera view
- 🔆 **Adjustable Opacity**: Fine-tune the transparency of the overlay image for perfect tracing
- 🔄 **Camera Flip**: Switch between front and back cameras
- 📱 **Orientation Support**: Works in both portrait and landscape modes
- ✨ **Responsive UI**: Buttons remain functional across all orientations

## How to Use

1. **Grant Permissions**: Allow camera and media library access
2. **Select Image**: Tap the 📁 button to choose a reference image from your gallery
3. **Adjust Transparency**: Use the 🔆 button to cycle through opacity levels (20%, 40%, 60%, 80%)
4. **Position & Trace**: Align your phone so the overlay matches your paper and start tracing!
5. **Clear Overlay**: Tap ❌ to remove the current overlay image

## Perfect For

- **Art Tracing**: Trace drawings, logos, or complex designs
- **Calligraphy Practice**: Overlay letter templates and practice writing
- **Pattern Transfer**: Transfer sewing patterns or craft templates
- **Educational Activities**: Trace maps, diagrams, or learning materials
- **Design Work**: Transfer sketches or reference images

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- React Native development environment

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/SketchLens.git

# Navigate to project directory
cd SketchLens

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device
- Install Expo Go app on your phone
- Scan the QR code from the terminal
- Or use `npm run android` / `npm run ios` for device builds

## Dependencies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **expo-camera**: Camera functionality
- **expo-image-picker**: Image selection from gallery
- **expo-screen-orientation**: Orientation handling

## Project Structure

```
SketchLens/
├── App.js                 # Main application component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── assets/               # App icons and splash screens
└── README.md            # This file
```

## Technical Features

- **Touch Event Handling**: Proper layering ensures buttons work with overlay images
- **Responsive Design**: Dynamic layout adjustment for orientation changes
- **Permission Management**: Handles camera and media library permissions
- **Cross-Platform**: Works on both iOS and Android devices

## Future Enhancements

- [ ] Save traced images
- [ ] Grid overlay options
- [ ] Multiple image overlays
- [ ] Zoom and pan functionality
- [ ] Custom opacity slider
- [ ] Image filters and adjustments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React Native and Expo
- Camera functionality powered by expo-camera
- Image handling via expo-image-picker

---

**Made with ❤️ for artists and creators**
