import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { queryAPI } from '../api/muwandb';
import { getSession } from '../storage/auth';

const SHORTCUTS = ['SHOW TABLES','CREATE TABLE users (id, name, email)','INSERT INTO users VALUES (name="Saad", email="s@s.com")','SELECT * FROM users','UPDATE users SET name="Ali" WHERE id="1"','DELETE FROM users WHERE id="1"'];

export default function ConsoleScreen() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => { getSession().then(s => setApiKey(s.anonKey || '')); }, []);

  const runQuery = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await queryAPI.raw(query.trim(), apiKey);
      setResult(res.data);
      setHistory(prev => [query.trim(), ...prev.slice(0, 19)]);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
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
            <View style={styles.tableRow}>{cols.map(c => <Text key={c} style={styles.tableHeader}>{c}</Text>)}</View>
            {result.map((row, i) => (
              <View key={i} style={[styles.tableRow, i%2===0 && styles.tableRowAlt]}>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcuts}>
        {SHORTCUTS.map((s, i) => (
          <TouchableOpacity key={i} style={styles.shortcut} onPress={() => setQuery(s)}>
            <Text style={styles.shortcutText}>{s.split(' ').slice(0,2).join(' ')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.editorBox}>
        <TextInput style={styles.editor} value={query} onChangeText={setQuery} placeholder="Write MQL query..." placeholderTextColor="#333" multiline autoCapitalize="none" autoCorrect={false} />
        <TouchableOpacity style={styles.runBtn} onPress={runQuery} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.runText}>▶ Run</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.output}>
        {error && <View style={styles.errorBox}><Text style={styles.errorText}>❌ {error}</Text></View>}
        {result && <View style={styles.resultBox}><Text style={styles.resultLabel}>Result</Text>{renderResult()}</View>}
        {history.length > 0 && (
          <View style={styles.historyBox}>
            <Text style={styles.historyLabel}>History</Text>
            {history.map((h, i) => <TouchableOpacity key={i} onPress={() => setQuery(h)}><Text style={styles.historyItem}>{h}</Text></TouchableOpacity>)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0a0a0a' },
  shortcuts: { maxHeight:44, paddingHorizontal:12, paddingVertical:6 },
  shortcut: { backgroundColor:'#1a1a1a', borderRadius:6, paddingHorizontal:10, paddingVertical:6, marginRight:8, borderWidth:1, borderColor:'#2a2a2a' },
  shortcutText: { color:'#00ff88', fontSize:11, fontFamily:'monospace' },
  editorBox: { margin:12, backgroundColor:'#111', borderRadius:12, borderWidth:1, borderColor:'#222', overflow:'hidden' },
  editor: { color:'#00ff88', fontFamily:'monospace', fontSize:13, padding:14, minHeight:100, textAlignVertical:'top' },
  runBtn: { backgroundColor:'#00ff88', margin:8, borderRadius:8, padding:12, alignItems:'center' },
  runText: { color:'#000', fontWeight:'800', fontSize:14 },
  output: { flex:1, paddingHorizontal:12 },
  errorBox: { backgroundColor:'#1a0000', borderRadius:10, padding:14, borderWidth:1, borderColor:'#ff444433', marginBottom:12 },
  errorText: { color:'#ff4444', fontFamily:'monospace', fontSize:12 },
  resultBox: { backgroundColor:'#111', borderRadius:10, padding:14, borderWidth:1, borderColor:'#222', marginBottom:12 },
  resultLabel: { color:'#555', fontSize:11, marginBottom:8, textTransform:'uppercase', letterSpacing:1 },
  resultText: { color:'#00ff88', fontFamily:'monospace', fontSize:11 },
  empty: { color:'#555', fontStyle:'italic' },
  tableRow: { flexDirection:'row' },
  tableRowAlt: { backgroundColor:'#151515' },
  tableHeader: { color:'#00ff88', fontFamily:'monospace', fontSize:11, fontWeight:'700', paddingHorizontal:10, paddingVertical:6, minWidth:80, borderBottomWidth:1, borderColor:'#222' },
  tableCell: { color:'#ccc', fontFamily:'monospace', fontSize:11, paddingHorizontal:10, paddingVertical:5, minWidth:80 },
  historyBox: { backgroundColor:'#111', borderRadius:10, padding:14, borderWidth:1, borderColor:'#222', marginBottom:30 },
  historyLabel: { color:'#555', fontSize:11, textTransform:'uppercase', letterSpacing:1, marginBottom:8 },
  historyItem: { color:'#444', fontFamily:'monospace', fontSize:11, paddingVertical:4, borderBottomWidth:1, borderColor:'#1a1a1a' },
});
