import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkScam, ScamVerdict } from '../api';
import { BigButton } from '../components/BigButton';
import { config } from '../config';
import { colors, fonts, size } from '../theme';

const LOOK = {
  scam: { bg: colors.warn, icon: 'warning-outline' as const },
  suspicious: { bg: '#8A4B00', icon: 'alert-circle-outline' as const },
  safe: { bg: colors.ok, icon: 'checkmark-circle-outline' as const },
};

export function ScamScreen({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'choose' | 'type'>('choose');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (input: Parameters<typeof checkScam>[0]) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await checkScam(input));
    } catch {
      setError("Sorry, I couldn't check that just now. Please try again in a minute.");
    } finally {
      setLoading(false);
    }
  };

  const pickScreenshot = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.5 });
    if (picked.canceled || !picked.assets[0]?.base64) return;
    const asset = picked.assets[0];
    setImageUri(asset.uri);
    run({ imageBase64: asset.base64!, mediaType: asset.mimeType ?? 'image/jpeg' });
  };

  const tellFamily = () => {
    const body = encodeURIComponent(`Helper says a message I got looks like a scam: "${result?.headline}". Can you call me?`);
    const sep = Platform.OS === 'ios' ? '&' : '?';
    Linking.openURL(`sms:${config.familyPhone}${sep}body=${body}`);
  };

  if (result) {
    const look = LOOK[result.verdict] ?? LOOK.suspicious;
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: look.bg }]} edges={['top']}>
        <ScrollView style={{ backgroundColor: colors.ground }} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.banner, { backgroundColor: look.bg }]}>
            <Ionicons name={look.icon} size={48} color={colors.white} />
            <Text style={styles.bannerTitle} accessibilityRole="header">{result.headline}</Text>
          </View>
          <View style={styles.body}>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" accessibilityLabel="The screenshot you chose" /> : null}
            {result.reasons.length ? (
              <View style={{ gap: 10 }}>
                <Text style={styles.sectionTitle}>Why I think so</Text>
                {result.reasons.map((r, i) => (
                  <View key={i} style={styles.reason}>
                    <Text style={[styles.reasonNum, { color: look.bg }]}>{i + 1}.</Text>
                    <Text style={styles.reasonText}>{r}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.todo}>
              <Ionicons name="checkmark" size={28} color={colors.ok} />
              <Text style={styles.reasonText}>
                <Text style={{ fontFamily: fonts.bold }}>What to do: </Text>
                {result.whatToDo}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <BigButton label="Read to me" icon="volume-high" variant="outline" onPress={() => Speech.speak(`${result.headline}. ${result.reasons.join('. ')}. ${result.whatToDo}`, { rate: 0.85 })} />
            {result.verdict !== 'safe' ? <BigButton label={`Let ${config.familyName} know`} onPress={tellFamily} /> : null}
            <BigButton label="I'm done" variant="plain" onPress={() => { Speech.stop(); onDone(); }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" onPress={onDone} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">Is this a scam?</Text>
        <Text style={styles.lead}>Show me the message, email or letter you're not sure about. I'll tell you if it's safe.</Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.lead}>Checking it carefully…</Text>
          </View>
        ) : mode === 'choose' ? (
          <View style={{ gap: 14 }}>
            <BigButton label="Pick a screenshot" icon="images-outline" onPress={pickScreenshot} style={{ minHeight: 76 }} />
            <BigButton label="Type or paste it" icon="create-outline" variant="plain" onPress={() => setMode('type')} style={{ minHeight: 76 }} />
            <Text style={styles.hint}>
              To take a screenshot: press the side button and the volume-up button at the same time.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Paste or type the message here"
              placeholderTextColor="#6B675F"
              accessibilityLabel="The message to check"
              multiline
              style={styles.textBox}
            />
            <BigButton label="Check it" onPress={() => text.trim() && run({ text })} disabled={!text.trim()} />
            <BigButton label="Use a screenshot instead" variant="plain" onPress={() => setMode('choose')} />
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { flexGrow: 1, padding: 24, gap: 18 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  backText: { fontFamily: fonts.bold, fontSize: 20, color: colors.accent },
  title: { fontFamily: fonts.bold, fontSize: size.title, color: colors.ink },
  lead: { fontFamily: fonts.regular, fontSize: size.body, lineHeight: 29, color: colors.muted },
  hint: { fontFamily: fonts.regular, fontSize: size.small, lineHeight: 24, color: colors.muted },
  loading: { alignItems: 'center', gap: 14, paddingVertical: 40 },
  textBox: {
    minHeight: 180, padding: 16, borderRadius: 18, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.white,
    fontFamily: fonts.regular, fontSize: 20, color: colors.ink, textAlignVertical: 'top',
  },
  error: { fontFamily: fonts.bold, fontSize: size.body, color: colors.warn },
  banner: { gap: 12, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 26 },
  bannerTitle: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, color: colors.white },
  thumb: { height: 140, borderRadius: 16, backgroundColor: colors.soft },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink },
  reason: { flexDirection: 'row', gap: 12 },
  reasonNum: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28 },
  reasonText: { flex: 1, fontFamily: fonts.regular, fontSize: 20, lineHeight: 28, color: colors.ink },
  todo: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 16, borderRadius: 16, backgroundColor: colors.okSoft },
});
