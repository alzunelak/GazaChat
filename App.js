import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import QRCode from 'react-native-qrcode-svg';
import { RNCamera } from 'react-native-camera';

import { BleManager } from 'react-native-ble-plx';

const Stack = createStackNavigator();
const bleManager = new BleManager();

// -- Screen 1: Username input --

function UsernameScreen({ navigation }) {
  const [username, setUsername] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your username</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
      />
      <Button
        title="Next"
        onPress={() => {
          if (!username.trim()) {
            Alert.alert('Please enter a username');
            return;
          }
          navigation.navigate('QRCodeScreen', { username: username.trim() });
        }}
      />
    </View>
  );
}

// -- Screen 2: QR Code generation --

function QRCodeScreen({ route, navigation }) {
  const { username } = route.params;

  // Simple QR payload: just username (you can extend this later)
  const qrValue = JSON.stringify({ username });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your QR Code</Text>
      <QRCode value={qrValue} size={250} />
      <Button title="Scan Friend's QR" onPress={() => navigation.navigate('ScanScreen')} />
      <Button title="Bluetooth Scan" onPress={() => navigation.navigate('BluetoothScanScreen')} />
    </View>
  );
}

// -- Screen 3: QR Code Scanner --

function ScanScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    async function requestCameraPermission() {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
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
        Alert.alert('Friend found!', `Username: ${parsed.username}`, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Invalid QR code', 'No username found in QR');
      }
    } catch {
      Alert.alert('Invalid QR code', 'Cannot parse QR data');
    }
  }

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No camera permission</Text>;

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        style={{ flex: 1 }}
        onBarCodeRead={onBarCodeRead}
        captureAudio={false}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
      />
    </View>
  );
}

// -- Screen 4: Bluetooth Scan --

function BluetoothScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState(new Map());

  useEffect(() => {
    return () => {
      bleManager.stopDeviceScan();
    };
  }, []);

  async function startScan() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const allGranted = Object.values(granted).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED,
      );
      if (!allGranted) {
        Alert.alert('Permissions required', 'Bluetooth permissions needed');
        return;
      }
    }

    setDevices(new Map());
    setScanning(true);
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Alert.alert('Scan error', error.message);
        setScanning(false);
        return;
      }
      if (device && device.name) {
        setDevices((prev) => new Map(prev.set(device.id, device)));
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  }

  function stopScan() {
    bleManager.stopDeviceScan();
    setScanning(false);
  }

  return (
    <View style={styles.container}>
      <Button title={scanning ? 'Stop Scan' : 'Start Scan'} onPress={scanning ? stopScan : startScan} />
      <FlatList
        data={Array.from(devices.values())}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deviceItem}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No devices found</Text>}
      />
    </View>
  );
}

// -- Main App navigator --

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UsernameScreen">
        <Stack.Screen name="UsernameScreen" component={UsernameScreen} options={{ title: 'Enter Username' }} />
        <Stack.Screen name="QRCodeScreen" component={QRCodeScreen} options={{ title: 'Your QR Code' }} />
        <Stack.Screen name="ScanScreen" component={ScanScreen} options={{ title: 'Scan QR Code' }} />
        <Stack.Screen name="BluetoothScanScreen" component={BluetoothScanScreen} options={{ title: 'Bluetooth Scan' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  deviceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  deviceName: {
    fontSize: 18,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
});
