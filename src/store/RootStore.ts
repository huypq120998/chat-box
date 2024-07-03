import { SessionChatsStore } from "./sessionChatsStore"
import { CitationsStore } from "./citationStore"

export interface IRootStore {
  sessionChatsStore: SessionChatsStore
  citationsStore: CitationsStore
}

export class RootStore implements IRootStore {
  sessionChatsStore: SessionChatsStore
  citationsStore: CitationsStore

  constructor() {
    this.sessionChatsStore = new SessionChatsStore(this)
    this.citationsStore = new CitationsStore(this)
  }
}
