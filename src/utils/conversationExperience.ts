export const getConversationStorage = (): any => {
  let conversation = sessionStorage.getItem("conversation")
  if (conversation && typeof conversation === "string") {
    conversation = JSON.parse(conversation)
  }
  return conversation
}

export const setConversationStorage = (conversation: any): any => {
  sessionStorage.setItem("conversation", JSON.stringify(conversation))
}
s
