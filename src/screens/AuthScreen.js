import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { authAPI } from '../api/muwandb';
import { saveSession } from '../storage/auth';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dbName, setDbName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) return Alert.alert('Error', 'Fill all fields');
    if (mode === 'register' && !dbName) return Alert.alert('Error', 'Enter DB name');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login(username, password)
        : await authAPI.register(username, password, dbName);
      const { anonKey, secretKey } = res.data;
      await saveSession({ username, dbName: dbName || res.data.dbName }, anonKey, secretKey);
      if (mode === 'register') Alert.alert('Registered!', `Anon Key: ${anonKey}\n\nSecret Key: ${secretKey}\n\nSave these!`);
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logo}>Muwan<Text style={styles.accent}>DB</Text></Text>
        <Text style={styles.tagline}>Your Private Database Engine</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, mode==='login' && styles.tabActive]} onPress={() => setMode('login')}>
            <Text style={[styles.tabText, mode==='login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, mode==='register' && styles.tabActive]} onPress={() => setMode('register')}>
            <Text style={[styles.tabText, mode==='register' && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#555" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry />
        {mode === 'register' && <TextInput style={styles.input} placeholder="Database Name" placeholderTextColor="#555" value={dbName} onChangeText={setDbName} autoCapitalize="none" />}
        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>{mode === 'login' ? 'Login' : 'Register'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flexGrow:1, backgroundColor:'#0a0a0a', justifyContent:'center', padding:24 },
  logoBox: { alignItems:'center', marginBottom:40 },
  logo: { fontSize:42, fontWeight:'900', color:'#fff', letterSpacing:2 },
  accent: { color:'#00ff88' },
  tagline: { color:'#555', marginTop:6, fontSize:13 },
  card: { backgroundColor:'#111', borderRadius:16, padding:24, borderWidth:1, borderColor:'#222' },
  tabs: { flexDirection:'row', marginBottom:24, backgroundColor:'#0a0a0a', borderRadius:10, padding:4 },
  tab: { flex:1, paddingVertical:10, alignItems:'center', borderRadius:8 },
  tabActive: { backgroundColor:'#00ff88' },
  tabText: { color:'#555', fontWeight:'600' },
  tabTextActive: { color:'#000' },
  input: { backgroundColor:'#1a1a1a', borderRadius:10, padding:14, color:'#fff', marginBottom:14, borderWidth:1, borderColor:'#2a2a2a', fontSize:15 },
  btn: { backgroundColor:'#00ff88', borderRadius:10, padding:16, alignItems:'center', marginTop:6 },
  btnText: { color:'#000', fontWeight:'800', fontSize:16 },
});
