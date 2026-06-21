import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { getSession, clearSession, saveSession } from '../storage/auth';
import { checkForUpdate } from '../utils/ota';
import { connectWebSocket, disconnectWebSocket } from '../utils/wsSync';
import { authAPI } from '../api/muwandb';

export default function DashboardScreen({ navigation }) {
  const [session, setSession] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [refreshPass, setRefreshPass] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSession();
    checkForUpdate();
    return () => disconnectWebSocket();
  }, []);

  const loadSession = async () => {
    const s = await getSession();
    setSession(s);
    connectWebSocket((anonKey, secretKey) => {
      setSession(prev => ({ ...prev, anonKey, secretKey }));
    });
  };

  const copy = (val, label) => {
    Clipboard.setString(val);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  const refreshKeys = async () => {
    if (!refreshPass) return Alert.alert('Error', 'Password required');
    setRefreshing(true);
    try {
      const res = await authAPI.login(session.user.username, refreshPass);
      const { anonKey, secretKey } = res.data;
      await saveSession(session.user, anonKey, secretKey);
      setSession(prev => ({ ...prev, anonKey, secretKey }));
      setShowRefreshModal(false);
      setRefreshPass('');
      Alert.alert('Done!', 'Keys refreshed successfully!');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally { setRefreshing(false); }
  };

  const logout = async () => { await clearSession(); navigation.replace('Auth'); };

  if (!session?.user) return (
    <View style={styles.center}><ActivityIndicator color="#00ff88" size="large" /></View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>

      {showRefreshModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>🔑</Text>
            <Text style={styles.modalTitle}>Refresh API Keys</Text>
            <Text style={styles.modalDesc}>Password daalo to generate new keys</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Your password"
              placeholderTextColor="#555"
              value={refreshPass}
              onChangeText={setRefreshPass}
              secureTextEntry
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowRefreshModal(false); setRefreshPass(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={refreshKeys} disabled={refreshing}>
                {refreshing
                  ? <ActivityIndicator color="#000" size="small" />
                  : <Text style={styles.modalConfirmText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{session.user.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Database Online</Text>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      </View>

      <View style={styles.dbBadge}>
        <Text style={styles.dbLabel}>DATABASE</Text>
        <Text style={styles.dbName}>{session.user.dbName}</Text>
      </View>

      <View style={styles.keysHeader}>
        <Text style={styles.sectionTitle}>API KEYS</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => setShowRefreshModal(true)}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Keys</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keyCard}>
        <View style={styles.keyRow}>
          <Text style={styles.keyLabel}>Anon Key</Text>
          <View style={styles.frontendSafeBadge}>
            <Text style={styles.frontendSafeText}>Frontend Safe</Text>
          </View>
        </View>
        <Text style={styles.keyValue} numberOfLines={2}>{session.anonKey}</Text>
        <Text style={styles.keyDesc}>Use in frontend — RLS enforced</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.copyBtn} onPress={() => copy(session.anonKey, 'Anon Key')}>
            <Text style={styles.copyText}>📋 Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.keyCard}>
        <View style={styles.keyRow}>
          <Text style={styles.keyLabel}>Secret Key</Text>
          <View style={styles.backendBadge}>
            <Text style={styles.backendBadgeText}>Backend Only</Text>
          </View>
        </View>
        <Text style={styles.keyValue} numberOfLines={showSecret ? 5 : 1}>
          {showSecret ? session.secretKey : '••••••••••••••••••••'}
        </Text>
        <Text style={styles.keyDesc}>Never expose in frontend!</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.copyBtn} onPress={() => setShowSecret(!showSecret)}>
            <Text style={styles.copyText}>{showSecret ? '🙈 Hide' : '👁️ Reveal'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.copyBtn} onPress={() => copy(session.secretKey, 'Secret Key')}>
            <Text style={styles.copyText}>📋 Copy</Text>
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
  modalOverlay: { position:'absolute', top:0, left:-20, right:-20, bottom:0, backgroundColor:'rgba(0,0,0,0.85)', zIndex:100, justifyContent:'center', alignItems:'center', padding:20 },
  modal: { backgroundColor:'#111', borderRadius:16, padding:24, width:'100%', borderWidth:1, borderColor:'#222' },
  modalIcon: { fontSize:32, textAlign:'center', marginBottom:8 },
  modalTitle: { color:'#fff', fontSize:18, fontWeight:'800', textAlign:'center', marginBottom:4 },
  modalDesc: { color:'#555', fontSize:13, textAlign:'center', marginBottom:20 },
  modalInput: { backgroundColor:'#1a1a1a', borderRadius:10, padding:14, color:'#fff', borderWidth:1, borderColor:'#2a2a2a', marginBottom:16, fontSize:14 },
  modalBtns: { flexDirection:'row', gap:8 },
  modalCancelBtn: { flex:1, backgroundColor:'#1a1a1a', borderRadius:10, padding:14, alignItems:'center', borderWidth:1, borderColor:'#2a2a2a' },
  modalCancelText: { color:'#fff', fontWeight:'600' },
  modalConfirmBtn: { flex:1, backgroundColor:'#00ff88', borderRadius:10, padding:14, alignItems:'center' },
  modalConfirmText: { color:'#000', fontWeight:'800' },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:16, marginBottom:16 },
  greeting: { color:'#555', fontSize:13 },
  username: { color:'#fff', fontSize:22, fontWeight:'800' },
  logoutBtn: { backgroundColor:'#1a1a1a', borderRadius:8, paddingHorizontal:14, paddingVertical:8, borderWidth:1, borderColor:'#2a2a2a' },
  logoutText: { color:'#ff4444', fontSize:13, fontWeight:'600' },
  statusCard: { flexDirection:'row', alignItems:'center', backgroundColor:'#111', borderRadius:10, padding:14, borderWidth:1, borderColor:'#222', marginBottom:16, gap:10 },
  statusDot: { width:10, height:10, borderRadius:5, backgroundColor:'#00ff88' },
  statusText: { color:'#fff', fontWeight:'600', flex:1 },
  activeBadge: { backgroundColor:'#00ff8822', borderRadius:6, paddingHorizontal:8, paddingVertical:3 },
  activeBadgeText: { color:'#00ff88', fontSize:12, fontWeight:'700' },
  dbBadge: { backgroundColor:'#001a0d', borderRadius:10, padding:14, borderWidth:1, borderColor:'#00ff8833', marginBottom:16 },
  dbLabel: { color:'#00ff88', fontSize:11, fontWeight:'700', letterSpacing:1 },
  dbName: { color:'#fff', fontSize:18, fontWeight:'700', marginTop:2 },
  keysHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  sectionTitle: { color:'#555', fontSize:12, fontWeight:'700', letterSpacing:1, marginBottom:12 },
  refreshBtn: { backgroundColor:'#1a1a1a', borderRadius:8, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#2a2a2a' },
  refreshBtnText: { color:'#00ff88', fontSize:12, fontWeight:'600' },
  keyCard: { backgroundColor:'#111', borderRadius:12, padding:16, borderWidth:1, borderColor:'#222', marginBottom:12 },
  keyRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  keyLabel: { color:'#fff', fontSize:14, fontWeight:'600' },
  frontendSafeBadge: { backgroundColor:'#fbbf2422', borderRadius:6, paddingHorizontal:8, paddingVertical:3 },
  frontendSafeText: { color:'#fbbf24', fontSize:11, fontWeight:'700' },
  backendBadge: { backgroundColor:'#7c3aed22', borderRadius:6, paddingHorizontal:8, paddingVertical:3 },
  backendBadgeText: { color:'#7c3aed', fontSize:11, fontWeight:'700' },
  keyValue: { color:'#00ff88', fontFamily:'monospace', fontSize:11, marginBottom:6 },
  keyDesc: { color:'#555', fontSize:11, marginBottom:10 },
  btnRow: { flexDirection:'row', gap:8 },
  copyBtn: { backgroundColor:'#1a1a1a', borderRadius:6, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#2a2a2a' },
  copyText: { color:'#fff', fontSize:12, fontWeight:'600' },
  quickGrid: { flexDirection:'row', gap:12 },
  quickBtn: { flex:1, backgroundColor:'#111', borderRadius:12, padding:20, alignItems:'center', borderWidth:1, borderColor:'#222' },
  quickIcon: { fontSize:28, marginBottom:8 },
  quickLabel: { color:'#fff', fontWeight:'700' },
});
