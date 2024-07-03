export const NOT_FOUND = [
  "xin lỗi",
  "không có thông tin",
  "không thể cung cấp",
  "vui lòng cung cấp thông tin",
  "vui lòng cung cấp thêm thông tin",
  "không có đủ thông tin",
]

export const multiIncludes = (text = "", values: string[] = []) => {
  let regrex = new RegExp(values.join("|"))
  return regrex.test(text.toLowerCase())
}
