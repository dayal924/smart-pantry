import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Btn, Card, Chip, Muted, Screen, ScreenHeader } from '../../components/ui';
import { MarkdownMessage } from '../../components/MarkdownMessage';
import { parseRecipeFromText } from '../../domain/recipeMatch';
import { daysLeft } from '../../domain/shelfLife';
import { api } from '../../services/api';
import { localCopilot } from '../../services/localCopilot';
import { isOnline } from '../../services/network';
import { activeItems, usePantry } from '../../store/pantryStore';
import { C, R, S } from '../../theme';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK = [
  'What should I cook tonight?',
  'What should I use first?',
  'How do I store tomatoes?',
  'Healthy dinner ideas?',
];

export default function Copilot() {
  const router = useRouter();
  const { items, recipes, customRecipes = [], addCustomRecipe } = usePantry();
  const activePantry = activeItems(items);
  const [selectedPantry, setSelectedPantry] = useState<string[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        "Hi! I know exactly what's in your pantry. Ask me what to cook, tap your pantry items above to create custom recipes with step-by-step instructions, or ask how to store your food best.",
    },
  ]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef<FlatList>(null);

  const send = async (q: string) => {
    if (!q.trim() || busy) return;
    const history = msgs.slice(-8);
    setMsgs((m) => [...m, { role: 'user', content: q }]);
    setText('');
    setBusy(true);

    const act = activeItems(items);
    const now = Date.now();
    let reply: string;

    try {
      if (!(await isOnline())) throw new Error('offline');
      const r = await api.copilot({
        message: q,
        history: history.slice(1),
        inventory: act.map((i) => ({
          class_key: i.classKey,
          name: i.name,
          quantity: i.quantity,
          storage: i.storage,
          days_left: daysLeft(i.expiresAt, now),
        })),
      });
      reply = r.reply;
    } catch {
      reply = '📴 ' + localCopilot(q, act, recipes);
    }

    setMsgs((m) => [...m, { role: 'assistant', content: reply }]);
    setBusy(false);
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 100);
  };

  const togglePantrySelection = (name: string) => {
    setSelectedPantry((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Copilot"
        subtitle="AI pantry assistant · Grounded in your inventory with offline mode"
      />

      {/* Interactive Pantry Ingredient Selector */}
      {activePantry.length > 0 && (
        <View style={styles.pantrySelectorContainer}>
          <View style={styles.pantrySelectorHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="basket-outline" size={15} color={C.primaryDark} />
              <Text style={styles.pantrySelectorTitle}>Select pantry items to cook:</Text>
            </View>
            {selectedPantry.length > 0 && (
              <Pressable onPress={() => setSelectedPantry([])} hitSlop={6}>
                <Text style={styles.clearText}>Clear ({selectedPantry.length})</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pantryScroll}
          >
            {activePantry.map((p) => {
              const isSel = selectedPantry.includes(p.name);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => togglePantrySelection(p.name)}
                  style={[styles.pantryChip, isSel && styles.pantryChipSelected]}
                >
                  <Text style={{ fontSize: 13 }}>{p.emoji}</Text>
                  <Text style={[styles.pantryChipText, isSel && styles.pantryChipTextSelected]}>
                    {p.name}
                  </Text>
                  {isSel && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedPantry.length > 0 && (
            <Pressable
              style={styles.generateBtn}
              onPress={() => {
                const names = selectedPantry.join(', ');
                setSelectedPantry([]);
                send(
                  `Create a recipe using: ${names}. Include ingredients and step-by-step instructions.`
                );
              }}
            >
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              <Text style={styles.generateBtnText}>
                Ask Copilot to make recipe with {selectedPantry.length} item{selectedPantry.length === 1 ? '' : 's'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={list}
          data={msgs}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            const parsedRecipe = !isUser ? parseRecipeFromText(item.content) : null;
            const isSaved =
              parsedRecipe != null &&
              customRecipes.some(
                (r) =>
                  r.title.toLowerCase() === parsedRecipe.title.toLowerCase() ||
                  r.id === parsedRecipe.id
              );

            return (
              <View
                style={[
                  styles.msgWrapper,
                  isUser ? styles.userMsgWrapper : styles.assistantMsgWrapper,
                ]}
              >
                {!isUser && (
                  <View style={styles.assistantAvatar}>
                    <Text style={{ fontSize: 13 }}>🥑</Text>
                  </View>
                )}
                <View style={{ maxWidth: '86%', gap: 6 }}>
                  <View
                    style={[
                      styles.msgBubble,
                      isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <MarkdownMessage content={item.content} isUser={isUser} />
                  </View>

                  {/* Recipe Card Inline with Add to My Recipes */}
                  {parsedRecipe && (
                    <Card style={styles.recipeCardInline}>
                      <View style={styles.recipeCardHeader}>
                        <Text style={{ fontSize: 20 }}>🍲</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.recipeCardTitle}>{parsedRecipe.title}</Text>
                          <Text style={styles.recipeCardMeta}>
                            ⏱️ {parsedRecipe.time_min}m · 👥 Serves {parsedRecipe.servings} · 📋 {parsedRecipe.steps.length} steps
                          </Text>
                        </View>
                      </View>

                      <View style={styles.recipeCardActions}>
                        {!isSaved ? (
                          <Btn
                            kind="soft"
                            title="✨ Add to My Recipes"
                            onPress={() => {
                              addCustomRecipe(parsedRecipe);
                              Alert.alert(
                                'Recipe Saved!',
                                `"${parsedRecipe.title}" is now saved in your Recipes tab with full instructions.`,
                                [
                                  { text: 'Keep Chatting' },
                                  {
                                    text: 'View in Recipes',
                                    onPress: () => router.push('/(tabs)/recipes'),
                                  },
                                ]
                              );
                            }}
                            style={{ minHeight: 34, paddingVertical: 6 }}
                          />
                        ) : (
                          <View style={styles.savedRow}>
                            <View style={styles.savedPill}>
                              <Ionicons name="checkmark-circle" size={13} color="#1B5E20" />
                              <Text style={styles.savedPillText}>Saved in Recipes</Text>
                            </View>
                            <Btn
                              kind="ghost"
                              title="View"
                              onPress={() => router.push('/(tabs)/recipes')}
                              style={{ minHeight: 30, paddingVertical: 4, paddingHorizontal: 10 }}
                            />
                          </View>
                        )}
                      </View>
                    </Card>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            busy ? (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color={C.primary} />
                <Muted>Copilot is thinking…</Muted>
              </View>
            ) : null
          }
        />

        {/* Quick prompt suggestions carousel */}
        <View style={styles.quickWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScroll}
          >
            {QUICK.map((q) => (
              <Chip key={q} label={q} onPress={() => send(q)} />
            ))}
          </ScrollView>
        </View>

        {/* Bottom chat input */}
        <View style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ask anything or what to cook…"
            placeholderTextColor="#9AA597"
            onSubmitEditing={() => send(text)}
            returnKeyType="send"
            style={styles.textInput}
          />
          <Pressable
            onPress={() => send(text)}
            disabled={!text.trim() || busy}
            style={({ pressed }) => [
              styles.sendBtn,
              (!text.trim() || busy) && { opacity: 0.4 },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chatList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  msgWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  userMsgWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMsgWrapper: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  msgBubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: C.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    borderBottomLeftRadius: 4,
    ...S.card,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: C.text,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 36,
  },
  quickWrap: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    backgroundColor: C.bg,
  },
  quickScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  inputBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F7F3',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pantrySelectorContainer: {
    backgroundColor: '#F8FAF6',
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    paddingVertical: 8,
    gap: 6,
  },
  pantrySelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pantrySelectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primaryDark,
  },
  clearText: {
    fontSize: 11,
    color: C.danger,
    fontWeight: '700',
  },
  pantryScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  pantryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: R.full,
  },
  pantryChipSelected: {
    backgroundColor: C.primary,
    borderColor: C.primaryDark,
  },
  pantryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
  },
  pantryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  generateBtn: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.primary,
    paddingVertical: 7,
    borderRadius: R.sm,
    marginTop: 2,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  recipeCardInline: {
    backgroundColor: '#FAFCF8',
    borderColor: '#C8E6C9',
    borderWidth: 1.5,
    padding: 12,
    gap: 8,
    borderRadius: R.md,
  },
  recipeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  recipeCardMeta: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  recipeCardActions: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.sm,
  },
  savedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B5E20',
  },
});
