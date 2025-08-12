import React from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeScreen({ route, navigation }) {
  const { username } = route.params;

  // For now QR just encodes username (later add public key)
  const qrData = JSON.stringify({ username });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your QR Code</Text>
      <QRCode value={qrData} size={250} />
      <Button title="Scan Friend's QR" onPress={() => navigation.navigate('ScanScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent: 'center', alignItems:'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
});
