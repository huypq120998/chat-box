import { useMemo, forwardRef, useState, useEffect, useRef } from "react"
import { Stack, IconButton, TextField } from "@fluentui/react"
import { cloneDeep, find } from "lodash"
import { observer } from "mobx-react-lite"
import styles from "./ChatWithHistory.module.css"
import plus from "../../assets/plus.png"
import { BsChatLeft, BsThreeDotsVertical } from "react-icons/bs"
import { AiOutlinePushpin } from "react-icons/ai"

import { SplitButton, Dropdown, Modal, Button } from "react-bootstrap"
import { ChatHistory } from "../../components/Chat/ChatHistory"
import Chat from "../chat/Chat"
import { listAllChatSession } from "../../api"
import Drawer from "react-modern-drawer"
import "react-modern-drawer/dist/index.css"
import eventBus from "../../plugins/EventBus"
import CloseSidebar from "../../assets/Group.svg"
import { useRedirectChat } from "../../hooks/useRedirectChat"
import { useParams } from "react-router-dom"
import { useStore } from "../../hooks/useStore"

export const ChatWithHistory = observer(
  ({
    showHeader,
    setHeader,
    isConfigPanelOpen,
    setIsConfigPanelOpen,
    messageRequest,
    setMessageRequest,
  }: any) => {
    const {
      rootStore: { sessionChatsStore, citationsStore },
    } = useStore()
    const { navigate } = useRedirectChat()
    const params = useParams()

    const [chatSessionList, setChatSessionList] = useState<any>([])
    const [allChatBySessionName, setAllChatBySessionName] = useState<any>([])
    const [idChatBySessionName, setIdChatBySessionName] = useState<string>("")
    const [isDisableNewchatButton, setIsDisableNewchatButton] =
      useState<boolean>(true)
    const [width, setWidth] = useState(window.innerWidth)
    const [height, setHeight] = useState(window.innerHeight - 290)
    useEffect(() => {
      const handleWindowResize = () => {
        setWidth(window.innerWidth), setHeight(window.innerHeight - 290)
      }
      window.addEventListener("resize", handleWindowResize)
      return () => window.removeEventListener("resize", handleWindowResize)
    }, [])
    const isMobile = width <= 1024
    const [isOpen, setIsOpen] = useState(false)
    const toggleDrawer = () => {
      setIsOpen((prevState) => !prevState)
      if (isMobile) {
        const temp = document.querySelector("#historyContainer")
        temp?.classList.remove("historyContainerClose")
      }
    }
    const onOpenNavbarMobile = () => {
      setIsOpen(true)
    }
    const onCloseNavbarMobile = () => {
      setIsOpen(false)
    }
    useEffect(() => {
      if (params.id) {
        getActiveChat()
      }
    }, [params.id])

    const getActiveChat = () => {
      const chatId = params && params.id ? params.id : ""
      sessionChatsStore.getIdParams(chatId)
      const conversationTmp = cloneDeep(sessionChatsStore.getSessionChat)
      conversationTmp.map((item: any, key: any) => {
        if (chatId === item.id) {
          item.active = true
        } else {
          item.active = false
        }
        return item
      })
      setChatSessionList(conversationTmp)
    }

    useEffect(() => {
      if (
        sessionChatsStore.getSessionChat &&
        sessionChatsStore.getSessionChat.length
      ) {
        getActiveChat()
      } else {
        setChatSessionList(sessionChatsStore.getSessionChat)
      }
    }, [sessionChatsStore.getSessionChat])

    const chatBySession = async (chat: any, idx: any, e: any) => {
      navigate(chat?.id ?? "")
      getActiveChat()
      if (e.target.classList.value === "xxxxx") return
      setIdChatBySessionName(chat?.id || "")
      setIsOpen(false)
    }

    useEffect(() => {
      setHeader(false)
      async function fetchMyAPI() {
        await sessionChatsStore.fetchSessionChat()
      }
      fetchMyAPI()
    }, [])
    const apiGetChatSession = async () => {
      const userIdLocal = JSON.parse(localStorage.getItem("_user") || "{}")

      const requestGet: any = {
        userId: userIdLocal.userId,
      }
      const result = await listAllChatSession(requestGet)
      return result
    }
    const activeChat = async () => {
      const result = await apiGetChatSession()
      const conversationTmp = cloneDeep(result.data)
      conversationTmp?.map((item: any, key: any) => {
        if (key === 0) {
          item.active = true
        } else {
          item.active = false
        }
        return item
      })
      setChatSessionList(conversationTmp)
    }
    const reloadData = async () => {
      const result = await apiGetChatSession()
      setChatSessionList(result.data)
    }
    const clearAllSessionChat = () => {
      sessionChatsStore.removeAllChat()
      setChatSessionList(sessionChatsStore.getSessionChat)
    }

    const firstUpdate = useRef(false)
    useEffect(() => {
      if (firstUpdate.current) {
        return
      }
      eventBus.on("reloadChatPinUnpin", (data: any) => {
        reloadChatPinUnpin(data)
      })
      eventBus.on("clearchatNavbar", (data: any) => {
        clearchatNavbar(data)
      })
      eventBus.on("reloadMessageChat", (data: any) => {
        reloadMessageChat(data)
      })
      eventBus.on("onOpenNavbarMobile", (data: any) => {
        onOpenNavbarMobile()
      })
      eventBus.on("reloadChatByClearAll", (data: any) => {
        clearAllSessionChat()
      })
      eventBus.on("closeNavbar", (data: any) => {
        onCloseNavbarMobile()
      })
      if (chatSessionList && chatSessionList.length) {
        eventBus.dispatch("onReloadShowIcon", {})
      } else {
        eventBus.dispatch("onReloadShowIconFalse", {})
      }
      // citationsStore.addCitationLinks([])
      return () => {}
    }, [chatSessionList])

    const clearchatNavbar = (data: any) => {
      sessionChatsStore.updateMessagesChat(data.id, "")
    }
    const reloadMessageChat = (data: any) => {
      sessionChatsStore.updateMessagesChat(data.id, data.firstMessage)
    }

    const reloadChatPinUnpin = (data: any) => {
      const conversationTmp = cloneDeep(chatSessionList)
      conversationTmp.map((item: any, key: any) => {
        if (item.id === data.id) {
          item.pinned = data.pinned
        }
        return item
      })
      // setChatSessionList(conversationTmp);
      sessionChatsStore.reloadChatPinUnpin(conversationTmp)
    }
    return (
      <div className={styles.allContainerChat}>
        <>
          {!isMobile ? (
            <ChatHistory
              setIsOpen={() => setIsOpen(false)}
              height={height}
              setIdChatBySessionName={setIdChatBySessionName}
              reloadChatPinUnpin={reloadChatPinUnpin}
              isMobile={isMobile}
              setChatSessionList={setChatSessionList}
              isDisableNewchatButton={isDisableNewchatButton}
              chatBySession={chatBySession}
              chatSessionList={chatSessionList}
              reloadData={reloadData}
            />
          ) : (
            <>
              <div
                className={`${isMobile ? styles.iconOpenChatMobile : ""}`}
                style={{
                  cursor: "pointer",
                  transform: "rotate(180deg)",
                  height: "50px",
                  marginInlineStart: "12px",
                }}
                onClick={toggleDrawer}
              >
                <img src={CloseSidebar} />
              </div>
              <Drawer
                open={isOpen}
                onClose={toggleDrawer}
                direction="left"
                className="bla bla bla"
                size={"336px"}
              >
                <div>
                  <ChatHistory
                    setIsOpen={() => setIsOpen(false)}
                    height={height + 150}
                    setIdChatBySessionName={setIdChatBySessionName}
                    reloadChatPinUnpin={reloadChatPinUnpin}
                    setChatSessionList={setChatSessionList}
                    isMobile={isMobile}
                    isDisableNewchatButton={isDisableNewchatButton}
                    chatBySession={chatBySession}
                    chatSessionList={chatSessionList}
                    reloadData={reloadData}
                  />
                </div>
              </Drawer>
            </>
          )}
        </>
        <Chat
          setHeader={(val: any) => setHeader(val)}
          reloadData={reloadData}
          idChatBySessionName={idChatBySessionName}
          setIsDisableNewchatButton={setIsDisableNewchatButton}
          allChatBySessionName={allChatBySessionName}
          setChatSessionList={setChatSessionList}
          chatSessionList={chatSessionList}
          messageRequest={messageRequest}
          setMessageRequest={setMessageRequest}
          isConfigPanelOpen={isConfigPanelOpen}
          setIsConfigPanelOpen={setIsConfigPanelOpen}
          activeChat={activeChat}
          setIdChatBySessionName={setIdChatBySessionName}
        />
      </div>
    )
  }
)
