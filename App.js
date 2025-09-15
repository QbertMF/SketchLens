import React, { useState, useEffect, useRef } from 'react';
let AdMobBanner = null;
import Constants from 'expo-constants';
if (Constants.appOwnership !== 'expo') {
  try {
    AdMobBanner = require('expo-ads-admob').AdMobBanner;
  } catch (e) {
    AdMobBanner = null;
  }
}
import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions, PanResponder } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { useKeepAwake } from 'expo-keep-awake';

export default function CameraScreen() {
  const [infoVisible, setInfoVisible] = useState(false);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [overlayImage, setOverlayImage] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState('portrait');
  const cameraRef = useRef(null);

  // Gesture handling for overlay image using PanResponder
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Track initial touch values
  const initialDistance = useRef(0);
  const initialScale = useRef(1);
  const initialX = useRef(0);
  const initialY = useRef(0);
  const lastGestureTime = useRef(0);
  const wasMultiTouch = useRef(false); // Track if gesture started as multi-touch
  const isPinching = useRef(false); // Track if we're currently in pinch mode
  const lastTouchCount = useRef(0); // Track touch count changes

  // Helper function to set scale with logging
  const setScaleValue = (newScale) => {
    //console.log('🎯 setScaleValue called - setting scale from', scale.value, 'to', newScale);
    scale.value = newScale;
    //console.log('🎯 setScaleValue complete - scale.value is now', scale.value);
  };

  // Helper function to calculate distance between two touches
  const getDistance = (touches) => {
    if (!touches || touches.length < 2) {
      //console.log('⚠️ getDistance: Invalid touches', touches ? touches.length : 'null');
      return 0;
    }
    
    const [touch1, touch2] = touches;
    if (!touch1 || !touch2 || !touch1.pageX || !touch1.pageY || !touch2.pageX || !touch2.pageY) {
      //console.log('⚠️ getDistance: Invalid touch data', { touch1, touch2 });
      return 0;
    }
    
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    //console.log('📏 Distance calculated:', {
    //  touch1: { x: touch1.pageX, y: touch1.pageY },
    //  touch2: { x: touch2.pageX, y: touch2.pageY },
    //  dx, dy, distance: distance.toFixed(1)
    //});
    
    return distance;
  };

  // Helper function to constrain translation values
  const constrainTranslation = (x, y) => {
    const maxTranslate = 200; // Limit movement to prevent going off-screen
    return {
      x: Math.max(-maxTranslate, Math.min(maxTranslate, x)),
      y: Math.max(-maxTranslate, Math.min(maxTranslate, y))
    };
  };

  // PanResponder for handling gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        const { nativeEvent } = evt;
        const touchCount = nativeEvent.touches.length;
        //console.log('� Touch start - touches:', touchCount);
        lastTouchCount.current = touchCount;
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { nativeEvent } = evt;
        const touchCount = nativeEvent.touches.length;
        //console.log('👋 Should set responder - touches:', touchCount, 'movement:', gestureState.dx, gestureState.dy);
        return true; // Always take control
      },
      onPanResponderGrant: (evt) => {
        const { nativeEvent } = evt;
        const touchCount = nativeEvent.touches.length;
        //console.log('🚀 Gesture GRANTED - touches:', touchCount);
        
        // Set up initial values regardless of touch count
        initialX.current = translateX.value;
        initialY.current = translateY.value;
        initialScale.current = scale.value;
        
        //console.log('� Initial values set - position:', initialX.current, initialY.current, 'scale:', initialScale.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { nativeEvent } = evt;
        const touchCount = nativeEvent.touches.length;
        
        // Detect touch count changes
        if (touchCount !== lastTouchCount.current) {
          //console.log('🔄 Touch count changed from', lastTouchCount.current, 'to', touchCount);
          lastTouchCount.current = touchCount;
        }
        
        //console.log('📱 MOVE EVENT - touches:', touchCount, 'isPinching:', isPinching.current);
        
        // START PINCH MODE when 2+ touches detected
        if (touchCount >= 2 && !isPinching.current) {
          isPinching.current = true;
          const distance = getDistance(nativeEvent.touches);
          initialDistance.current = distance;
          initialScale.current = scale.value; // Update initial scale when pinch starts
          //console.log('🤏 PINCH MODE ACTIVATED - distance:', distance, 'initialScale:', initialScale.current);
        }
        
        // HANDLE PINCH LOGIC if in pinch mode and have 2+ touches
        if (isPinching.current && touchCount >= 2) {
          const currentDistance = getDistance(nativeEvent.touches);
          //console.log('🤏 PINCH ACTIVE - distance:', currentDistance, 'initial:', initialDistance.current);
          
          if (initialDistance.current > 0 && currentDistance > 0) {
            const scaleRatio = currentDistance / initialDistance.current;
            const newScale = Math.max(0.5, Math.min(2.5, initialScale.current * scaleRatio));
            
            //console.log('🔄 PINCH SCALING - ratio:', scaleRatio.toFixed(2), 'newScale:', newScale.toFixed(2));
            setScaleValue(newScale);
          }
        }
        // HANDLE PAN LOGIC if not pinching and single touch
        else if (!isPinching.current && touchCount === 1) {
          const sensitivity = 0.8;
          const newX = initialX.current + (gestureState.dx * sensitivity);
          const newY = initialY.current + (gestureState.dy * sensitivity);
          const constrained = constrainTranslation(newX, newY);
          translateX.value = constrained.x;
          translateY.value = constrained.y;
          //console.log('👆 PANNING - dx:', gestureState.dx, 'dy:', gestureState.dy);
        }
        // MAINTAIN PINCH STATE if pinching but touch count dropped
        else if (isPinching.current && touchCount < 2) {
          //console.log('🤏 PINCH STATE MAINTAINED - waiting for gesture end, current scale:', scale.value);
        }
      },
      onPanResponderRelease: (evt) => {
        const { nativeEvent } = evt;
        const touchCount = nativeEvent.touches.length;
        //console.log('🛑 Gesture ended - touches:', touchCount, 'final scale:', scale.value, 'isPinching:', isPinching.current);
        
        // Only reset pinch state when NO touches remain (your brilliant suggestion!)
        if (touchCount === 0) {
          //console.log('✅ All fingers lifted - resetting pinch state');
          isPinching.current = false;
          initialDistance.current = 0;
          lastTouchCount.current = 0;
        } else {
          //console.log('👆 Still have touches - maintaining pinch state');
        }
        
        // Spring back to bounds for translation
        const constrained = constrainTranslation(translateX.value, translateY.value);
        translateX.value = withSpring(constrained.x);
        translateY.value = withSpring(constrained.y);
        
        // Ensure scale stays within bounds
        const currentScale = scale.value;
        if (currentScale < 0.5) {
          scale.value = withSpring(0.5);
          //console.log('📏 Scale corrected to minimum: 0.5');
        } else if (currentScale > 2.5) {
          scale.value = withSpring(2.5);
          //console.log('📏 Scale corrected to maximum: 2.5');
        } else {
          //console.log('📏 Scale maintained at:', currentScale);
        }
      },
      onPanResponderTerminationRequest: (evt) => {
        const { nativeEvent } = evt;
        //console.log('🚫 TERMINATION REQUEST - touches:', nativeEvent.touches.length, 'wasMultiTouch:', wasMultiTouch.current);
        // Don't allow termination during multi-touch gestures
        if (nativeEvent.touches.length >= 2 || wasMultiTouch.current) {
          //console.log('🚫 Preventing termination during/after pinch gesture');
          return false;
        }
        //console.log('✅ Allowing termination for single touch gesture');
        return true;
      },
      onShouldBlockNativeResponder: () => {
        // Always block native responder to ensure our gestures work
        return true;
      },
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Prevent screen from sleeping during sketching
  useKeepAwake();

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
      theme: {
        colors: {
          header: '#fff', // white header text
          background: '#3f9c90ff', // dark background
          text: '#fff', // white text
        }
      }
    });

    if (!result.canceled) {
      setOverlayImage(result.assets[0].uri);
      console.log('Overlay image set:', result.assets[0].uri);
      // Reset position when new image is loaded
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
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
    // Reset gesture values when clearing overlay
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const resetImagePosition = () => {
    // Reset position/scale functionality with animation
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    console.log('Reset overlay position and scale');
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
      {/* Info Modal */}
      <Modal
        visible={infoVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={true}>
              <View>
                <Text style={styles.modalTitle}>SketchLens</Text>
                <Text style={styles.modalVersion}>Version 1.0.0</Text>
                <Text style={styles.modalSectionTitle}>Button Guide</Text>
                <Text style={styles.modalText}><Ionicons name="image-outline" size={16} color="#444" />  - Select reference image</Text>
                <Text style={styles.modalText}><Ionicons name="bulb-outline" size={16} color="#444" /> - Adjust overlay opacity</Text>
                <Text style={styles.modalText}><Ionicons name="expand-outline" size={16} color="#444" /> - Overlay image scale</Text>
                <Text style={styles.modalText}><Ionicons name="arrow-undo-outline" size={16} color="#444" /> - Reset overlay</Text>
                <Text style={styles.modalText}><Ionicons name="trash-outline" size={16} color="#444" /> - Remove overlay</Text>
                <Text style={styles.modalText}><Ionicons name="camera-reverse-outline" size={16} color="#444" /> - Swap camera (front/back)</Text>
                <Text style={styles.modalText}><Ionicons name="camera-outline" size={16} color="#444" /> - Take a photo</Text>
                <Text style={styles.modalText}>
                  Change the scale and position of the overlay by pinching with two fingers to zoom in/out, and dragging with one finger to move the image around. 
                </Text>
                <Text style={styles.modalSectionTitle}>App Usage</Text>
                <Text style={styles.modalText}>
                  Either start by taking a photo with the camera button or select the image icon to choose a reference picture from your phone's gallery. Make sure to position the photo over a piece of paper.
                </Text>
                <Text style={styles.modalText}>
                  You might want to place the phone on top of a glass or mug to help with positioning. Adjust the reference picture so that the image is in the desired position.
                </Text>
                <Text style={styles.modalText}>
                  Draw the extents of the object to be copied on the target surface.
                </Text>
                <Text style={styles.modalText}>
                  Note: The camera is not centered, so you may need to offset the phone accordingly to center the object to be copied. Adjust the app settings as needed. Now start tracing the reference image.
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Overlay Image */}
        {overlayImage && (
          <View style={styles.overlayContainer} pointerEvents="box-none">
            <Animated.View 
              style={[
                { 
                  position: 'absolute',
                  top: '15%',
                  left: '5%', 
                  right: '5%',
                  bottom: '15%',
                  zIndex: 1,
                  backgroundColor: 'rgba(0,0,0,0.1)', // Temporary debug background
                  overflow: 'hidden', // Prevent scaled content from going outside bounds
                }, 
                animatedStyle
              ]}
              pointerEvents="auto"
              {...panResponder.panHandlers}
            >
              <Image 
                source={{ uri: overlayImage }} 
                style={{
                  width: '100%',
                  height: '100%',
                  opacity: imageOpacity,
                  resizeMode: 'contain',
                  transform: [
                    { 
                      rotate: orientation === 'landscape' ? '0deg' : '0deg' 
                    }
                  ]
                }}
                resizeMode="contain"
                onLoad={() => console.log('Overlay image loaded successfully')}
                onError={(error) => console.log('Overlay image error:', error)}
              />
            </Animated.View>
          </View>
        )}
        
        {/* Top Controls */}
        <View style={styles.topControls} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={pickImage}
            activeOpacity={0.7}
            pointerEvents="auto"
          >
            <Ionicons name="image-outline" size={28} color="white" />
          </TouchableOpacity>
          {overlayImage && (
            <>
              <TouchableOpacity 
                style={styles.smallButton} 
                onPress={adjustOpacity}
                activeOpacity={0.7}
                pointerEvents="auto"
              >
                <Ionicons name="bulb-outline" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.smallButton} 
                onPress={() => {
                  const newScale = scale.value === 1 ? 1.8 : 1;
                  scale.value = withSpring(newScale);
                  console.log('Expand Manual scale test:', newScale);
                }}
                activeOpacity={0.7}
                pointerEvents="auto"
              >
                <Ionicons name="expand-outline" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.smallButton} 
                onPress={resetImagePosition}
                activeOpacity={0.7}
                pointerEvents="auto"
              >
                <Ionicons name="arrow-undo-outline" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.smallButton} 
                onPress={clearOverlay}
                activeOpacity={0.7}
                pointerEvents="auto"
              >
                <Ionicons name="trash-outline" size={28} color="white" />
              </TouchableOpacity>
            </>
          )}
          {/* Info Button */}
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={() => setInfoVisible(true)}
            activeOpacity={0.7}
            pointerEvents="auto"
          >
            <Ionicons name="information-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.buttonContainer} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
            activeOpacity={0.7}
            pointerEvents="auto"
          >
            <Ionicons name="camera-reverse-outline" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.captureButton}
            activeOpacity={0.7}
            onPress={takePicture}
            pointerEvents="auto"
          >
            <Ionicons name="camera-outline" size={36} color="#222" />
          </TouchableOpacity>
        </View>
      </CameraView>
      {/* AdMob Banner Ad or warning */}
      {Constants.appOwnership === 'expo' ? (
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: 'red', fontSize: 14 }}>
            AdMob is not supported in Expo Go. Build a custom app to enable ads.
          </Text>
        </View>
      ) : AdMobBanner ? (
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <AdMobBanner
            bannerSize="smartBannerPortrait"
            adUnitID="ca-app-pub-5939388532042811/1522862745"
            servePersonalizedAds
            onDidFailToReceiveAdWithError={error => {
              console.log('AdMob error:', error);
            }}
          />
        </View>
      ) : (
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: 'red', fontSize: 14 }}>
            AdMobBanner component not available.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalScroll: {
    width: '100%',
    maxHeight: 350,
    marginBottom: 8,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  modalVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
    alignSelf: 'flex-start',
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  modalCloseButton: {
    marginTop: 18,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
    pointerEvents: 'box-none',
  },
  overlayImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 28,
    right: 22,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  smallButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    width: 46,
    height: 46,
    marginRight: 6,
    elevation: 1000,
    zIndex: 1000,
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
    zIndex: 1000,
    elevation: 1000,
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
