import CryptoJS from "crypto-js"
const KEY_CRYPTO = "U2FsdGVkX1/LmBQVOC5LRJguNvHdebsiKdpkAli5rcU="
export const decryptConfig = (keyConfig: string): boolean => {
  const decryptAES = (encryptedBase64: any, key: any) => {
    if (encryptedBase64) {
      const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key)
      if (decrypted) {
        try {
          const str = decrypted.toString(CryptoJS.enc.Utf8)
          if (str.length > 0) {
            return str
          } else {
            return "error"
          }
        } catch (e) {
          return "error"
        }
      }
      return "error"
    } else {
      return "error"
    }
  }

  const handleMsgChange = () => {
    const encryptedBase64 = localStorage.getItem(keyConfig) || ""
    return encryptedBase64
  }
  const decryptOutputText = () => {
    const outputText = decryptAES(handleMsgChange(), KEY_CRYPTO)
    if (outputText == "1") {
      return true
    }
    return false
  }
  return decryptOutputText()
}
