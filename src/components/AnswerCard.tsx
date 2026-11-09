import * as Speech from 'expo-speech';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Answer } from '../api';
import { colors, fonts, size } from '../theme';
import { BigButton } from './BigButton';
import { StepPicture } from './StepPicture';

// One step at a time, so nobody gets lost in a wall of text.
export function AnswerCard({ answer, onStuck }: { answer: Answer; onStuck: (stepNumber: number) => void }) {
  const [index, setIndex] = useState(0);
  const steps = answer.steps;
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const readAloud = () => {
    Speech.stop();
    const text = index === 0 && answer.intro ? `${answer.intro}. ${step.title}. ${step.detail}` : `${step.title}. ${step.detail}`;
    Speech.speak(text, { rate: 0.85 });
  };

  if (!step) {
    return (
      <View style={styles.card}>
        <Text style={styles.detail}>{answer.intro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {index === 0 && answer.intro ? <Text style={styles.intro}>{answer.intro}</Text> : null}
      {steps.length > 1 ? (
        <Text style={styles.counter}>
          Step {index + 1} of {steps.length}
        </Text>
      ) : null}
      <Text style={styles.title} accessibilityRole="header">
        {step.title}
      </Text>
      <Text style={styles.detail}>{step.detail}</Text>
      <StepPicture icon={step.icon} />
      <View style={styles.row}>
        <BigButton label="Read to me" icon="volume-high" variant="outline" onPress={readAloud} style={styles.half} />
        {isLast ? (
          <BigButton label="I'm stuck" variant="plain" onPress={() => onStuck(index + 1)} style={styles.half} />
        ) : (
          <BigButton
            label="Next step"
            onPress={() => {
              Speech.stop();
              setIndex(index + 1);
            }}
            style={styles.half}
          />
        )}
      </View>
      {index > 0 ? (
        <View style={styles.row}>
          <BigButton label="Go back" icon="arrow-back" variant="plain" onPress={() => setIndex(index - 1)} style={styles.half} />
          {!isLast ? <BigButton label="I'm stuck" variant="plain" onPress={() => onStuck(index + 1)} style={styles.half} /> : <View style={styles.half} />}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: 12,
    padding: 18,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.line,
  },
  intro: { fontFamily: fonts.regular, fontSize: size.body, lineHeight: 29, color: colors.ink },
  counter: { fontFamily: fonts.bold, fontSize: size.small, color: colors.muted },
  title: { fontFamily: fonts.bold, fontSize: size.large, lineHeight: 31, color: colors.ink },
  detail: { fontFamily: fonts.regular, fontSize: size.body - 1, lineHeight: 29, color: colors.ink },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
