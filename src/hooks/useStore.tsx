import { useContext } from "react"
import { rootStoreContext } from "../store"

// custom hook to acces store
export const useStore = () => useContext(rootStoreContext)
