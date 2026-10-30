import React from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { C } from '../theme';

interface MarkdownMessageProps {
  content: string;
  isUser: boolean;
}

interface InlineToken {
  type: 'text' | 'bold' | 'italic';
  text: string;
}

// Tokenizes inline text to parse **bold** and *italic* while stripping raw asterisks
function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Match **bold** or *italic* or _italic_
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        text: cleanRawAsterisks(text.slice(lastIndex, match.index)),
      });
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push({ type: 'bold', text: token.slice(2, -2).trim() });
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      tokens.push({ type: 'italic', text: token.slice(1, -1).trim() });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      text: cleanRawAsterisks(text.slice(lastIndex)),
    });
  }

  return tokens;
}

// Clean stray asterisks that LLMs occasionally output
function cleanRawAsterisks(str: string): string {
  return str.replace(/\*{1,3}/g, '').replace(/_{2,3}/g, '');
}

export function MarkdownMessage({ content, isUser }: MarkdownMessageProps) {
  if (isUser) {
    return <Text style={styles.userText}>{content}</Text>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      // Empty line -> small vertical spacer if previous was content
      if (elements.length > 0 && i < lines.length - 1) {
        elements.push(<View key={`sp-${i}`} style={styles.spacer} />);
      }
      continue;
    }

    // Horizontal Rule: --- or ***
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(<View key={`hr-${i}`} style={styles.divider} />);
      continue;
    }

    // Top Level Heading: # Title or ## Title
    if (/^#{1,2}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{1,2}\s+/, '').replace(/\*\*/g, '');
      elements.push(
        <Text key={`h1-${i}`} style={styles.h1}>
          {headingText}
        </Text>
      );
      continue;
    }

    // Subheading: ### Title or #### Title
    if (/^#{3,4}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{3,4}\s+/, '').replace(/\*\*/g, '');
      elements.push(
        <Text key={`h2-${i}`} style={styles.h2}>
          {headingText}
        </Text>
      );
      continue;
    }

    // Numbered Step: 1. Step text or 1) Step text
    const stepMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
    if (stepMatch) {
      const num = stepMatch[1];
      const stepBody = stepMatch[2];
      const inlineTokens = parseInline(stepBody);

      elements.push(
        <View key={`step-${i}`} style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{num}</Text>
          </View>
          <Text style={styles.stepText}>
            {inlineTokens.map((t, ti) => renderToken(t, ti, styles.stepText))}
          </Text>
        </View>
      );
      continue;
    }

    // Bullet Item: - Item or * Item or • Item
    if (/^[-*•]\s+/.test(trimmed)) {
      const bulletBody = trimmed.replace(/^[-*•]\s+/, '');
      const inlineTokens = parseInline(bulletBody);

      elements.push(
        <View key={`bullet-${i}`} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            {inlineTokens.map((t, ti) => renderToken(t, ti, styles.bulletText))}
          </Text>
        </View>
      );
      continue;
    }

    // Regular Paragraph Line with inline formatting
    const inlineTokens = parseInline(trimmed);
    elements.push(
      <Text key={`p-${i}`} style={styles.paragraph}>
        {inlineTokens.map((t, ti) => renderToken(t, ti, styles.paragraph))}
      </Text>
    );
  }

  return <View style={styles.container}>{elements}</View>;
}

function renderToken(t: InlineToken, index: number, baseStyle: TextStyle) {
  if (t.type === 'bold') {
    return (
      <Text key={index} style={[baseStyle, styles.bold]}>
        {t.text}
      </Text>
    );
  }
  if (t.type === 'italic') {
    return (
      <Text key={index} style={[baseStyle, styles.italic]}>
        {t.text}
      </Text>
    );
  }
  return <Text key={index}>{t.text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
  },
  paragraph: {
    color: '#1C2A1E',
    fontSize: 14.5,
    lineHeight: 21,
  },
  h1: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 22,
  },
  h2: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#1C2A1E',
  },
  italic: {
    fontStyle: 'italic',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
    marginVertical: 1.5,
    gap: 8,
  },
  bulletDot: {
    fontSize: 15,
    color: C.primaryDark,
    lineHeight: 20,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1C2A1E',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2.5,
    gap: 8,
  },
  stepBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1C2A1E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E8E1',
    marginVertical: 6,
  },
  spacer: {
    height: 4,
  },
});

