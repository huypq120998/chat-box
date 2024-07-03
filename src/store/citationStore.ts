import { action, computed, makeObservable, observable } from "mobx"
import { IRootStore } from "./RootStore"

export interface ISessionChats {
  active: boolean
  createdAt: number
  firstMessage: string
  id: string
  pinned: boolean
  sessionName: string
}
export class CitationsStore {
  citationLinks: any = []
  rootStore: IRootStore

  constructor(rootStore: IRootStore) {
    makeObservable(this, {
      citationLinks: observable,
      addCitationLinks: action,
      updateCitationLinks: action,
      getCitationLink: computed,
    })
    this.rootStore = rootStore
  }

  addCitationLinks = (instruction: any) => {
    this.citationLinks = instruction
  }

  updateCitationLinks = (instruction: any) => {
    this.citationLinks[instruction.idx] = instruction["_result"]
  }

  get getCitationLink() {
    return this.citationLinks
  }
}
