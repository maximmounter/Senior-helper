import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatScreen } from './src/screens/ChatScreen';
import { ScamScreen } from './src/screens/ScamScreen';
import { colors } from './src/theme';

export default function App() {
  const [screen, setScreen] = useState<'chat' | 'scam'>('chat');
  const [fontsLoaded] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ground }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* Chat stays mounted so the conversation isn't lost when checking a scam. */}
      <View style={{ flex: 1, display: screen === 'chat' ? 'flex' : 'none' }}>
        <ChatScreen onOpenScamCheck={() => setScreen('scam')} />
      </View>
      {screen === 'scam' ? <ScamScreen onDone={() => setScreen('chat')} /> : null}
    </SafeAreaProvider>
  );
}
