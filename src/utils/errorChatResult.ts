export const ERROR_DEFAULT =
  "Xin lỗi, hệ thống chưa thể trả lời câu hỏi của bạn. Hãy đặt một câu hỏi khác để tôi có thể giúp bạn tốt hơn."
export const ERROR_NETWORK =
  "Do kết nối mạng không ổn định, hệ thống chưa thể trả lời câu hỏi của bạn. Vui lòng chọn thử lại."
export const ERROR_NETWORK_MAX =
  "Do kết nối mạng không ổn định, hệ thống chưa thể trả lời câu hỏi của bạn. Vui lòng kiểm tra lại đường truyền mạng."
export const ERROR_POLICY =
  "Tôi rất lấy làm tiếc, nhưng tôi không thể hỗ trợ hoặc thảo luận về bất kỳ hành vi bất hợp pháp, nguy hiểm hoặc vi phạm đạo đức nào. Nếu bạn có bất kỳ câu hỏi hay chủ đề nào khác muốn thảo luận, xin vui lòng chia sẻ để tôi có thể giúp bạn."
export const ERROR_GOOGLE_NOT_FOUND =
  "Rất tiếc, tôi không thể tìm ra kết quả phù hợp cho yêu cầu của bạn lúc này. Hãy đặt một câu hỏi khác để tôi có thể giúp bạn tốt hơn."
export const ERROR_SEARCH_ENGINE =
  "Rất tiếc, tôi không thể tìm ra kết quả phù hợp cho yêu cầu của bạn lúc này. Hãy đặt một câu hỏi khác để tôi có thể giúp bạn tốt hơn."

export const ERROR_COUNT_MAX = 3

export const errorChatResult = (error: string): string => {
  if (error === "Error: ERROR_POLICY") {
    return ERROR_POLICY
  } else if (error === "Error: GOOGLE_NOT_FOUND") {
    return ERROR_GOOGLE_NOT_FOUND
  } else if (error === "Error: ERROR_SEARCH_ENGINE") {
    return ERROR_SEARCH_ENGINE
  } else if (
    error === `error: ${ERROR_NETWORK}` ||
    error === "TypeError: Failed to fetch" ||
    error === "TypeError: Load failed" ||
    error === "TypeError: NetworkError when attempting to fetch resource." ||
    error === "TypeError"
  ) {
    return ERROR_NETWORK
  } else if (error.includes(`${ERROR_NETWORK_MAX}`)) {
    return ERROR_NETWORK_MAX
  } else {
    return ERROR_DEFAULT
  }
}
