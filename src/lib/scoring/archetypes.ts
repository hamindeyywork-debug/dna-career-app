import { FactorCode } from "./factors";

export interface Archetype {
  id: string;
  name: string;
  badgeColor: string;
  shortDescription: string;
  // Vùng đặc trưng trên không gian 16 chiều (giá trị kỳ vọng mỗi trục, -1..1)
  center: Partial<Record<FactorCode, number>>;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "kien-tao-tham-lang",
    name: "Người Kiến Tạo Thầm Lặng",
    badgeColor: "#8E7CC3",
    shortDescription: "Nhìn thấy vấn đề trước khi ai lên tiếng, âm thầm nghĩ cách giải quyết.",
    center: { CR: 0.6, LO: 0.6, IN: 0.6, MO: 0.5, LE: 0.0, CO: -0.1 },
  },
  {
    id: "nha-dieu-phoi-truc-giac",
    name: "Nhà Điều Phối Trực Giác",
    badgeColor: "#E8837B",
    shortDescription: "Đọc vị con người nhanh, giỏi kết nối và dung hòa các phía.",
    center: { CO: 0.6, CL: 0.6, DE: -0.4, PS: 0.5, LE: 0.3 },
  },
  {
    id: "nguoi-dan-duong-ben-bi",
    name: "Người Dẫn Đường Bền Bỉ",
    badgeColor: "#4A7C6F",
    shortDescription: "Kỷ luật cao, đáng tin, dẫn dắt bằng sự nhất quán chứ không ồn ào.",
    center: { DI: 0.7, LE: 0.5, PR: 0.5, VA: 0.3 },
  },
  {
    id: "nguoi-tien-phong-toc-do",
    name: "Người Tiên Phong Tốc Độ",
    badgeColor: "#D9A441",
    shortDescription: "Thích thử nghiệm cái mới, thích nghi nhanh, ngại sự trì trệ.",
    center: { AD: 0.7, CR: 0.5, E: 0.4, DI: -0.2 },
  },
  {
    id: "chuyen-gia-chieu-sau",
    name: "Chuyên Gia Chiều Sâu",
    badgeColor: "#5B7FA6",
    shortDescription: "Ưu tiên chất lượng và chiều sâu chuyên môn hơn tốc độ hay quy mô.",
    center: { LO: 0.7, DI: 0.5, IN: 0.4, LA: 0.5, LE: -0.3 },
  },
  {
    id: "nguoi-ket-noi-am-tham",
    name: "Người Kết Nối Ấm Áp",
    badgeColor: "#C97A9A",
    shortDescription: "Ưu tiên giá trị con người, làm việc tốt nhất khi có sự đồng hành.",
    center: { CL: 0.7, CO: 0.5, VA: 0.4, IN: -0.4 },
  },
  {
    id: "nha-chien-luoc-than-trong",
    name: "Nhà Chiến Lược Thận Trọng",
    badgeColor: "#3E5C76",
    shortDescription: "Ra quyết định dựa trên dữ liệu, không vội vàng, tính toán kỹ rủi ro.",
    center: { LO: 0.6, DE: 0.6, PR: -0.2, VA: -0.2 },
  },
  {
    id: "nguoi-truyen-cam-hung",
    name: "Người Truyền Cảm Hứng",
    badgeColor: "#E0A96D",
    shortDescription: "Năng lượng cao, giỏi kết nối và tạo động lực cho người xung quanh.",
    center: { E: 0.7, LE: 0.5, CO: 0.6, MO: 0.5 },
  },
];

// Tính khoảng cách Euclid giữa vector chuẩn hóa và tâm archetype
export function findNearestArchetype(vector: Partial<Record<FactorCode, number>>): {
  archetype: Archetype;
  distance: number;
} {
  let best: Archetype = ARCHETYPES[0];
  let bestDist = Infinity;
  for (const arch of ARCHETYPES) {
    let sumSq = 0;
    let count = 0;
    for (const key of Object.keys(arch.center) as FactorCode[]) {
      const v = vector[key] ?? 0;
      const c = arch.center[key] ?? 0;
      sumSq += (v - c) ** 2;
      count++;
    }
    const dist = Math.sqrt(sumSq / Math.max(count, 1));
    if (dist < bestDist) {
      bestDist = dist;
      best = arch;
    }
  }
  return { archetype: best, distance: bestDist };
}
