import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, size } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'plain';
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
};

export function BigButton({ label, onPress, variant = 'filled', icon, color = colors.accent, style, disabled }: Props) {
  const filled = variant === 'filled';
  const textColor = filled ? colors.white : variant === 'outline' ? color : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        filled && { backgroundColor: color, borderColor: color },
        variant === 'outline' && { borderColor: color, backgroundColor: colors.white },
        variant === 'plain' && { borderColor: colors.line, backgroundColor: colors.white },
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={24} color={textColor} /> : null}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 60,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: { fontFamily: fonts.bold, fontSize: size.body },
});
