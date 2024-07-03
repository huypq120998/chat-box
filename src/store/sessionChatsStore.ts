import { action, computed, makeObservable, observable } from "mobx"
import { listAllChatSession } from "../api"
import { IRootStore } from "./RootStore"

export interface ISessionChats {
  active: boolean
  createdAt: number
  firstMessage: string
  id: string
  pinned: boolean
  sessionName: string
}
export class SessionChatsStore {
  sessionchats: ISessionChats[] = []
  routerId = ""
  questionFollowup = ""
  errorCount: number = 0
  rootStore: IRootStore

  constructor(rootStore: IRootStore) {
    makeObservable(this, {
      routerId: observable,
      sessionchats: observable,
      errorCount: observable,
      questionFollowup: observable,
      fetchSessionChat: action,
      updateSessionChat: action,
      removeChatById: action,
      removeAllChat: action,
      addItem: action,
      editItem: action,
      updateMessagesChat: action,
      reloadChatPinUnpin: action,
      getIdParams: action,
      updateErrorCountNetwork: action,
      changeQuestionFollowup: action,
      idRouter: computed,
      getSessionChat: computed,
      errorCountNetwork: computed,
      getQuestionFollowup: computed,
    })
    this.rootStore = rootStore
  }

  async apiGetChatSession() {
    const userIdLocal = JSON.parse(localStorage.getItem("_user") || "{}")

    const requestGet: any = {
      userId: userIdLocal.userId,
    }
    const result = await listAllChatSession(requestGet)
    return result
  }

  async fetchSessionChat() {
    this.sessionchats = []
    const result = await this.apiGetChatSession()
    this.sessionchats = result?.data ?? []
  }

  async updateSessionChat(chats: ISessionChats[]) {
    this.sessionchats = chats ?? []
  }

  addItem = (newItem: ISessionChats) => {
    this.sessionchats.unshift(newItem)
  }

  editItem = (sessionId: string, sessionName: string) => {
    const existingItem: any = this.sessionchats.map((item: any, index: any) => {
      if (item?.id === sessionId) {
        this.sessionchats[index].sessionName = sessionName
      }
      return item
    })
    this.sessionchats = existingItem
  }

  reloadChatPinUnpin = (chats: any) => {
    this.sessionchats = chats
  }

  removeChatById(sessionId: string) {
    let newState = this.sessionchats.filter(
      (item: any) => item?.id !== sessionId
    )
    this.sessionchats = newState
  }
  removeAllChat() {
    this.sessionchats = []
  }

  updateMessagesChat(sessionId: string, firstMessage: string = "") {
    const existingItem: any = this.sessionchats.map((item: any, index: any) => {
      if (item?.id === sessionId) {
        this.sessionchats[index].firstMessage = firstMessage
      }
      return item
    })
    this.sessionchats = existingItem
  }

  updateErrorCountNetwork(num: number) {
    this.errorCount = num
  }

  changeQuestionFollowup(text: string) {
    this.questionFollowup = text
  }

  async getIdParams(id: string) {
    this.routerId = id ?? ""
  }

  get getSessionChat() {
    return this.sessionchats
  }

  get idRouter() {
    return this.routerId
  }
  get errorCountNetwork() {
    return this.errorCount
  }

  get getQuestionFollowup() {
    return this.questionFollowup
  }
}
