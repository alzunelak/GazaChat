import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export default function BluetoothScanScreen({ navigation }) {
  const [devices, setDevices] = useState(new Map());
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        const allGranted = Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
        if (!allGranted) {
          Alert.alert('Permissions required', 'Bluetooth permissions are required to scan devices.');
        }
      }
    }
    requestPermissions();

    return () => {
      stopScan();
      manager.destroy();
    };
  }, []);

  function startScan() {
    setDevices(new Map());
    setIsScanning(true);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Scan error:', error);
        setIsScanning(false);
        return;
      }
      if (device && device.name) {
        setDevices(prev => new Map(prev.set(device.id, device)));
      }
    });
  }

  function stopScan() {
    manager.stopDeviceScan();
    setIsScanning(false);
  }

  function onDevicePress(device) {
    Alert.alert('Device selected', `Device: ${device.name}`, [
      {
        text: 'Connect',
        onPress: () => {
          // Implement connect logic here later
          Alert.alert('Connect feature coming soon!');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={isScanning ? stopScan : startScan}>
        <Text style={styles.buttonText}>{isScanning ? 'Stop Scan' : 'Start Scan'}</Text>
      </TouchableOpacity>

      <FlatList
        data={Array.from(devices.values())}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deviceItem} onPress={() => onDevicePress(item)}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noDevices}>No devices found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  deviceItem: {
    padding: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  deviceName: { fontSize: 18, fontWeight: 'bold' },
  deviceId: { fontSize: 12, color: '#666' },
  noDevices: { textAlign: 'center', marginTop: 40, color: '#999' },
});
