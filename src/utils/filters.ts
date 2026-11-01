import { Book } from "../types";

// Bỏ dấu tiếng Việt để "nha gia kim" vẫn tìm ra "Nhà Giả Kim"
// (ĐÃ VIẾT SẴN — chỉ cần gọi)
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

export type PriceRange = "lt100" | "100to300" | "gt300" | null;

export const PRICE_RANGES: {
  key: Exclude<PriceRange, null>;
  label: string;
}[] = [
  { key: "lt100", label: "Dưới 100k" },
  { key: "100to300", label: "100k–300k" },
  { key: "gt300", label: "Trên 300k" },
];

// TODO BT7.C2 (thử thách): trả true nếu giá nằm trong khoảng r (null = không lọc)
// lt100: < 100000
// 100to300: 100000..300000
// gt300: > 300000
const inRange = (price: number, r: PriceRange): boolean => {
  void price;
  void r;
  return true;
};

export interface BookFilter {
  keyword: string;
  categoryId: number | null;
  priceRange: PriceRange;
}

// Lọc KẾT HỢP:
// từ khoá (tên/tác giả) + danh mục
export function filterBooks(books: Book[], f: BookFilter): Book[] {
  const keyword = normalize(f.keyword);

  // Chưa làm BT7.C2 nên chưa lọc theo giá
  void inRange;

  return books.filter((b) => {
    // BT7.7c: lọc theo từ khóa
    const matchKeyword =
      keyword === "" ||
      normalize(b.title).includes(keyword) ||
      normalize(b.author).includes(keyword);

    // BT7.8a: lọc theo danh mục
    const matchCategory =
      f.categoryId === null ||
      b.categoryId === f.categoryId;

    // Kết hợp theo AND
    return matchKeyword && matchCategory;
  });
}