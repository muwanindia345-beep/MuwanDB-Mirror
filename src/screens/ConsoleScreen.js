import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { queryAPI } from '../api/muwandb';
import { getSession } from '../storage/auth';

const QUICK_QUERIES = [
  { label: 'SHOW TABLES', query: 'SHOW TABLES' },
  { label: 'Select All', query: 'SELECT * FROM users' },
  { label: 'Select LIMIT', query: 'SELECT * FROM users LIMIT 10 OFFSET 0' },
  { label: 'Select ORDER', query: 'SELECT * FROM users ORDER BY id DESC' },
  { label: 'Count Rows', query: 'SELECT COUNT(*) FROM users' },
  { label: 'INSERT', query: 'INSERT INTO users VALUES (name="Saad", email="s@s.com")' },
  { label: 'UPDATE', query: 'UPDATE users SET name="Ali" WHERE id="1"' },
  { label: 'DELETE', query: 'DELETE FROM users WHERE id="1"' },
  { label: 'DROP TABLE', query: 'DROP TABLE users' },
  { label: 'CREATE TABLE', query: 'CREATE TABLE users (id, name, email)' },
];

export default function ConsoleScreen() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anonKey, setAnonKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [useSecret, setUseSecret] = useState(false);
  const [dbPassword, setDbPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getSession().then(s => {
      setAnonKey(s.anonKey || '');
      setSecretKey(s.secretKey || '');
    });
  }, []);

  const runQuery = async () => {
    if (!query.trim()) return;
    if (!dbPassword) { setError('DB Password required!'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const key = useSecret ? secretKey : anonKey;
      const res = await queryAPI.raw(query.trim(), key, dbPassword);
      setResult(res.data);
      setHistory(prev => [{
        query: query.trim(),
        time: new Date().toLocaleTimeString(),
        success: true
      }, ...prev.slice(0, 19)]);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
      setHistory(prev => [{
        query: query.trim(),
        time: new Date().toLocaleTimeString(),
        success: false
      }, ...prev.slice(0, 19)]);
    } finally { setLoading(false); }
  };

  const renderResult = () => {
    if (!result) return null;
    if (Array.isArray(result)) {
      if (result.length === 0) return <Text style={styles.empty}>No rows returned</Text>;
      const cols = Object.keys(result[0]);
      return (
        <ScrollView horizontal>
          <View>
            <View style={styles.tableRow}>
              {cols.map(c => <Text key={c} style={styles.tableHeader}>{c}</Text>)}
            </View>
            {result.map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                {cols.map(c => <Text key={c} style={styles.tableCell}>{String(row[c] ?? '')}</Text>)}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }
    return <Text style={styles.resultText}>{JSON.stringify(result, null, 2)}</Text>;
  };

  return (
    <View style={styles.container}>

      {/* Key Toggle */}
      <View style={styles.keyToggle}>
        <TouchableOpacity
          style={[styles.keyBtn, !useSecret && styles.keyBtnActive]}
          onPress={() => setUseSecret(false)}>
          <Text style={[styles.keyBtnText, !useSecret && styles.keyBtnTextActive]}>🔓 Anon Key</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.keyBtn, useSecret && styles.keyBtnActive]}
          onPress={() => setUseSecret(true)}>
          <Text style={[styles.keyBtnText, useSecret && styles.keyBtnTextActive]}>🔐 Secret Key</Text>
        </TouchableOpacity>
      </View>

      {/* DB Password */}
      <View style={styles.passwordBox}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Database Password 🔑"
          placeholderTextColor="#444"
          value={dbPassword}
          onChangeText={setDbPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Queries */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcuts}>
        {QUICK_QUERIES.map((s, i) => (
          <TouchableOpacity key={i} style={styles.shortcut} onPress={() => setQuery(s.query)}>
            <Text style={styles.shortcutText}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Editor */}
      <View style={styles.editorBox}>
        <TextInput
          style={styles.editor}
          value={query}
          onChangeText={setQuery}
          placeholder="Write MQL query..."
          placeholderTextColor="#333"
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.editorFooter}>
          <TouchableOpacity onPress={() => { setQuery(''); setResult(null); setError(null); }}>
            <Text style={styles.clearText}>🗑️ Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.runBtn} onPress={runQuery} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#000" size="small" />
              : <Text style={styles.runText}>▶ Run</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.output}>

        {/* Output */}
        <View style={styles.outputBox}>
          <View style={styles.outputHeader}>
            <View style={styles.dots}>
              <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
              <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
              <View style={[styles.dot, { backgroundColor: '#28ca41' }]} />
            </View>
            <Text style={styles.outputTitle}>Output</Text>
          </View>
          {!result && !error && <Text style={styles.waiting}>&gt; Waiting for query...</Text>}
          {error && <Text style={styles.errorText}>❌ {error}</Text>}
          {result && renderResult()}
        </View>

        {/* History */}
        {history.length > 0 && (
          <View style={styles.historyBox}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyLabel}>🕐 History</Text>
              <TouchableOpacity onPress={() => setHistory([])}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            {history.map((h, i) => (
              <TouchableOpacity key={i} onPress={() => setQuery(h.query)} style={styles.historyItem}>
                <Text style={styles.historyIcon}>{h.success ? '✅' : '❌'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyQuery} numberOfLines={1}>{h.query}</Text>
                  <Text style={styles.historyTime}>{h.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0a' },
  keyToggle: { flexDirection:'row', margin:12, backgroundColor:'#111', borderRadius:10, padding:4, borderWidth:1, borderColor:'#222' },
  keyBtn: { flex:1, paddingVertical:8, alignItems:'center', borderRadius:8 },
  keyBtnActive: { backgroundColor:'#00ff88' },
  keyBtnText: { color:'#555', fontSize:12, fontWeight:'600' },
  keyBtnTextActive: { color:'#000' },
  passwordBox: { flexDirection:'row', marginHorizontal:12, marginBottom:8, backgroundColor:'#111', borderRadius:10, borderWidth:1, borderColor:'#222', alignItems:'center' },
  passwordInput: { flex:1, color:'#fff', padding:12, fontSize:13, fontFamily:'monospace' },
  eyeBtn: { padding:12 },
  eyeText: { fontSize:16 },
  shortcuts: { maxHeight:44, paddingHorizontal:12, marginBottom:8 },
  shortcut: { backgroundColor:'#1a1a1a', borderRadius:6, paddingHorizontal:10, paddingVertical:6, marginRight:8, borderWidth:1, borderColor:'#2a2a2a' },
  shortcutText: { color:'#00ff88', fontSize:11, fontFamily:'monospace' },
  editorBox: { marginHorizontal:12, backgroundColor:'#111', borderRadius:12, borderWidth:1, borderColor:'#222', overflow:'hidden', marginBottom:8 },
  editor: { color:'#00ff88', fontFamily:'monospace', fontSize:13, padding:14, minHeight:90, textAlignVertical:'top' },
  editorFooter: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:8, borderTopWidth:1, borderColor:'#222' },
  clearText: { color:'#555', fontSize:12, paddingHorizontal:8 },
  runBtn: { backgroundColor:'#00ff88', borderRadius:8, paddingHorizontal:20, paddingVertical:10, alignItems:'center' },
  runText: { color:'#000', fontWeight:'800', fontSize:13 },
  output: { flex:1, paddingHorizontal:12 },
  outputBox: { backgroundColor:'#111', borderRadius:12, borderWidth:1, borderColor:'#222', marginBottom:12, overflow:'hidden' },
  outputHeader: { flexDirection:'row', alignItems:'center', padding:10, borderBottomWidth:1, borderColor:'#222', gap:8 },
  dots: { flexDirection:'row', gap:5 },
  dot: { width:10, height:10, borderRadius:5 },
  outputTitle: { color:'#555', fontSize:12, fontWeight:'600' },
  waiting: { color:'#333', fontFamily:'monospace', fontSize:12, padding:14 },
  errorText: { color:'#ff4444', fontFamily:'monospace', fontSize:12, padding:14 },
  resultText: { color:'#00ff88', fontFamily:'monospace', fontSize:11, padding:14 },
  empty: { color:'#555', fontStyle:'italic', padding:14 },
  tableRow: { flexDirection:'row' },
  tableRowAlt: { backgroundColor:'#151515' },
  tableHeader: { color:'#00ff88', fontFamily:'monospace', fontSize:11, fontWeight:'700', paddingHorizontal:10, paddingVertical:6, minWidth:80, borderBottomWidth:1, borderColor:'#222' },
  tableCell: { color:'#ccc', fontFamily:'monospace', fontSize:11, paddingHorizontal:10, paddingVertical:5, minWidth:80 },
  historyBox: { backgroundColor:'#111', borderRadius:12, borderWidth:1, borderColor:'#222', marginBottom:12, overflow:'hidden' },
  historyHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:12, borderBottomWidth:1, borderColor:'#222' },
  historyLabel: { color:'#fff', fontSize:13, fontWeight:'700' },
  clearAllText: { color:'#555', fontSize:12 },
  historyItem: { flexDirection:'row', alignItems:'center', padding:10, borderBottomWidth:1, borderColor:'#1a1a1a', gap:8 },
  historyIcon: { fontSize:14 },
  historyQuery: { color:'#ccc', fontFamily:'monospace', fontSize:11 },
  historyTime: { color:'#444', fontSize:10, marginTop:2 },
});
