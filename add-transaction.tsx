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

export default function AddTransactionScreen() {
  const { customerId, type: initialType } = useLocalSearchParams<{ customerId: string; type?: string }>();
  const insets = useSafeAreaInsets();
  const { customers, addTransaction } = useCreditBook();

  const customer = customers.find(c => c.id === customerId);
  const [type, setType] = useState<'credit' | 'payment'>((initialType as 'credit' | 'payment') || 'credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');

  const descRef = useRef<TextInput>(null);
  const isCredit = type === 'credit';

  const handleSubmit = () => {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!amount.trim() || isNaN(parsed) || parsed <= 0) {
      setAmountError('ትክክለኛ መጠን ያስገቡ');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTransaction({
      customerId: customerId as string,
      amount: parsed,
      type,
      description: description.trim() || undefined,
      date: new Date().toISOString(),
    });
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
        {/* Header */}
        <View style={styles.titleRow}>
          <View style={[styles.titleIcon, { backgroundColor: isCredit ? '#fef3c7' : '#dcfce7' }]}>
            <Feather
              name={isCredit ? 'arrow-up-right' : 'arrow-down-left'}
              size={20}
              color={isCredit ? '#d97706' : '#16a34a'}
            />
          </View>
          <View>
            <Text style={styles.title}>{isCredit ? 'ክሬዲት ጨምር' : 'ክፍያ ቀበል'}</Text>
            <Text style={styles.subtitle}>{customer?.name ?? 'ደንበኛ'}</Text>
          </View>
        </View>

        {/* Type toggle */}
        <Text style={styles.label}>የግብይት አይነት</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeBtn, isCredit && styles.typeBtnCreditActive]}
            onPress={() => { setType('credit'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Feather name="arrow-up-right" size={18} color={isCredit ? '#d97706' : '#94a3b8'} />
            <Text style={[styles.typeBtnText, { color: isCredit ? '#d97706' : '#94a3b8' }]}>
              ክሬዲት (ዕዳ)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeBtn, !isCredit && styles.typeBtnPaymentActive]}
            onPress={() => { setType('payment'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Feather name="arrow-down-left" size={18} color={!isCredit ? '#16a34a' : '#94a3b8'} />
            <Text style={[styles.typeBtnText, { color: !isCredit ? '#16a34a' : '#94a3b8' }]}>
              ክፍያ (ብር ተቀበለ)
            </Text>
          </Pressable>
        </View>

        {/* Amount */}
        <Text style={styles.label}>
          መጠን (ብር) <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.amountRow, amountError ? styles.amountRowError : null]}>
          <Text style={styles.currencyBadge}>ብር</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={v => { setAmount(v); setAmountError(''); }}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => descRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>
        {amountError ? (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={13} color="#ef4444" />
            <Text style={styles.errorText}>{amountError}</Text>
          </View>
        ) : null}

        {/* Description */}
        <Text style={[styles.label, { marginTop: 16 }]}>መግለጫ (አማራጭ)</Text>
        <TextInput
          ref={descRef}
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder={isCredit ? 'ለምሳሌ: የምግብ ዕቃዎች' : 'ለምሳሌ: ጥሬ ገንዘብ ክፍያ'}
          placeholderTextColor="#94a3b8"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: isCredit ? '#d97706' : '#16a34a', opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleSubmit}
        >
          <Feather
            name={isCredit ? 'arrow-up-right' : 'check-circle'}
            size={18}
            color="#fff"
          />
          <Text style={styles.submitText}>
            {isCredit ? 'ክሬዲት ጨምር' : 'ክፍያ ቀበል'}
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
  scroll: { flex: 1 },
  content: { padding: 20 },

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  required: { color: '#ef4444' },

  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  typeBtnCreditActive: {
    borderColor: '#d97706',
    backgroundColor: '#fef3c7',
  },
  typeBtnPaymentActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  amountRowError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  currencyBadge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f766e',
    marginRight: 10,
    paddingVertical: 14,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
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
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
