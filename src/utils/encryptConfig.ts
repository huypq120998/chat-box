import CryptoJS from "crypto-js"
const KEY_CRYPTO = "U2FsdGVkX1/LmBQVOC5LRJguNvHdebsiKdpkAli5rcU="
export const encryptConfig = (showConfig: any, keyConfig: string): any => {
  const encryptAES = (text: any, key: any) => {
    return CryptoJS.AES.encrypt(text, key).toString()
  }
  const encryptInputText = () => {
    const encryptedBase64Input = encryptAES(showConfig, KEY_CRYPTO)
    if (!encryptedBase64Input) return
    localStorage.setItem(keyConfig, encryptedBase64Input)
  }
  encryptInputText()
}
