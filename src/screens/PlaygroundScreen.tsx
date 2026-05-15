import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePlayground } from "@/hooks/usePlayground";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type Trade = "carpenter" | "electrician" | "plumber" | "painter" | "other";

const TRADES: { label: string; value: Trade }[] = [
  { label: "Carpenter", value: "carpenter" },
  { label: "Electrician", value: "electrician" },
  { label: "Plumber", value: "plumber" },
  { label: "Painter", value: "painter" },
  { label: "Other", value: "other" },
];

export function PlaygroundScreen() {
  const { messages, isLoading, error, sendMessage, clearMessages } =
    usePlayground();
  const [inputText, setInputText] = useState("");
  const [trade, setTrade] = useState<Trade>("carpenter");
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText("");
    await sendMessage(text, trade);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flask" size={22} color={colors.primary} />
          <Text style={styles.headerTitle}>AI Playground</Text>
        </View>
        {messages.length > 0 ? (
          <TouchableOpacity
            onPress={clearMessages}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Trade selector */}
      <View style={styles.tradeRow}>
        <Text style={styles.tradeLabel}>Trade:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tradeChips}
        >
          {TRADES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.tradeChip,
                trade === t.value && styles.tradeChipActive,
              ]}
              onPress={() => setTrade(t.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tradeChipText,
                  trade === t.value && styles.tradeChipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyChat}>
              <View style={styles.emptyChatIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.outline} />
              </View>
              <Text style={styles.emptyChatTitle}>Start a conversation</Text>
              <Text style={styles.emptyChatDesc}>
                Ask anything about trade estimates, materials, labor costs, or
                project planning.
              </Text>
              <View style={styles.suggestions}>
                {[
                  "How much would a 400 sq ft deck cost?",
                  "What materials do I need for cabinet installation?",
                  "Estimate drywall for a 20x20 room",
                ].map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestion}
                    onPress={() => setInputText(s)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              {messages.map((msg, i) => (
                <View
                  key={i}
                  style={[
                    styles.messageBubble,
                    msg.role === "user"
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  {msg.role === "assistant" ? (
                    <View style={styles.assistantIcon}>
                      <Ionicons
                        name="sparkles"
                        size={14}
                        color={colors.primary}
                      />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.bubbleContent,
                      msg.role === "user"
                        ? styles.userBubbleContent
                        : styles.assistantBubbleContent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.role === "user"
                          ? styles.userMessageText
                          : styles.assistantMessageText,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}
              {isLoading ? (
                <View style={[styles.messageBubble, styles.assistantBubble]}>
                  <View style={styles.assistantIcon}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                  <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>Thinking…</Text>
                  </View>
                </View>
              ) : null}
            </>
          )}

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask about estimates, materials, labor…"
            placeholderTextColor={colors.outline}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={18} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearBtnText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  tradeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  tradeLabel: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  tradeChips: { flexDirection: "row", gap: spacing.sm, paddingRight: spacing.lg },
  tradeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tradeChipActive: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primary,
  },
  tradeChipText: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  tradeChipTextActive: { color: colors.primary },
  messageScroll: { flex: 1 },
  messageContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyChat: { alignItems: "center", paddingTop: spacing["3xl"] },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyChatTitle: { ...typography.headlineMd, color: colors.onSurface, textAlign: "center" },
  emptyChatDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.sm,
    maxWidth: 300,
  },
  suggestions: { width: "100%", gap: spacing.sm, marginTop: spacing.xl },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  suggestionText: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  messageBubble: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  userBubble: { justifyContent: "flex-end" },
  assistantBubble: { justifyContent: "flex-start" },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubbleContent: {
    maxWidth: "80%",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  userBubbleContent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubbleContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderBottomLeftRadius: 4,
  },
  messageText: { ...typography.bodyMd, lineHeight: 22 },
  userMessageText: { color: colors.onPrimary },
  assistantMessageText: { color: colors.onSurface },
  typingIndicator: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  typingText: { ...typography.bodyMd, color: colors.onSurfaceVariant, fontStyle: "italic" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.bodyMd, color: colors.error, flex: 1 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.background,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: { opacity: 0.5 },
});
