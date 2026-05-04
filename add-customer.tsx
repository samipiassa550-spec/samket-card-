import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreditBook } from '@/context/CreditBookContext';

export default function AddCustomerScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const insets = useSafeAreaInsets();
  const { customers, addCustomer, updateCustomer, addTransaction } = useCreditBook();

  const existing = customerId ? customers.find(c => c.id === customerId) : null;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [openingDebt, setOpeningDebt] = useState('');
  const [nameError, setNameError] = useState('');

  const phoneRef = useRef<TextInput>(null);
  const debtRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('ስም ያስፈልጋል');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isEditing && customerId) {
      updateCustomer(customerId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      const newId = addCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      const parsed = parseFloat(openingDebt.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        addTransaction({
          customerId: newId,
          amount: parsed,
          type: 'credit',
          description: 'መነሻ ዕዳ',
          date: new Date().toISOString(),
        });
      }
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 60 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}>
            <Feather name={isEditing ? 'edit-2' : 'user-plus'} size={20} color="#0f766e" />
          </View>
          <Text style={styles.title}>
            {isEditing ? 'ደንበኛ አርትዕ' : 'አዲስ ደንበኛ ጨምር'}
          </Text>
        </View>

        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            ሙሉ ስም <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={v => { setName(v); setNameError(''); }}
            placeholder="ለምሳሌ: አበበ ከበደ"
            placeholderTextColor="#94a3b8"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            blurOnSubmit={false}
          />
          {nameError ? (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={13} color="#ef4444" />
              <Text style={styles.errorText}>{nameError}</Text>
            </View>
          ) : null}
        </View>

        {/* Phone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ስልክ ቁጥር</Text>
          <TextInput
            ref={phoneRef}
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="09XXXXXXXX"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => debtRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        {/* Opening debt — only when adding new */}
        {!isEditing && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>መነሻ ዕዳ (ብር)</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencyBadge}>ብር</Text>
              <TextInput
                ref={debtRef}
                style={styles.amountInput}
                value={openingDebt}
                onChangeText={setOpeningDebt}
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                returnKeyType="next"
                onSubmitEditing={() => notesRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
            <Text style={styles.hint}>ደንበኛው ቀድሞ ዕዳ ካለበት ይሙሉ — ባዶ ከተወ ዕዳ ዜሮ ይሆናል</Text>
          </View>
        )}

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ማስታወሻ (አማራጭ)</Text>
          <TextInput
            ref={notesRef}
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="ማንኛውም ማስታወሻ..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="done"
          />
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitButton, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleSubmit}
        >
          <Feather name={isEditing ? 'check' : 'user-plus'} size={18} color="#fff" />
          <Text style={styles.submitText}>
            {isEditing ? 'ለውጦችን አስቀምጥ' : 'ደንበኛ ጨምር'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>ሰርዝ</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    paddingTop: 8,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },

  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },

  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  currencyBadge: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f766e',
    marginRight: 10,
    paddingVertical: 14,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    lineHeight: 17,
  },

  textArea: {
    height: 96,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  submitButton: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },

  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
