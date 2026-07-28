// CORE-16™ — 16 yếu tố đánh giá, chia 4 nhóm
export type FactorCode =
  | "E" | "DI" | "PR" | "AD" // Nhóm A - Năng lượng & vận hành
  | "DE" | "LO" | "CR" | "PS" // Nhóm B - Tư duy & ra quyết định
  | "MO" | "VA" | "LA" | "LS" // Nhóm C - Động lực & giá trị
  | "CO" | "IN" | "LE" | "CL"; // Nhóm D - Con người & quan hệ

export const FACTORS: Record<FactorCode, { name: string; group: "A" | "B" | "C" | "D"; description: string }> = {
  E: { name: "Năng lượng làm việc", group: "A", description: "Nạp năng lượng từ tương tác hay không gian tập trung" },
  DI: { name: "Tính kỷ luật", group: "A", description: "Duy trì hành động khi không ai giám sát" },
  PR: { name: "Mức chịu áp lực", group: "A", description: "Phản ứng khi deadline gấp, bị chỉ trích" },
  AD: { name: "Khả năng thích nghi", group: "A", description: "Phản ứng khi kế hoạch bị đảo lộn" },
  DE: { name: "Cách ra quyết định", group: "B", description: "Dựa dữ liệu/logic hay trực giác" },
  LO: { name: "Tư duy logic", group: "B", description: "Mức thoải mái với hệ thống, dữ liệu có cấu trúc" },
  CR: { name: "Sáng tạo", group: "B", description: "Xu hướng tìm giải pháp mới" },
  PS: { name: "Giải quyết vấn đề", group: "B", description: "Phân tích trước, thử-sai trước, hay hỏi ý kiến trước" },
  MO: { name: "Động lực nội tại", group: "C", description: "Điều gì duy trì nỗ lực lâu dài" },
  VA: { name: "Giá trị sống", group: "C", description: "Ưu tiên giữa các giá trị xung đột" },
  LA: { name: "Khả năng học hỏi", group: "C", description: "Tốc độ tiếp thu kỹ năng mới" },
  LS: { name: "Phong cách học tập", group: "C", description: "Học qua thực hành, quan sát, hay lý thuyết" },
  CO: { name: "Khả năng giao tiếp", group: "D", description: "Trực tiếp hay khéo léo, nói hay lắng nghe" },
  IN: { name: "Mức độc lập", group: "D", description: "Tự quyết một mình hay cần khuôn khổ rõ ràng" },
  LE: { name: "Khả năng lãnh đạo", group: "D", description: "Xu hướng dẫn dắt nhóm" },
  CL: { name: "Phong cách hợp tác", group: "D", description: "Làm nhóm hay làm độc lập hiệu quả hơn" },
};

export const FACTOR_CODES = Object.keys(FACTORS) as FactorCode[];

export type WeightMap = Partial<Record<FactorCode, number>>;
