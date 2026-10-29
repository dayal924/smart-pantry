import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveCrash } from '../services/crashLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    saveCrash(
      {
        message: error.message,
        stack: (error.stack || '') + '\nComponentStack:\n' + (errorInfo.componentStack || ''),
      },
      true
    );
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Unknown error occurred';
      const stack = this.state.error?.stack || this.state.errorInfo?.componentStack || 'No stack trace available';

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⚠️ Smart Pantry Crash Diagnostic</Text>
            <Text style={styles.subtitle}>
              An error was intercepted by the in-app Crash Analyzer.
            </Text>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.label}>Error Details:</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>

            <Text style={styles.label}>Stack Trace:</Text>
            <Text style={styles.stackText}>{stack}</Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <Text style={styles.buttonText}>Restart App</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1713',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF66',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#050A07',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.2)',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ADE80',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 14,
    color: '#F87171',
    fontWeight: '600',
    marginBottom: 8,
  },
  stackText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    backgroundColor: '#15803D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

