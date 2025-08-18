import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [overlayImage, setOverlayImage] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState('portrait');
  const cameraRef = useRef(null);

  useEffect(() => {
    // Method 1: Use Dimensions (fallback)
    const dimensionsSubscription = Dimensions.addEventListener('change', ({ window }) => {
      const newDimensions = window;
      setScreenDimensions(newDimensions);
      
      const newOrientation = newDimensions.width > newDimensions.height ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
      
      console.log(`Dimensions changed - Orientation: ${newOrientation}`, newDimensions);
    });

    // Method 2: Use ScreenOrientation (preferred)
    const setupOrientationListener = async () => {
      try {
        // Get initial orientation
        const initialOrientation = await ScreenOrientation.getOrientationAsync();
        const initialDimensions = Dimensions.get('window');
        setScreenDimensions(initialDimensions);
        
        // Determine orientation string from enum
        const isLandscape = initialOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                           initialOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        const initialOrientationString = isLandscape ? 'landscape' : 'portrait';
        setOrientation(initialOrientationString);
        console.log(`Initial orientation: ${initialOrientationString}`, initialOrientation);

        // Set up orientation change listener
        const orientationSubscription = ScreenOrientation.addOrientationChangeListener((event) => {
          const { orientationInfo } = event;
          const isLandscape = orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                             orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
          
          const newOrientation = isLandscape ? 'landscape' : 'portrait';
          setOrientation(newOrientation);
          
          // Also update screen dimensions
          const newDimensions = Dimensions.get('window');
          setScreenDimensions(newDimensions);
          
          console.log(`ScreenOrientation changed to: ${newOrientation}`, orientationInfo);
        });

        return orientationSubscription;
      } catch (error) {
        console.warn('ScreenOrientation setup failed:', error);
        return null;
      }
    };

    let orientationSubscription = null;
    setupOrientationListener().then(subscription => {
      orientationSubscription = subscription;
    });
    
    return () => {
      dimensionsSubscription?.remove();
      if (orientationSubscription) {
        ScreenOrientation.removeOrientationChangeListener(orientationSubscription);
      }
    };
  }, []);

  // Get screen orientation info
  const getOrientationInfo = () => {
    const { width, height } = screenDimensions;
    const isLandscape = width > height;
    const aspectRatio = width / height;
    
    return {
      isLandscape,
      isPortrait: !isLandscape,
      aspectRatio,
      width,
      height
    };
  };

  if (!permission) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to select an image!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setOverlayImage(result.assets[0].uri);
    }
  };

  const adjustOpacity = () => {
    setImageOpacity(current => {
      if (current >= 0.8) return 0.2;
      return current + 0.2;
    });
  };

  const clearOverlay = () => {
    setOverlayImage(null);
  };

  const getImageRotation = () => {
    // When the device rotates to landscape, we need to counter-rotate the image
    // to maintain its original orientation relative to the real world
    console.log(`Current orientation for rotation: ${orientation}`);
    return orientation === 'landscape' ? '0deg' : '0deg';
  };

  const getOverlayContainerStyle = () => {
    // Container doesn't need to change, it should always fill the screen
    return styles.overlayContainer;
  };

  const getOverlayImageStyle = () => {
    const rotation = getImageRotation();
    console.log(`Applying rotation: ${rotation} for orientation: ${orientation}`);
    
    return {
      ...styles.overlayImage,
      opacity: imageOpacity,
      transform: [{ rotate: rotation }],
    };
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need permission to save photos to your gallery!');
        return;
      }

      // Take the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      
      // Show success message
      Alert.alert(
        'Photo Saved! 📸',
        'Your photo has been saved to your gallery.',
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  return (
    <View style={styles.container} key={`${screenDimensions.width}-${screenDimensions.height}`}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Overlay Image */}
        {overlayImage && (
          <View style={getOverlayContainerStyle()} pointerEvents="none">
            <Image 
              source={{ uri: overlayImage }} 
              style={getOverlayImageStyle()}
              resizeMode="contain"
            />
          </View>
        )}
        
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <Text style={styles.smallButtonText}>📁</Text>
          </TouchableOpacity>
          {overlayImage && (
            <>
              <TouchableOpacity 
                style={styles.smallButton} 
                onPress={adjustOpacity}
                activeOpacity={0.7}
              >
                <Text style={styles.smallButtonText}>🔆</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.smallButton} 
                onPress={clearOverlay}
                activeOpacity={0.7}
              >
                <Text style={styles.smallButtonText}>❌</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Debug orientation indicator */}
          {/* <View style={styles.orientationIndicator}>
            <Text style={styles.orientationText}>{orientation}</Text>
          </View> */}
        </View>

        {/* Bottom Controls */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
            activeOpacity={0.7}
          >
            <Text style={styles.flipText}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.captureButton}
            activeOpacity={0.7}
            onPress={takePicture}
          >
            <Text style={styles.captureText}>📷</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlayImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    zIndex: 100,
    elevation: 100,
  },
  smallButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    width: 50,
    height: 50,
    marginRight: 10,
    elevation: 100,
  },
  smallButtonText: {
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 20,
    includeFontPadding: false,
  },
  orientationIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  orientationText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 50,
    zIndex: 100,
    elevation: 100,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 50,
    width: 80,
    height: 80,
  },
  flipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 50,
    width: 60,
    height: 60,
    elevation: 100,
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    width: 80,
    height: 80,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    elevation: 100,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
  flipText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 20,
    includeFontPadding: false,
    marginTop: -10,
  },
  captureText: {
    fontSize: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 30,
    includeFontPadding: false,
    marginTop: -10,
  },
});
