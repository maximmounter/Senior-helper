import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { StepIcon } from '../api';
import { colors, fonts, size } from '../theme';

// Each step can show a simple picture of what to look for on the phone.
const ICONS: Record<Exclude<StepIcon, 'none'>, { name: keyof typeof Ionicons.glyphMap; bg: string; label: string }> = {
  settings: { name: 'settings-outline', bg: '#8E8E93', label: 'The Settings app' },
  phone: { name: 'call', bg: '#34A853', label: 'The Phone app' },
  message: { name: 'chatbubble', bg: '#34A853', label: 'The Messages app' },
  camera: { name: 'camera', bg: '#5F6368', label: 'The Camera app' },
  photos: { name: 'images', bg: '#E8710A', label: 'The Photos app' },
  wifi: { name: 'wifi', bg: '#1A73E8', label: 'The Wi-Fi symbol' },
  volume: { name: 'volume-high', bg: '#5F6368', label: 'The volume buttons' },
  'text-size': { name: 'text', bg: '#5F6368', label: 'Text size' },
  battery: { name: 'battery-half', bg: '#34A853', label: 'The battery' },
  email: { name: 'mail', bg: '#1A73E8', label: 'The Mail app' },
  browser: { name: 'compass', bg: '#1A73E8', label: 'The internet app' },
  'home-button': { name: 'ellipse-outline', bg: '#5F6368', label: 'The Home button' },
  lock: { name: 'lock-closed', bg: '#5F6368', label: 'The lock' },
  bluetooth: { name: 'bluetooth', bg: '#1A73E8', label: 'Bluetooth' },
  'app-store': { name: 'bag-handle', bg: '#1A73E8', label: 'The App Store' },
};

export function StepPicture({ icon }: { icon: StepIcon }) {
  if (icon === 'none' || !ICONS[icon]) return null;
  const { name, bg, label } = ICONS[icon];
  return (
    <View style={styles.box} accessible accessibilityLabel={label}>
      <View style={[styles.tile, { backgroundColor: bg }]}>
        <Ionicons name={name} size={38} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>It looks like this</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, backgroundColor: colors.softer },
  tile: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.bold, fontSize: size.body - 2, color: colors.ink },
});
