import { createSlice } from "@reduxjs/toolkit"

let historySlice = createSlice({
  name: "history",
  initialState: "",
  reducers: {
    // addHistory: (state, { payload }) => {
    //     return payload
    // },
    activeId: (state, { payload = null }) => {
      return payload
    },
  },
})

export const { activeId } = historySlice.actions

export default historySlice.reducer
