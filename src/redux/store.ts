import { configureStore } from "@reduxjs/toolkit"

import history from "./history"
import idChatHistory from "./idChatHistory"

export const store = configureStore({
  reducer: {
    history,
    idChatHistory,
  },
})
