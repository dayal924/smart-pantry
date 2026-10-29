import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthFieldFocus, PantryAuthHero } from '../../components/PantryAuthHero';
import { Btn, Card, Field, Muted, Screen } from '../../components/ui';
import { api } from '../../services/api';
import { useAuth } from '../../store/authStore';
import { C, R } from '../../theme';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focusedField, setFocusedField] = useState<AuthFieldFocus>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await api.register(name.trim(), email.trim(), password);
      await useAuth.getState().setSession(r.user, r.access_token, r.refresh_token);
    } catch (e: any) {
      setErr(e?.message ?? 'Could not create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand header with living AI Freshness Hero */}
          <View style={styles.brandContainer}>
            <PantryAuthHero
              focusedField={focusedField}
              isLoading={busy}
              hasError={Boolean(err)}
            />
            <Text style={styles.brandTitle}>Create Account</Text>
            <Muted style={styles.brandSubtitle}>
              Join Smart Pantry to track produce freshness and cut food waste
            </Muted>
          </View>

          {/* Form card */}
          <Card style={styles.formCard}>
            <Field
              label="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Alex Green"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField((cur) => (cur === 'name' ? null : cur))}
            />

            <Field
              label="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              placeholder="alex@example.com"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField((cur) => (cur === 'email' ? null : cur))}
            />

            <Field
              label="Password (min 8 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              placeholder="••••••••"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField((cur) => (cur === 'password' ? null : cur))}
            />

            {err && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={C.danger} />
                <Text style={styles.errorText}>{err}</Text>
              </View>
            )}

            <Btn
              title="Create Account"
              onPress={submit}
              loading={busy}
              disabled={!name || !email || password.length < 8}
              style={{ marginTop: 6 }}
            />
          </Card>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Muted>Already have an account?</Muted>
            <Link href="/(auth)/login" style={styles.footerLink}>
              Sign in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: 'center',
    gap: 16,
  },
  brandContainer: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    textAlign: 'center',
    maxWidth: 290,
  },
  formCard: {
    gap: 16,
    padding: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: R.sm,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerLink: {
    color: C.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
