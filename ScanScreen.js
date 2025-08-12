import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { RNCamera } from 'react-native-camera';

export default function ScanScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    async function requestCameraPermission() {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to scan QR codes',
            buttonPositive: 'OK',
          },
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    }
    requestCameraPermission();
  }, []);

  function onBarCodeRead({ data }) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.username) {
        Alert.alert('Friend Found!', `Username: ${parsed.username}`, [
          {
            text: 'Connect',
            onPress: () => {
              // Navigate to chat or save friend info here
              navigation.goBack();
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Invalid QR Code', 'QR code does not contain a valid username.');
      }
    } catch (e) {
      Alert.alert('Invalid QR Code', 'Unable to parse QR code data.');
    }
  }

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        onBarCodeRead={onBarCodeRead}
        captureAudio={false}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
      />
      <Text style={styles.instruction}>Point camera at friend’s QR code</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  instruction: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#00000088',
    color: 'white',
    fontSize: 16,
  },
});
