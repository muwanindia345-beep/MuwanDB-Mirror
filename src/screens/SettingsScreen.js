import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { authAPI } from '../api/muwandb';
import { getSession, clearSession } from '../storage/auth';

export default function SettingsScreen({ navigation }) {
  const [session, setSession] = useState(null);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [rlsTable, setRlsTable] = useState('');
  const [rlsRule, setRlsRule] = useState('');
  const [rlsList, setRlsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getSession().then(s => { setSession(s); loadRLS(s); }); }, []);

  const loadRLS = async (s) => {
    try { const res = await authAPI.getRLS(s.user.username, s.secretKey); setRlsList(res.data.rules || []); } catch {}
  };

  const changePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) return Alert.alert('Error', 'Fill all fields');
    if (newPass !== confirmPass) return Alert.alert('Error', 'Passwords do not match!');
    if (newPass.length < 8) return Alert.alert('Error', 'Min 8 characters required');
    setLoading(true);
    try {
      await authAPI.changePassword(session.user.username, oldPass, newPass, session.secretKey);
      Alert.alert('Success', 'Password changed!');
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  const setRLS = async () => {
    if (!rlsTable || !rlsRule) return Alert.alert('Error', 'Fill table and rule');
    setLoading(true);
    try {
      await authAPI.setRLS(session.user.username, rlsTable, rlsRule, session.secretKey);
      Alert.alert('Success', 'RLS rule set!');
      setRlsTable(''); setRlsRule('');
      loadRLS(session);
    } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  const deleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure? Cannot be undone!', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await authAPI.deleteAccount(session.user.username, oldPass, session.secretKey);
          await clearSession();
          navigation.replace('Auth');
        } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message); }
      }}
    ]);
  };

  if (!session) return <View style={styles.center}><ActivityIndicator color="#00ff88" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>USERNAME</Text>
        <Text style={styles.infoValue}>{session.user.username}</Text>
        <Text style={styles.infoLabel}>DATABASE</Text>
        <Text style={styles.infoValue}>{session.user.dbName}</Text>
        <Text style={styles.infoLabel}>STATUS</Text>
        <Text style={[styles.infoValue, { color: '#00ff88' }]}>Active</Text>
      </View>

      <Text style={styles.sectionTitle}>🔑 CHANGE PASSWORD</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Old Password" placeholderTextColor="#555" value={oldPass} onChangeText={setOldPass} secureTextEntry />
        <TextInput style={styles.input} placeholder="New Password (min 8 chars)" placeholderTextColor="#555" value={newPass} onChangeText={setNewPass} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm New Password" placeholderTextColor="#555" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry />
        <TouchableOpacity style={styles.btn} onPress={changePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Change Password</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>🛡️ ROW LEVEL SECURITY</Text>
      <Text style={styles.sectionDesc}>Anon key users only see rows matching their userId</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Table name (e.g. posts)" placeholderTextColor="#555" value={rlsTable} onChangeText={setRlsTable} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder='Column (e.g. user_id)' placeholderTextColor="#555" value={rlsRule} onChangeText={setRlsRule} autoCapitalize="none" />
        <TouchableOpacity style={styles.btn} onPress={setRLS} disabled={loading}>
          <Text style={styles.btnText}>Set RLS Rule</Text>
        </TouchableOpacity>
        {rlsList.length > 0 && rlsList.map((r, i) => (
          <View key={i} style={styles.rlsItem}>
            <Text style={styles.rlsTable}>{r.table}</Text>
            <Text style={styles.rlsRule}>{JSON.stringify(r.rule)}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.dangerBtn} onPress={deleteAccount}>
        <Text style={styles.dangerText}>🗑️ Delete Account</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0a', padding:20 },
  center: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0a0a0a' },
  infoCard: { backgroundColor:'#111', borderRadius:12, padding:16, borderWidth:1, borderColor:'#222', marginBottom:24, marginTop:10 },
  infoLabel: { color:'#555', fontSize:11, textTransform:'uppercase', letterSpacing:1, marginTop:8 },
  infoValue: { color:'#fff', fontSize:15, fontWeight:'600' },
  sectionTitle: { color:'#fff', fontSize:14, fontWeight:'700', letterSpacing:1, marginBottom:4 },
  sectionDesc: { color:'#555', fontSize:12, marginBottom:12 },
  card: { backgroundColor:'#111', borderRadius:12, padding:16, borderWidth:1, borderColor:'#222', marginBottom:24 },
  input: { backgroundColor:'#1a1a1a', borderRadius:10, padding:14, color:'#fff', marginBottom:12, borderWidth:1, borderColor:'#2a2a2a', fontSize:14 },
  btn: { backgroundColor:'#00ff88', borderRadius:10, padding:14, alignItems:'center' },
  btnText: { color:'#000', fontWeight:'800', fontSize:14 },
  rlsItem: { backgroundColor:'#1a1a1a', borderRadius:8, padding:10, marginTop:10 },
  rlsTable: { color:'#00ff88', fontFamily:'monospace', fontSize:12, fontWeight:'700' },
  rlsRule: { color:'#888', fontFamily:'monospace', fontSize:11, marginTop:2 },
  dangerBtn: { backgroundColor:'#1a0000', borderRadius:12, padding:16, alignItems:'center', borderWidth:1, borderColor:'#ff444433' },
  dangerText: { color:'#ff4444', fontWeight:'700', fontSize:15 },
});
