import { decryptConfig } from "./decryptConfig"

export const isShowConfiguration = (): boolean => {
  return decryptConfig("_configuaration")
}

export const isShowSupContent = (): boolean => {
  return (
    decryptConfig("_configuaration") ||
    decryptConfig("_configuaration_sup_content")
  )
}
