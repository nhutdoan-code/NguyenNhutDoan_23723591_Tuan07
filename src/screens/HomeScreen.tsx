import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { CategoryChips } from "../components/CategoryChips";
import { PriceFilter } from "../components/PriceFilter";
import { BookGrid } from "../components/BookGrid";
import { FloatingCartButton } from "../components/FloatingCartButton";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";

import { getBooks } from "../services/bookService";
import { getCategories } from "../services/categoryService";
import { getErrorMessage } from "../api/client";

import { useDebounce } from "../hooks/useDebounce";
import {
  filterBooks,
  PriceRange,
} from "../utils/filters";

import { TabScreenProps } from "../navigation/types";
import { colors } from "../theme";
import { useCart } from "../store/hooks";
import { Book, Category } from "../types";

export function HomeScreen({
  navigation,
  route,
}: TabScreenProps<"Home">) {
  const { totalQuantity } = useCart();

  // Dữ liệu từ API
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>(null);

  // BT7.7a: debounce từ khóa 400ms
  const debouncedKeyword = useDebounce(keyword, 400);

  // BT7.5b: tải books và categories song song
  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [b, c] = await Promise.all([
        getBooks(),
        getCategories(),
      ]);

      setBooks(b);
      setCategories(c);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // BT7.8b:
  // Nhận categoryId do tab Danh mục gửi sang.
  // Sau khi nhận thì xóa param để tránh áp dụng lại.
  useEffect(() => {
    const id = route.params?.categoryId;

    if (id !== undefined) {
      setCategoryId(id);

      navigation.setParams({
        categoryId: undefined,
      });
    }
  }, [route.params?.categoryId, navigation]);

  // BT7.7c + BT7.8a:
  // Lọc kết hợp keyword + category
  const visibleBooks = useMemo(
    () =>
      filterBooks(books, {
        keyword: debouncedKeyword,
        categoryId: categoryId,
        priceRange: null,
      }),
    [
      books,
      debouncedKeyword,
      categoryId,
    ]
  );

  // BT7.7d
  const clearFilters = () => {
    setKeyword("");
    setCategoryId(null);
    setPriceRange(null);
  };

  const hasFilter =
    keyword.trim() !== "" ||
    categoryId !== null ||
    priceRange !== null;

  // BT7.5c
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
      <Header
        title="📚 BookStore"
        onSearchPress={() =>
          setSearchOpen((v) => !v)
        }
      />

      {searchOpen && (
        <SearchBar
          value={keyword}
          onChangeText={setKeyword}
          onClose={() => {
            setSearchOpen(false);
            setKeyword("");
          }}
        />
      )}

      <BookGrid
        data={visibleBooks}
        onPressBook={(b) =>
          navigation.navigate("BookDetail", {
            bookId: b.id,
          })
        }
        ListHeaderComponent={
          <View>
            <CategoryChips
              categories={categories}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />

            <PriceFilter
              value={priceRange}
              onChange={setPriceRange}
            />

            {hasFilter && (
              <Pressable
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>
                  ✕ Xóa bộ lọc
                </Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            emoji="🔎"
            title="Không tìm thấy sách phù hợp"
            actionLabel="Xóa bộ lọc"
            onAction={clearFilters}
          />
        }
      />

      <FloatingCartButton
        count={totalQuantity}
        onPress={() =>
          navigation.navigate("Cart")
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  clearButton: {
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginVertical: 8,
  },

  clearButtonText: {
    color: colors.indigo,
    fontWeight: "700",
  },
});