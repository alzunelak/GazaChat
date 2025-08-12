import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

export default function UsernameScreen({ navigation }) {
  const [username, setUsername] = useState('');

  async function saveUsername() {
    if (!username) return alert('Please enter a username');
    try {
      await EncryptedStorage.setItem('username', username);
      navigation.navigate('QRCodeScreen', { username });
    } catch (e) {
      alert('Failed to save username');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your username</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
      />
      <Button title="Save & Generate QR" onPress={saveUsername} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
