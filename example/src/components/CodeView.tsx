import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Highlight, themes } from 'prism-react-renderer';

const theme = themes.vsDark;

export function CodeView({ code }: { code: string }) {
  return (
    <Highlight theme={theme} code={code.trimEnd()} language="tsx">
      {({ tokens, getTokenProps }) => (
        <ScrollView
          horizontal
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.code} selectable>
            {tokens.map((line, i) => (
              <Text key={i}>
                {line.map((token, j) => {
                  if (token.empty) return null;
                  const { style, children } = getTokenProps({ token });
                  const tokenStyle = {
                    color: style?.color,
                    fontStyle:
                      style?.fontStyle === 'italic'
                        ? ('italic' as const)
                        : ('normal' as const),
                  };
                  return (
                    <Text key={j} style={tokenStyle}>
                      {children}
                    </Text>
                  );
                })}
                {i < tokens.length - 1 ? '\n' : null}
              </Text>
            ))}
          </Text>
        </ScrollView>
      )}
    </Highlight>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.plain.backgroundColor,
    borderRadius: 8,
  },
  content: {
    padding: 12,
  },
  code: {
    color: theme.plain.color,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 12,
    lineHeight: 18,
  },
});
