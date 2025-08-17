import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [overlayImage, setOverlayImage] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

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

  return (
    <View style={styles.container} key={`${screenDimensions.width}-${screenDimensions.height}`}>
      <CameraView style={styles.camera} facing={facing}>
        {/* Overlay Image */}
        {overlayImage && (
          <View style={styles.overlayContainer} pointerEvents="none">
            <Image 
              source={{ uri: overlayImage }} 
              style={[styles.overlayImage, { opacity: imageOpacity }]}
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
        </View>

        {/* Bottom Controls */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
            activeOpacity={0.7}
          >
            <Text style={styles.text}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.captureButton}
            activeOpacity={0.7}
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
    padding: 10,
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
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 50,
    width: 60,
    height: 60,
    elevation: 100,
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
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
  },
  captureText: {
    fontSize: 30,
    textAlign: 'center',
  },
});
