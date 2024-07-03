export const substringUrl = (url: string, searchbox = null) => {
  const path = url.includes("%")
    ? `${url.substring(0, url.indexOf("%"))}...`
    : url
  return path
}
