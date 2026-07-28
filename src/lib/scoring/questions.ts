import { WeightMap } from "./factors";

export interface Choice {
  text: string;
  weights: WeightMap;
}

export interface Question {
  id: number;
  groupId: string; // nhóm tình huống liên quan (dùng cho Layer 2 drift)
  crossCheckPairId?: string; // nếu thuộc 1 trong 8 cặp cross-check (Layer 3)
  situation: string;
  choices: [Choice, Choice, Choice, Choice];
}

// Trọng số: +0.7 mạnh, +0.4 vừa (yếu tố phụ), âm là chiều ngược lại trên cùng trục
export const QUESTIONS: Question[] = [
  {
    id: 1, groupId: "ambiguity", situation:
      "Sếp giao bạn một dự án hoàn toàn mới, không ai từng làm trước đó, và không hướng dẫn cụ thể phải bắt đầu từ đâu.",
    choices: [
      { text: "Tự vạch kế hoạch riêng rồi bắt tay làm ngay", weights: { IN: 0.7, CR: 0.4 } },
      { text: "Hỏi sếp thêm chi tiết trước khi bắt đầu", weights: { IN: -0.6, CO: 0.5 } },
      { text: "Tìm người từng làm việc tương tự ở công ty khác để học hỏi", weights: { LA: 0.6, CL: 0.4 } },
      { text: "Chia nhỏ thành từng bước rõ ràng rồi làm tuần tự", weights: { LO: 0.6, DI: 0.5 } },
    ],
  },
  {
    id: 2, groupId: "discipline-work", situation:
      "Bạn đặt mục tiêu hoàn thành báo cáo trong 3 ngày, nhưng đến giữa ngày thứ 2 vẫn chưa động vào và không ai nhắc.",
    choices: [
      { text: "Ngồi vào làm ngay, tự thấy áy náy nếu trễ", weights: { DI: 0.7, MO: 0.4 } },
      { text: "Chờ gần sát deadline mới làm dồn, vì làm tốt nhất khi có áp lực", weights: { DI: -0.6, PR: 0.5 } },
      { text: "Báo trước với sếp để xin thêm thời gian", weights: { CO: 0.5, VA: 0.3 } },
      { text: "Làm một phần rồi dừng lại chờ cảm hứng quay lại", weights: { DI: -0.7, MO: -0.4 } },
    ],
  },
  {
    id: 3, groupId: "pressure-active", crossCheckPairId: "PR-1", situation:
      "Sếp bất ngờ báo deadline dự án bị rút ngắn còn 1 ngày vì đối tác yêu cầu gấp.",
    choices: [
      { text: "Bình tĩnh sắp xếp lại ưu tiên và bắt tay làm ngay", weights: { PR: 0.7, AD: 0.5 } },
      { text: "Thấy hoang mang, cần vài phút lấy lại tinh thần trước khi làm", weights: { PR: -0.6, AD: -0.4 } },
      { text: "Đề xuất chia việc với đồng nghiệp để kịp deadline", weights: { PR: 0.5, CL: 0.5 } },
      { text: "Xin sếp thương lượng lại deadline", weights: { PR: -0.4, CO: 0.5 } },
    ],
  },
  {
    id: 4, groupId: "decision-conflict", situation:
      "Hai đồng nghiệp đưa ra hai hướng giải quyết trái ngược cho cùng một vấn đề, cả hai đều hỏi ý kiến bạn.",
    choices: [
      { text: "Phân tích ưu nhược điểm từng hướng dựa trên dữ liệu", weights: { LO: 0.7, DE: 0.5 } },
      { text: "Đề xuất một hướng thứ ba kết hợp cả hai", weights: { CR: 0.7, PS: 0.5 } },
      { text: "Hỏi thêm lý do đằng sau đề xuất của cả hai trước khi quyết", weights: { CO: 0.6, CL: 0.4 } },
      { text: "Tin vào cảm nhận ai đang tự tin và thuyết phục hơn", weights: { DE: -0.5, CO: -0.3 } },
    ],
  },
  {
    id: 5, groupId: "learning-style", situation:
      "Bạn được giao học một phần mềm hoàn toàn mới trong vòng một tuần để dùng cho dự án.",
    choices: [
      { text: "Đọc hết tài liệu hướng dẫn từ đầu đến cuối trước khi bắt tay", weights: { LS: 0.6, DI: 0.4 } },
      { text: "Mở phần mềm lên và tự mò bằng cách thử", weights: { LS: -0.5, AD: 0.5 } },
      { text: "Tìm video hướng dẫn của người khác để làm theo", weights: { LA: 0.5, LS: 0.2 } },
      { text: "Nhờ đồng nghiệp biết dùng chỉ trực tiếp", weights: { CO: 0.5, LS: -0.2 } },
    ],
  },
  {
    id: 6, groupId: "feedback-active", crossCheckPairId: "CO-1", situation:
      "Bạn phát hiện một lỗi trong báo cáo mà đồng nghiệp cùng team vừa gửi cho khách hàng.",
    choices: [
      { text: "Nhắn thẳng cho đồng nghiệp ngay để họ sửa kịp", weights: { CO: 0.7 } },
      { text: "Nhắn khéo léo, hỏi thăm trước rồi mới góp ý", weights: { CO: 0.3 } },
      { text: "Tự âm thầm sửa giúp mà không nói gì", weights: { CO: -0.6, IN: 0.5 } },
      { text: "Báo với quản lý để xử lý theo quy trình", weights: { CO: -0.4, VA: 0.4 } },
    ],
  },
  {
    id: 7, groupId: "public-speaking", situation:
      "Công ty đề nghị bạn thuyết trình về dự án mình phụ trách trước 50 người.",
    choices: [
      { text: "Nhận lời ngay, thấy đây là cơ hội thể hiện", weights: { E: 0.7, MO: 0.4 } },
      { text: "Nhận lời nhưng chuẩn bị kỹ lưỡng nhiều ngày trước", weights: { DI: 0.6, PR: 0.3 } },
      { text: "Đề nghị làm chung với người khác để đỡ áp lực", weights: { CL: 0.6, PR: -0.4 } },
      { text: "Thấy ngại nhưng vẫn nhận vì nghĩ đây là việc nên làm", weights: { E: -0.5, VA: 0.5 } },
    ],
  },
  {
    id: 8, groupId: "autonomy-given", crossCheckPairId: "IN-1", situation:
      "Bạn được giao một task và có toàn quyền quyết định cách làm, miễn ra kết quả đúng hạn.",
    choices: [
      { text: "Thấy hào hứng, đây đúng kiểu công việc bạn thích", weights: { IN: 0.7, MO: 0.4 } },
      { text: "Thấy hơi lo vì không có ai để tham khảo khi gặp khó", weights: { IN: -0.6, PR: -0.3 } },
      { text: "Tự đặt ra các mốc kiểm tra nhỏ cho chính mình", weights: { IN: 0.5, DI: 0.5 } },
      { text: "Chủ động xin thêm hướng dẫn dù không bắt buộc", weights: { IN: -0.5, CO: 0.4 } },
    ],
  },
  {
    id: 9, groupId: "change-imposed", crossCheckPairId: "AD-1", situation:
      "Công ty thông báo chuyển sang quy trình làm việc hoàn toàn mới, khác cách bạn đã quen 2 năm qua, hiệu lực từ tuần sau.",
    choices: [
      { text: "Thấy hào hứng, muốn thử ngay cách làm mới", weights: { AD: 0.7, CR: 0.4 } },
      { text: "Thấy hơi khó chịu nhưng chấp nhận vì đó là quy định", weights: { AD: 0.2, VA: 0.4 } },
      { text: "Tìm hiểu kỹ lý do thay đổi trước khi thực sự đón nhận", weights: { LO: 0.5, AD: 0.0 } },
      { text: "Cố gắng giữ một phần cách làm cũ nếu có thể", weights: { AD: -0.6, DI: 0.3 } },
    ],
  },
  {
    id: 10, groupId: "repetition", situation:
      "Bạn đang làm một task lặp đi lặp lại mỗi ngày trong 3 tháng liền, không có gì mới.",
    choices: [
      { text: "Vẫn ổn, thấy an tâm khi công việc có thể đoán trước", weights: { E: 0.3, VA: 0.4 } },
      { text: "Bắt đầu thấy chán, tự tìm cách làm nhanh hơn hoặc tự động hóa", weights: { CR: 0.6, PS: 0.5 } },
      { text: "Chủ động xin thêm việc mới để đỡ nhàm", weights: { MO: 0.5, AD: 0.4 } },
      { text: "Vẫn làm tốt nhưng cảm thấy thiếu động lực dần", weights: { MO: -0.5, DI: 0.4 } },
    ],
  },
  {
    id: 11, groupId: "team-conflict", situation:
      "Một thành viên trong nhóm dự án liên tục trễ deadline khiến cả nhóm bị ảnh hưởng.",
    choices: [
      { text: "Chủ động đứng ra sắp xếp lại công việc, phân chia rõ trách nhiệm", weights: { LE: 0.7, PS: 0.5 } },
      { text: "Trực tiếp nói chuyện riêng với người đó để hiểu nguyên nhân", weights: { CO: 0.6, CL: 0.4 } },
      { text: "Báo lên quản lý để có hướng xử lý chính thức", weights: { VA: 0.4, LE: -0.4 } },
      { text: "Âm thầm gánh thêm phần việc để kịp deadline chung", weights: { CL: 0.6, LE: -0.5 } },
    ],
  },
  {
    id: 12, groupId: "leadership-offered", crossCheckPairId: "LE-1", situation:
      "Sếp hỏi bạn có muốn ứng tuyển vào vị trí trưởng nhóm đang trống hay không.",
    choices: [
      { text: "Đồng ý ngay, cảm thấy đây là bước tiến tự nhiên", weights: { LE: 0.7, MO: 0.4 } },
      { text: "Cân nhắc kỹ vì không chắc mình hợp với quản lý người khác", weights: { LE: 0.0, IN: 0.4 } },
      { text: "Từ chối, muốn tiếp tục phát triển sâu về chuyên môn", weights: { LE: -0.6, MO: 0.3 } },
      { text: "Hỏi thêm về trách nhiệm cụ thể trước khi quyết định", weights: { LO: 0.4, DE: 0.4 } },
    ],
  },
  {
    id: 13, groupId: "values-tradeoff-1", situation:
      "Bạn chọn giữa hai lời mời: công ty lớn ổn định lương cố định, và startup nhỏ rủi ro cao nhưng học nhanh có cổ phần.",
    choices: [
      { text: "Chọn công ty lớn — ưu tiên sự ổn định", weights: { VA: -0.6, PR: -0.4 } },
      { text: "Chọn startup — ưu tiên tốc độ phát triển bản thân", weights: { VA: 0.6, LA: 0.6 } },
      { text: "Cân nhắc rất lâu, hỏi ý kiến nhiều người trước khi quyết", weights: { DE: -0.4, CL: 0.4 } },
      { text: "Chọn dựa trên đội ngũ và văn hóa nào khiến mình thoải mái hơn", weights: { VA: 0.2, CO: 0.4 } },
    ],
  },
  {
    id: 14, groupId: "motivation-type", situation:
      "Bạn nhận được một khoản thưởng bất ngờ từ công ty vì hoàn thành tốt dự án.",
    choices: [
      { text: "Vui nhưng tự hào hơn vì được sếp công nhận trước cả team", weights: { MO: 0.5 } },
      { text: "Vui vì đây là bằng chứng cho thấy mình đang tiến bộ", weights: { MO: 0.6 } },
      { text: "Vui hơn vì dự án đó thực sự tạo giá trị cho khách hàng", weights: { MO: 0.7, VA: 0.3 } },
      { text: "Vui đơn giản vì có thêm thu nhập", weights: { MO: 0.2, VA: -0.2 } },
    ],
  },
  {
    id: 15, groupId: "collab-structured", crossCheckPairId: "CL-1", situation:
      "Nhóm bạn được giao làm chung một bài thuyết trình, mỗi người phụ trách một phần rõ ràng.",
    choices: [
      { text: "Thích tự làm phần của mình thật kỹ rồi ghép lại", weights: { CL: -0.5, DI: 0.4 } },
      { text: "Thích ngồi cùng nhau làm từ đầu đến cuối", weights: { CL: 0.7, CO: 0.4 } },
      { text: "Chủ động đứng ra tổng hợp và chỉnh sửa phần của mọi người", weights: { LE: 0.6, LO: 0.4 } },
      { text: "Làm phần mình trước, góp ý thêm cho người khác nếu được hỏi", weights: { CL: 0.2, IN: 0.4 } },
    ],
  },
  {
    id: 16, groupId: "proactive-improve", situation:
      "Bạn nhận ra một quy trình làm việc hiện tại đang mất thời gian, dù không ai phàn nàn.",
    choices: [
      { text: "Tự nghĩ cách cải tiến rồi đề xuất với sếp", weights: { CR: 0.6, LE: 0.5 } },
      { text: "Âm thầm tối ưu phần việc của riêng mình trước", weights: { PS: 0.5, IN: 0.5 } },
      { text: "Hỏi thăm đồng nghiệp khác xem họ có thấy vậy không trước", weights: { CO: 0.5, CL: 0.4 } },
      { text: "Để vậy vì không phải việc của mình", weights: { MO: -0.5, VA: -0.3 } },
    ],
  },
  {
    id: 17, groupId: "persuasion", situation:
      "Bạn phải thuyết phục một khách hàng khó tính chấp nhận đề xuất mà bạn tin là đúng.",
    choices: [
      { text: "Trình bày lại bằng số liệu và dẫn chứng cụ thể", weights: { LO: 0.6, CO: 0.4 } },
      { text: "Lắng nghe kỹ mối lo của họ rồi điều chỉnh cách trình bày", weights: { CO: 0.5, AD: 0.5 } },
      { text: "Giữ vững lập trường vì tin đề xuất của mình là đúng", weights: { VA: 0.5, PR: 0.4 } },
      { text: "Đề nghị một phương án trung gian để cả hai bên hài lòng", weights: { PS: 0.6, CR: 0.4 } },
    ],
  },
  {
    id: 18, groupId: "values-tradeoff-time", crossCheckPairId: "VA-1", situation:
      "Công ty đề nghị bạn làm thêm giờ cuối tuần liên tục 2 tháng để kịp dự án lớn, đổi lại là thưởng đáng kể.",
    choices: [
      { text: "Đồng ý — cơ hội tài chính tốt đáng để đánh đổi thời gian", weights: { VA: 0.6, PR: 0.4 } },
      { text: "Từ chối — thời gian cho bản thân và gia đình quan trọng hơn", weights: { VA: -0.6, PR: -0.3 } },
      { text: "Đồng ý nhưng thương lượng lại một phần điều kiện", weights: { DE: 0.5, CO: 0.4 } },
      { text: "Cân nhắc dựa trên việc dự án có ý nghĩa với sự nghiệp lâu dài không", weights: { VA: 0.3, MO: 0.5 } },
    ],
  },
  {
    id: 19, groupId: "complex-info", situation:
      "Bạn đang đọc một tài liệu chuyên môn phức tạp mà cả nhóm cần hiểu trước cuộc họp chiều nay.",
    choices: [
      { text: "Đọc kỹ từng phần, ghi chú lại logic để nắm chắc bản chất", weights: { LO: 0.7, LS: 0.4 } },
      { text: "Đọc lướt để nắm ý chính, chi tiết tính sau", weights: { E: 0.4, AD: 0.4 } },
      { text: "Tóm tắt lại theo cách hiểu của mình rồi kiểm tra với đồng nghiệp", weights: { CO: 0.5, CL: 0.4 } },
      { text: "Tìm bản tóm tắt hoặc hỏi người đã đọc trước đó", weights: { LA: 0.5, LS: -0.3 } },
    ],
  },
  {
    id: 20, groupId: "mistake", situation:
      "Bạn phát hiện mình đã đưa ra một quyết định sai trong công việc, gây ảnh hưởng nhỏ đến tiến độ chung.",
    choices: [
      { text: "Nhận lỗi ngay với team, đề xuất cách khắc phục", weights: { VA: 0.6, PS: 0.5 } },
      { text: "Tự sửa lại âm thầm trước khi ai phát hiện", weights: { IN: 0.5, PR: 0.3 } },
      { text: "Phân tích kỹ nguyên nhân để tránh lặp lại trong tương lai", weights: { LO: 0.5, LA: 0.5 } },
      { text: "Thấy áp lực nặng nề, mất một lúc mới lấy lại tinh thần", weights: { PR: -0.6, MO: -0.3 } },
    ],
  },
  {
    id: 21, groupId: "idea-conflict-org", situation:
      "Bạn có một ý tưởng cải tiến sản phẩm khác hoàn toàn với hướng đi hiện tại của cấp trên.",
    choices: [
      { text: "Trình bày thẳng thắn dù biết có thể bị phản đối", weights: { VA: 0.5, CO: 0.5 } },
      { text: "Tìm thời điểm và cách trình bày phù hợp để dễ được lắng nghe", weights: { CO: 0.4, AD: 0.5 } },
      { text: "Thử nghiệm nhỏ trước để có bằng chứng trước khi đề xuất", weights: { PS: 0.6, LO: 0.4 } },
      { text: "Giữ ý tưởng lại, chờ cơ hội phù hợp hơn trong tương lai", weights: { PR: -0.3, IN: -0.4 } },
    ],
  },
  {
    id: 22, groupId: "side-project", situation:
      "Bạn được mời tham gia một dự án phụ ngoài công việc chính, không trả thêm lương, nhưng học được kỹ năng mới.",
    choices: [
      { text: "Nhận lời ngay vì cơ hội học hỏi quý giá", weights: { LA: 0.7, MO: 0.4 } },
      { text: "Cân nhắc kỹ vì lo ảnh hưởng đến công việc chính", weights: { VA: 0.4, DI: 0.4 } },
      { text: "Nhận lời nhưng đặt giới hạn thời gian rõ ràng", weights: { DI: 0.5, IN: 0.4 } },
      { text: "Từ chối vì không thấy lợi ích trực tiếp", weights: { MO: -0.4, VA: -0.3 } },
    ],
  },
  {
    id: 23, groupId: "pressure-passive", situation:
      "Đồng nghiệp thân thiết nhắn tin nhờ bạn giúp gấp một việc ngoài giờ làm, ngay khi bạn vừa kết thúc một ngày dài mệt mỏi.",
    choices: [
      { text: "Giúp ngay dù mệt, vì đã hứa sẽ hỗ trợ nhau", weights: { VA: 0.4, PR: 0.5 } },
      { text: "Giải thích tình trạng hiện tại và hẹn giúp vào sáng hôm sau", weights: { CO: 0.5, IN: 0.4 } },
      { text: "Giúp một phần nhỏ trong khả năng, phần còn lại từ chối khéo", weights: { PS: 0.5, CO: 0.3 } },
      { text: "Từ chối thẳng vì cần thời gian nghỉ ngơi cho bản thân", weights: { VA: -0.4, IN: 0.5 } },
    ],
  },
  {
    id: 24, groupId: "discipline-personal", crossCheckPairId: "DI-1", situation:
      "Bạn tự đặt mục tiêu tập thể dục 3 lần/tuần để cải thiện sức khỏe, không ai theo dõi hay nhắc nhở.",
    choices: [
      { text: "Duy trì đều đặn suốt nhiều tháng dù không ai kiểm tra", weights: { DI: 0.7 } },
      { text: "Làm tốt vài tuần đầu rồi dần bỏ bê", weights: { DI: -0.6 } },
      { text: "Chỉ duy trì được khi có bạn bè cùng tập", weights: { DI: 0.1, CL: 0.5 } },
      { text: "Đặt ứng dụng nhắc nhở để tự tạo áp lực cho bản thân", weights: { DI: 0.3 } },
    ],
  },
  {
    id: 25, groupId: "interview", situation:
      "Bạn đang phỏng vấn cho vị trí mới và nhà tuyển dụng hỏi: \"Điểm yếu lớn nhất của bạn trong công việc là gì?\"",
    choices: [
      { text: "Trả lời thẳng thắn về một điểm yếu thật, kèm cách khắc phục", weights: { VA: 0.6, LA: 0.4 } },
      { text: "Chọn một điểm yếu \"an toàn\" nghe không quá tệ", weights: { PR: -0.4, CO: 0.3 } },
      { text: "Hỏi lại để hiểu họ đang tìm kiếm điều gì trước khi trả lời", weights: { DE: 0.5, LO: 0.4 } },
      { text: "Cảm thấy khó chịu với câu hỏi này nhưng vẫn trả lời", weights: { PR: -0.5, VA: 0.3 } },
    ],
  },
  {
    id: 26, groupId: "speed-vs-quality", situation:
      "Bạn chọn cách hoàn thành báo cáo: nhanh trong 2 ngày với chất lượng \"đủ tốt\", hoặc kỹ trong 5 ngày với chất lượng vượt kỳ vọng.",
    choices: [
      { text: "Chọn làm nhanh — đúng deadline quan trọng hơn hoàn hảo", weights: { VA: -0.3, PR: 0.4 } },
      { text: "Chọn làm kỹ — chất lượng phản ánh uy tín cá nhân", weights: { VA: 0.5, DI: 0.5 } },
      { text: "Hỏi ý kiến sếp xem ưu tiên nào quan trọng hơn", weights: { CO: 0.5, DE: 0.4 } },
      { text: "Làm nhanh trước, dùng thời gian dư để tinh chỉnh thêm", weights: { PS: 0.6, AD: 0.4 } },
    ],
  },
  {
    id: 27, groupId: "pressure-active-2", crossCheckPairId: "PR-1", situation:
      "Bạn đang làm việc bình thường thì nhận cuộc gọi khẩn từ bạn thân đang gặp chuyện gấp cần bạn hỗ trợ ngay trong giờ làm.",
    choices: [
      { text: "Xin phép rời khỏi công việc ngay để xử lý", weights: { PR: 0.6, VA: 0.4 } },
      { text: "Thấy rối, cần vài phút sắp xếp lại suy nghĩ trước khi phản ứng", weights: { PR: -0.6, AD: -0.4 } },
      { text: "Xử lý nhanh gọn qua điện thoại rồi quay lại công việc", weights: { PR: 0.6, PS: 0.5 } },
      { text: "Hẹn lại sau giờ làm nếu không phải chuyện quá nghiêm trọng", weights: { PR: 0.2, DE: 0.4 } },
    ],
  },
  {
    id: 28, groupId: "recognition", situation:
      "Bạn nhận thấy một đồng nghiệp trong nhóm nhận được nhiều lời khen hơn dù đóng góp của bạn không kém.",
    choices: [
      { text: "Chủ động trình bày rõ hơn về đóng góp của mình lần tới", weights: { CO: 0.5, MO: 0.4 } },
      { text: "Không quá bận tâm, miễn công việc mình làm tốt là đủ", weights: { MO: 0.5, VA: 0.3 } },
      { text: "Cảm thấy chạnh lòng nhưng không biết nên làm gì", weights: { PR: -0.4, MO: 0.2 } },
      { text: "Nói chuyện thẳng thắn với sếp về ghi nhận công bằng hơn", weights: { VA: 0.5, LE: 0.5 } },
    ],
  },
  {
    id: 29, groupId: "feedback-passive", crossCheckPairId: "CO-1", situation:
      "Đồng nghiệp chỉ ra một lỗi trong phần việc của chính bạn ngay trước mặt cả nhóm.",
    choices: [
      { text: "Cảm ơn thẳng thắn và sửa ngay", weights: { CO: 0.7, VA: 0.4 } },
      { text: "Thấy hơi ngại nhưng vẫn ghi nhận để sửa sau", weights: { CO: 0.2, PR: -0.3 } },
      { text: "Giải thích lý do dẫn đến lỗi đó trước khi nhận", weights: { CO: 0.3, DE: 0.4 } },
      { text: "Thấy khó chịu vì bị nói trước mặt mọi người, dù biết mình sai", weights: { PR: -0.5, VA: 0.3 } },
    ],
  },
  {
    id: 30, groupId: "priority-conflict", situation:
      "Bạn có 3 task cùng deadline hôm nay: một quan trọng không gấp, một gấp không quan trọng, một sếp trực tiếp theo dõi.",
    choices: [
      { text: "Làm task sếp theo dõi trước", weights: { VA: -0.2, PR: 0.4 } },
      { text: "Làm task quan trọng nhất trước, bất kể ai theo dõi", weights: { VA: 0.5, LO: 0.5 } },
      { text: "Làm task gấp trước để giải quyết nhanh, dồn phần còn lại sau", weights: { PR: 0.5, PS: 0.5 } },
      { text: "Trao đổi với sếp để sắp xếp lại ưu tiên hợp lý", weights: { CO: 0.5, DE: 0.5 } },
    ],
  },
  {
    id: 31, groupId: "autonomy-new-job", crossCheckPairId: "IN-1", situation:
      "Bạn mới vào công việc mới, tuần đầu tiên sếp để bạn tự tìm hiểu quy trình mà không hướng dẫn chi tiết.",
    choices: [
      { text: "Thấy thoải mái, tận dụng thời gian này để tự khám phá", weights: { IN: 0.7, AD: 0.5 } },
      { text: "Thấy bất an, mong sếp hướng dẫn cụ thể hơn", weights: { IN: -0.6, PR: -0.4 } },
      { text: "Chủ động hỏi đồng nghiệp xung quanh để đẩy nhanh quá trình", weights: { CO: 0.5, LA: 0.5 } },
      { text: "Tự lập một checklist những gì cần học rồi thực hiện theo", weights: { DI: 0.6, LO: 0.4 } },
    ],
  },
  {
    id: 32, groupId: "advice-others", situation:
      "Bạn phải đưa lời khuyên cho bạn thân đang phân vân giữa giữ công việc ổn định hay nhảy sang cơ hội mới rủi ro.",
    choices: [
      { text: "Khuyên nên phân tích kỹ số liệu trước khi quyết", weights: { LO: 0.6, DE: 0.5 } },
      { text: "Khuyên nên nghe theo cảm giác thật của bản thân", weights: { DE: -0.5, CR: 0.4 } },
      { text: "Hỏi lại điều gì thực sự quan trọng với họ lúc này", weights: { CO: 0.5, VA: 0.4 } },
      { text: "Chia sẻ trải nghiệm cá nhân tương tự để họ tham khảo", weights: { CL: 0.5, LA: 0.4 } },
    ],
  },
  {
    id: 33, groupId: "adapt-optional", crossCheckPairId: "AD-1", situation:
      "Bạn tình cờ phát hiện một công cụ mới giúp công việc hiện tại nhanh hơn đáng kể, dù không ai yêu cầu chuyển đổi.",
    choices: [
      { text: "Thử ngay lập tức vì tò mò và muốn tối ưu công việc", weights: { AD: 0.7, CR: 0.5 } },
      { text: "Ghi chú lại, thử khi có thời gian rảnh hơn", weights: { AD: 0.1, DI: 0.4 } },
      { text: "Hỏi đồng nghiệp đã dùng thử ai chưa trước khi đổi", weights: { CO: 0.5, PR: 0.3 } },
      { text: "Tiếp tục dùng cách cũ vì đã quen và ổn định", weights: { AD: -0.6, VA: -0.3 } },
    ],
  },
  {
    id: 34, groupId: "process-deviation", situation:
      "Cách làm việc hiện tại của bạn hiệu quả hơn, nhưng đi ngược \"quy trình chuẩn\" mà công ty áp dụng cho mọi người.",
    choices: [
      { text: "Tiếp tục làm theo cách của mình vì nó hiệu quả hơn", weights: { VA: 0.5, IN: 0.6 } },
      { text: "Chuyển sang làm theo quy trình chuẩn để đồng bộ với team", weights: { VA: -0.4, CL: 0.5 } },
      { text: "Đề xuất với sếp để quy trình chuẩn được cập nhật", weights: { LE: 0.6, CO: 0.5 } },
      { text: "Kết hợp cả hai — giữ phần hiệu quả, tuân thủ phần cần thiết", weights: { PS: 0.6, AD: 0.5 } },
    ],
  },
  {
    id: 35, groupId: "leadership-emergent", crossCheckPairId: "LE-1", situation:
      "Trong một dự án nhóm, không ai được chỉ định trưởng nhóm, nhưng cả nhóm đang lúng túng không biết bắt đầu từ đâu.",
    choices: [
      { text: "Chủ động đứng ra đề xuất cách chia việc cho cả nhóm", weights: { LE: 0.7, PS: 0.5 } },
      { text: "Chờ xem có ai khác đứng ra trước, mình sẽ hỗ trợ theo", weights: { LE: -0.5, CL: 0.5 } },
      { text: "Đề xuất cả nhóm cùng thảo luận để tự nhiên hình thành vai trò", weights: { CO: 0.5, CL: 0.4 } },
      { text: "Tự làm phần việc rõ ràng thuộc chuyên môn mình trước", weights: { IN: 0.5, LE: -0.4 } },
    ],
  },
  {
    id: 36, groupId: "audience-adapt", situation:
      "Bạn phải trình bày một ý tưởng phức tạp cho một nhóm người hoàn toàn không có nền tảng chuyên môn liên quan.",
    choices: [
      { text: "Đơn giản hóa tối đa, dùng ví dụ đời thường dễ hiểu", weights: { CO: 0.6, CR: 0.5 } },
      { text: "Trình bày đầy đủ và chính xác, giải thích thêm nếu họ hỏi", weights: { LO: 0.5, CO: 0.2 } },
      { text: "Chuẩn bị hình ảnh/sơ đồ trực quan để hỗ trợ giải thích", weights: { CR: 0.5, PS: 0.4 } },
      { text: "Thấy hơi lo vì khó truyền đạt, nhưng vẫn cố gắng hết sức", weights: { PR: -0.3, VA: 0.4 } },
    ],
  },
  {
    id: 37, groupId: "motivation-plateau", situation:
      "Bạn phát hiện mình mất hứng thú dần với công việc hiện tại sau hơn một năm gắn bó, dù mọi thứ vẫn ổn định.",
    choices: [
      { text: "Chủ động tìm task mới, dự án mới để làm mới bản thân", weights: { MO: 0.5, AD: 0.5 } },
      { text: "Bắt đầu tìm hiểu cơ hội ở nơi khác", weights: { MO: 0.3, IN: 0.5 } },
      { text: "Nói chuyện với sếp về mong muốn phát triển thêm", weights: { CO: 0.5, LE: 0.4 } },
      { text: "Chấp nhận đây là giai đoạn bình thường, tiếp tục làm tốt", weights: { DI: 0.5, VA: 0.3 } },
    ],
  },
  {
    id: 38, groupId: "collab-unstructured", crossCheckPairId: "CL-1", situation:
      "Nhóm bạn được giao một dự án nhưng không ai phân chia việc trước — cả nhóm phải tự thống nhất cách làm.",
    choices: [
      { text: "Đề xuất ngồi lại cùng nhau lên kế hoạch trước khi bắt tay", weights: { CL: 0.6, CO: 0.5 } },
      { text: "Tự nhận phần việc phù hợp với thế mạnh của mình trước", weights: { CL: -0.4, IN: 0.5 } },
      { text: "Đứng ra tổ chức và phân chia việc cho cả nhóm", weights: { LE: 0.7, PS: 0.5 } },
      { text: "Chờ xem người khác đề xuất gì trước rồi góp ý sau", weights: { CL: 0.2, CO: -0.4 } },
    ],
  },
  {
    id: 39, groupId: "mentoring", situation:
      "Bạn cân nhắc nhận lời mời làm mentor cho một bạn nhân viên mới, dù việc này chiếm thêm thời gian mỗi tuần.",
    choices: [
      { text: "Nhận lời ngay, thích cảm giác giúp người khác phát triển", weights: { MO: 0.6, LE: 0.5 } },
      { text: "Cân nhắc dựa trên việc điều này có giúp ích lộ trình sự nghiệp mình không", weights: { VA: 0.4, DE: 0.5 } },
      { text: "Nhận lời nhưng đặt giới hạn thời gian rõ ràng", weights: { DI: 0.5, IN: 0.4 } },
      { text: "Từ chối vì muốn tập trung hoàn toàn vào chuyên môn", weights: { MO: 0.3, LE: -0.5 } },
    ],
  },
  {
    id: 40, groupId: "values-tradeoff-family", crossCheckPairId: "VA-1", situation:
      "Bạn được đề nghị vị trí mới lương cao hơn đáng kể, nhưng phải chuyển đến thành phố khác, xa gia đình.",
    choices: [
      { text: "Nhận lời — cơ hội phát triển sự nghiệp quan trọng hơn", weights: { VA: 0.6, PR: 0.4 } },
      { text: "Từ chối — gần gia đình quan trọng hơn thu nhập", weights: { VA: -0.6, PR: -0.3 } },
      { text: "Thương lượng phương án làm việc từ xa một phần", weights: { DE: 0.5, PS: 0.5 } },
      { text: "Cần thời gian dài để cân nhắc mọi khía cạnh trước khi quyết", weights: { DE: -0.4, VA: 0.1 } },
    ],
  },
];

// 8 cặp cross-check dùng cho Layer 3 (nhóm theo crossCheckPairId)
export const CROSS_CHECK_GROUPS = ["PR-1", "CO-1", "IN-1", "AD-1", "LE-1", "CL-1", "VA-1", "DI-1"];
