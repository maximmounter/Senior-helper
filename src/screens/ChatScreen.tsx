import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable,
  ScrollView, ScrollViewInstance, StyleSheet, Text, TextInput, TextInputInstance, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Answer, askQuestion, ChatTurn } from '../api';
import { AnswerCard } from '../components/AnswerCard';
import { config } from '../config';
import { colors, fonts, size } from '../theme';

type Message =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; text?: string; answer?: Answer };

const greeting = () => {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}, ${config.seniorName}. What can I help you with?`;
};

// Turn our chat into plain text the AI can read back as context.
const toHistory = (messages: Message[]): ChatTurn[] =>
  messages
    .filter((m) => m.role === 'user' || m.answer)
    .slice(-10)
    .map((m) =>
      m.role === 'user'
        ? { role: 'user', content: m.text }
        : {
            role: 'assistant',
            content: [m.answer!.intro, ...m.answer!.steps.map((s, i) => `Step ${i + 1}: ${s.title}. ${s.detail}`)].join('\n'),
          },
    );

export function ChatScreen({ onOpenScamCheck }: { onOpenScamCheck: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{ id: 'hello', role: 'assistant', text: greeting() }]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDictationTip, setShowDictationTip] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const inputRef = useRef<TextInputInstance>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    const next: Message[] = [...messages, { id: `${Date.now()}`, role: 'user', text: question }];
    setMessages(next);
    setDraft('');
    setLoading(true);
    try {
      const answer = await askQuestion(toHistory(next));
      setMessages((m) => [...m, { id: `${Date.now()}a`, role: 'assistant', answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: `${Date.now()}e`, role: 'assistant', text: "Sorry, I couldn't connect just now. Please check that Wi-Fi is on and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const callFamily = () => Linking.openURL(`tel:${config.familyPhone}`);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.brand}>Helper</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Call ${config.familyName}`} onPress={callFamily} style={styles.roundButton}>
            <Ionicons name="call" size={22} color={colors.ok} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Scam check" onPress={onOpenScamCheck} style={styles.scamPill}>
            <Ionicons name="shield-outline" size={22} color={colors.warn} />
            <Text style={styles.scamText}>Scam check</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m) =>
            m.role === 'user' ? (
              <Text key={m.id} style={[styles.bubble, styles.userBubble]}>{m.text}</Text>
            ) : m.answer ? (
              <AnswerCard
                key={m.id}
                answer={m.answer}
                onStuck={(n) => send(`I'm stuck on step ${n}. Can you explain it another way?`)}
              />
            ) : (
              <Text key={m.id} style={[styles.bubble, styles.helperBubble]}>{m.text}</Text>
            ),
          )}
          {loading ? (
            <View style={[styles.bubble, styles.helperBubble, styles.thinking]}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.thinkingText}>Thinking…</Text>
            </View>
          ) : null}
          {showDictationTip ? (
            <Text style={[styles.bubble, styles.helperBubble]}>
              To talk instead of type, tap the small microphone on the keyboard, then say your question.
            </Text>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <View style={styles.inputWrap}>
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="Type your question…"
              placeholderTextColor="#6B675F"
              accessibilityLabel="Your question"
              style={styles.input}
              multiline
              returnKeyType="send"
              submitBehavior="submit"
              onSubmitEditing={() => send(draft)}
            />
          </View>
          {draft.trim() ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Send question" onPress={() => send(draft)} style={styles.sendButton}>
              <Ionicons name="arrow-up" size={30} color={colors.white} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Speak your question"
              onPress={() => {
                inputRef.current?.focus();
                setShowDictationTip(true);
              }}
              style={styles.sendButton}
            >
              <Ionicons name="mic" size={28} color={colors.white} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  brand: { flex: 1, fontFamily: fonts.bold, fontSize: 24, color: colors.accent },
  roundButton: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: colors.line,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  scamPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: 14,
    borderRadius: 24, borderWidth: 2, borderColor: colors.warn, backgroundColor: colors.white,
  },
  scamText: { fontFamily: fonts.bold, fontSize: 18, color: colors.warn },
  thread: { padding: 20, gap: 14 },
  bubble: {
    maxWidth: '88%', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 20,
    fontFamily: fonts.regular, fontSize: size.body, lineHeight: 29, overflow: 'hidden',
  },
  helperBubble: { alignSelf: 'flex-start', backgroundColor: colors.soft, color: colors.ink, borderBottomLeftRadius: 6 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.accent, color: colors.white, borderBottomRightRadius: 6 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thinkingText: { fontFamily: fonts.regular, fontSize: size.body, color: colors.muted },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  inputWrap: {
    flex: 1, minHeight: 64, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 32,
    borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.white,
  },
  input: { fontFamily: fonts.regular, fontSize: 20, color: colors.ink, maxHeight: 140, paddingVertical: 14 },
  sendButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
