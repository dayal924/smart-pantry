import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { allCatalog, getCatalogItem, normalizeKey } from '../domain/catalog';
import { onDeviceDetector } from '../ml/detector';
import { C, R } from '../theme';
import { Screen } from './ui';

/** Searchable list of every produce class (model classes first). */
export function ClassPicker({
  visible,
  onClose,
  onPick,
  title = 'Choose item',
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (key: string) => void;
  title?: string;
}) {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const keys = new Set<string>(onDeviceDetector.names.map(normalizeKey));
    allCatalog().forEach((c) => keys.add(c.key));
    return [...keys]
      .map(getCatalogItem)
      .filter((c) => c.display.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [q, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Screen edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={C.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search fruits & vegetables…"
              placeholderTextColor="#9AA597"
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={styles.searchInput}
            />
            {q.length > 0 && (
              <Pressable onPress={() => setQ('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={C.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={rows}
          keyExtractor={(i) => i.key}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No produce matching "{q}"</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onPick(item.key);
                setQ('');
              }}
              style={({ pressed }) => [
                styles.itemRow,
                pressed && { backgroundColor: C.borderLight },
              ]}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.display}</Text>
                <Text style={styles.itemSub}>
                  Room {item.shelf_life_days.room}d · Fridge {item.shelf_life_days.fridge}d
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
          )}
        />
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    backgroundColor: C.bg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: C.primarySoft,
  },
  closeText: {
    color: C.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemName: {
    fontSize: 16,
    color: C.text,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    fontWeight: '600',
  },
});
