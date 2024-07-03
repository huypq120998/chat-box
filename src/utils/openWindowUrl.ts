import isEmpty from "lodash/isEmpty"

export const openWindowToUrl = (url: string, searchbox = null) => {
  // let _url = url.replace("trolyao.toaan.gov.vn", "tlacc.cyberbot.vn/static");
  let _url = url
  if (
    url.includes(window.location.origin) ||
    url.includes("trolyao.toaan.gov.vn")
  ) {
    const path = url.includes("?") ? url.substring(0, url.indexOf("?")) : url
    const params = url.includes("?") ? url.substring(url.indexOf("?")) : ""
    const searchParams = new URLSearchParams(params)
    if (searchbox) {
      searchParams.set("searchbox", searchbox)
    }
    if (searchParams && !isEmpty(searchParams.toString())) {
      _url = `${path}?${searchParams.toString()}`
    }
  }
  // if(_url?.includes('mic.cyberbot.vn')){
  //   _url = _url.replace("mic.cyberbot.vn", "tlacc.cyberbot.vn");
  // }
  window.open(_url, "_blank")?.focus()
}
