import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { getSession, clearSession } from '../storage/auth';
import { checkForUpdate } from '../utils/ota';

export default function DashboardScreen({ navigation }) {
  const [session, setSession] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    getSession().then(setSession);
    checkForUpdate();
  }, []);

  const copy = (val, label) => {
    Alert.alert('Copied!', `${label} copied`);
  };
  const logout = async () => { await clearSession(); navigation.replace('Auth'); };

  if (!session?.user) return <View style={styles.center}><ActivityIndicator color="#00ff88" size="large" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{session.user.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dbBadge}>
        <Text style={styles.dbLabel}>DATABASE</Text>
        <Text style={styles.dbName}>{session.user.dbName}</Text>
      </View>

      <Text style={styles.sectionTitle}>API KEYS</Text>
      <View style={styles.keyCard}>
        <Text style={styles.keyLabel}>Anon Key (Public)</Text>
        <Text style={styles.keyValue} numberOfLines={2}>{session.anonKey}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={() => copy(session.anonKey, 'Anon Key')}>
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keyCard}>
        <Text style={styles.keyLabel}>Secret Key</Text>
        <Text style={styles.keyValue} numberOfLines={showSecret ? 5 : 1}>{showSecret ? session.secretKey : '••••••••••••••••••••'}</Text>
        <View style={{ flexDirection:'row' }}>
          <TouchableOpacity style={styles.copyBtn} onPress={() => setShowSecret(!showSecret)}>
            <Text style={styles.copyText}>{showSecret ? 'Hide' : 'Reveal'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>QUICK ACCESS</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Console')}>
          <Text style={styles.quickIcon}>⌨️</Text>
          <Text style={styles.quickLabel}>Console</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.quickIcon}>⚙️</Text>
          <Text style={styles.quickLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0a', padding:20 },
  center: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0a0a0a' },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:16, marginBottom:24 },
  greeting: { color:'#555', fontSize:13 },
  username: { color:'#fff', fontSize:22, fontWeight:'800' },
  logoutBtn: { backgroundColor:'#1a1a1a', borderRadius:8, paddingHorizontal:14, paddingVertical:8, borderWidth:1, borderColor:'#2a2a2a' },
  logoutText: { color:'#ff4444', fontSize:13, fontWeight:'600' },
  dbBadge: { backgroundColor:'#001a0d', borderRadius:10, padding:14, borderWidth:1, borderColor:'#00ff8833', marginBottom:24 },
  dbLabel: { color:'#00ff88', fontSize:11, fontWeight:'700', letterSpacing:1 },
  dbName: { color:'#fff', fontSize:18, fontWeight:'700', marginTop:2 },
  sectionTitle: { color:'#555', fontSize:12, fontWeight:'700', letterSpacing:1, marginBottom:12 },
  keyCard: { backgroundColor:'#111', borderRadius:12, padding:16, borderWidth:1, borderColor:'#222', marginBottom:12 },
  keyLabel: { color:'#555', fontSize:12, marginBottom:6 },
  keyValue: { color:'#00ff88', fontFamily:'monospace', fontSize:12, marginBottom:10 },
  copyBtn: { backgroundColor:'#1a1a1a', borderRadius:6, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#2a2a2a' },
  copyText: { color:'#fff', fontSize:12, fontWeight:'600' },
  quickGrid: { flexDirection:'row', gap:12, marginBottom:24 },
  quickBtn: { flex:1, backgroundColor:'#111', borderRadius:12, padding:20, alignItems:'center', borderWidth:1, borderColor:'#222' },
  quickIcon: { fontSize:28, marginBottom:8 },
  quickLabel: { color:'#fff', fontWeight:'700' },
});
