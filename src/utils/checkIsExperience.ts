export const checkIsExperience = (): boolean => {
  const url = window.location.href
  if (url && url.endsWith("experience/chat")) {
    return true
  }
  return false
}
