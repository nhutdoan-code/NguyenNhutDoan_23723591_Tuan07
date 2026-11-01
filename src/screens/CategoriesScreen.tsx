import React, {
  useEffect,
  useState,
} from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header } from "../components/Header";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";

import { getCategories } from "../services/categoryService";
import { getErrorMessage } from "../api/client";

import { Category } from "../types";
import { TabScreenProps } from "../navigation/types";
import { colors, radius } from "../theme";

export function CategoriesScreen({
  navigation,
}: TabScreenProps<"Categories">) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCategories();

      setCategories(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <ErrorView
        message={error}
        onRetry={load}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header title="🗂️ Danh mục" />

      <FlatList
        data={categories}
        keyExtractor={(item) =>
          String(item.id)
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() =>
              navigation.navigate("Home", {
                categoryId: item.id,
              })
            }
          >
            <Text style={styles.emoji}>
              {item.emoji}
            </Text>

            <Text style={styles.name}>
              {item.name}
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  list: {
    padding: 16,
    gap: 10,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: radius.md,
  },

  emoji: {
    fontSize: 28,
    marginRight: 12,
  },

  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  arrow: {
    fontSize: 26,
    color: colors.muted,
  },
});