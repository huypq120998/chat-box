export const urlDownloadApp = (type: string) => {
  const path =
    type === "ios"
      ? "https://apps.apple.com/vn/app/trợ-lý-ảo-công-chức/id6468249873?l=vi"
      : type === "android"
      ? import.meta.env.VITE_BASE_DOMAIN +
        "/download/trolyao_congchuc_1.0.0.apk"
      : ""
  return path
}
export const getMobileOperatingSystem = () => {
  var userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone"
  }

  if (/android/i.test(userAgent)) {
    return "android"
  }
  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return "ios"
  }

  if (
    navigator?.maxTouchPoints > 1 &&
    !!userAgent.match(/Version\/[\d\.]+.*Safari/)
  ) {
    return "ios"
  }

  return "unknown"
}
export const makeDownloadApp = (type: string) => {
  const data = urlDownloadApp(type)
  try {
    const a = document.createElement("a")
    a.href = data
    a.download = data.split("/").pop() as string
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (err) {
    console.log(err)
  }
}
