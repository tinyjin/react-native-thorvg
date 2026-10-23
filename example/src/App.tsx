import './examples/assets';
import { useEffect, useState } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThorVG } from '@thorvg/react-native-thorvg';
import { examples, type Example } from './examples';
import { ExampleDetail } from './screens/ExampleDetail';
import { ExampleList } from './screens/ExampleList';
import { reportError } from './errorSink';
import { colors } from './theme';

function exampleFromUrl(url: string | null | undefined): Example | null {
  const id = url?.match(/example[/=]([a-z0-9-]+)/)?.[1];
  return examples.find((example) => example.id === id) ?? null;
}

function Root() {
  const TVG = useThorVG({ onError: reportError });
  const [selected, setSelected] = useState<Example | null>(null);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      const example = exampleFromUrl(url);
      if (example) setSelected(example);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const example = exampleFromUrl(url);
      if (example) setSelected(example);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!selected || Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setSelected(null);
        return true;
      }
    );
    return () => subscription.remove();
  }, [selected]);

  if (!TVG) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading ThorVG…</Text>
      </View>
    );
  }

  if (selected) {
    return (
      <ExampleDetail example={selected} onBack={() => setSelected(null)} />
    );
  }

  return <ExampleList version={TVG.version} onSelect={setSelected} />;
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.root}>
      <Root />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
  },
});
