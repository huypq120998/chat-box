import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react"
import styles from "./ChatWithSubject.module.css"
import Chat from "../chat/Chat"
import { FaTimes } from "react-icons/fa"
import { FaCircleExclamation } from "react-icons/fa6"
import eventBus from "../../plugins/EventBus"
import {
  cloneDeep,
  findIndex,
  forEach,
  isEqual,
  differenceBy,
  find,
} from "lodash"
import { uploadFileApi } from "../../api"
import { Alert, Dropdown, Modal, Button } from "react-bootstrap"
import addChat from "../../assets/thunghiemred.svg"
import chatSvg from "../../assets/Chat.svg"
import groupSvg from "../../assets/Group.svg"
import Delete from "../../assets/delete.svg"
import { BsThreeDotsVertical } from "react-icons/bs"
import axios from "axios"
import {
  getConversationStorage,
  setConversationStorage,
} from "../../utils/conversationExperience"
import { ToastContainer, toast } from "react-toastify"
import { NavbarChatHeader } from "../../components/Chat"

import { confirmAlert } from "react-confirm-alert" // Import
import "react-confirm-alert/src/react-confirm-alert.css"
import { usePrevious } from "../../hooks/usePrevious"
import CloseSidebar from "../../assets/Group.svg"
import { defaultHeader } from "../../utils/localStorage"
import { userTheme } from "../../utils/userTheme"

const ChatWithSubject = ({
  setHeader,
  isConfigPanelOpen,
  setIsConfigPanelOpen,
  messageRequest,
  setMessageRequest,
}: any) => {
  const [showAlert, setShowAlert] = useState(false)
  const [messageAlert, setMessageAlert] = useState("")
  const [conversation, setConversation] = useState([])
  // const [preConversation, setPreConversation] = useState([]);
  const prevConversation: any = usePrevious(conversation)
  const [conversationActive, setConversationActive] = useState(null)
  const firstUpdate = useRef(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showModalError, setShowModalError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteManual, setIsDeleteManual] = useState(false)

  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState("")
  const [notificationVariant, setNotificationVariant] = useState("success")
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight - 290)
  const [intervalInt, setIntervalInt] = useState<any>(null)
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false)
  const [idChatExperience, setIdChatExperience] = useState<string>("")
  const [isBlur, setIsBlur] = useState(false)
  const [displayOpenSidebar, setDisplayOpenSidebar] = useState<boolean>(false)

  useEffect(() => {
    const handleWindowResize = () => {
      setWidth(window.innerWidth), setHeight(window.innerHeight - 290)
    }
    window.addEventListener("resize", handleWindowResize)
    return () => window.removeEventListener("resize", handleWindowResize)
  }, [])
  const isMobile = width <= 1024

  const onOpenNavbarMobileExperience = () => {
    setShowSidebar(true)
  }
  useEffect(() => {
    if (firstUpdate.current) {
      return
    }

    eventBus.on("update-conversation-storage", (data: any) => {
      const conversationTmp = getConversationStorage()
      setConversation(conversationTmp)
    })
    eventBus.on("onOpenNavbarMobileExperience", (data: any) => {
      onOpenNavbarMobileExperience()
    })
    eventBus.on("closeMenuChat", (data: any) => {
      closeSidebar()
    })

    getConversation()

    setHeader(false)
    firstUpdate.current = true
    return () => {}
  }, [])

  useEffect(() => {
    window.onfocus = function () {
      if (isBlur) {
        const url = window.location.href
        if (url && url.endsWith("experience/chat")) {
          getConversation()
        }
      }
      setIsBlur(false)
    }

    window.onblur = function () {
      setIsBlur(true)
    }

    return () => {
      // window.removeEventListener('focus', function () {});
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const conversationList: any = []
      if (prevConversation) {
        forEach(prevConversation, function (preC: any, keyPre: any) {
          if (preC) {
            const idxConversation = findIndex(conversation, ["id", preC.id])
            if (idxConversation < 0) {
              conversationList.push(preC)
            }
          }
        })

        if (
          prevConversation.length === 1 &&
          (!conversation || (conversation && !conversation.length))
        ) {
          conversationList.push(prevConversation[0])
        }

        if (conversationList && conversationList.length && !isDeleteManual) {
          forEach(conversationList, function (item: any, key: any) {
            let fileName = item.document_name
            if (!fileName) {
              fileName = item.file_name
            }
            const notification =
              'Hội thoại "' + fileName + '" đã hết thời gian thử nghiệm'
            notify(notification)
          })
          setIsDeleteManual(false)
        }
      }
    }

    let isDisabled = false
    if (!conversation || (conversation && !conversation.length)) {
      isDisabled = true
    }
    eventBus.dispatch("toggle-disabled-chat", { isDisabled })

    return () => {}
  }, [conversation])

  // const firstUpdateConversation = useRef(false);
  useEffect(() => {
    getConversation()

    // firstUpdateConversation.current = true;
    return () => {
      const sessionInt: any = sessionStorage.getItem("intervalGC")
      if (sessionInt) {
        clearInterval(sessionInt)
      }
    }
  }, [])

  const notify = (e: any) =>
    toast.success(`${e}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    })

  const notifyError = (e: any) =>
    toast.error(`${e}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    })

  const getConversation = async (isInterval = false) => {
    try {
      const userLocal = JSON.parse(localStorage.getItem("_user") || "{}")
      const userId = userLocal?.userId
      const { data } = await axios.post(
        import.meta.env.VITE_BASE_DOMAIN + "/list-temp-conversation",
        {
          user_id: userId,
        },
        {
          headers: {
            ...defaultHeader(),
          },
        }
      )

      let isDeletedConversation = false
      const conversationTmp = await getConversationStorage()
      if (conversationTmp && conversationTmp.length && data && data.length) {
        forEach(conversationTmp, function (item: any, key: any) {
          const indexExist = findIndex(data, ["id", item.id])
          if (indexExist < 0) {
            isDeletedConversation = true
            return false
          }
        })
      }

      if (
        conversationTmp &&
        conversationTmp.length === 1 &&
        (!data || (data && !data.length))
      ) {
        isDeletedConversation = true
      }

      if (isInterval && !isDeletedConversation) {
        return
      }

      let isEmptyConversation = false
      if (data && data.length) {
        data.map((item: any, key: any) => {
          item.active = false
          if (!item.file_name && item.id) {
            item.file_name = item.id
          }
          return item
        })
        forEach(data, function (item, key) {
          if (item.document_name) {
            data[key].document_name = data[key].document_name.trim()
          }

          const _index = findIndex(conversationTmp, ["id", item.id])
          if (_index > -1) {
            if (conversationTmp[_index].conversationText) {
              data[key].conversationText =
                conversationTmp[_index].conversationText
            } else {
              data[key].conversationText =
                "Mời bạn thực hiện hỏi đáp với văn bản"
            }
            if (conversationTmp[_index].answers) {
              data[key].answers = conversationTmp[_index].answers
            }
          } else {
            data[key].conversationText = "Mời bạn thực hiện hỏi đáp với văn bản"
          }
        })

        // check conversation active
        let indexNew = 0
        let idNew = ""
        const indexActive = findIndex(conversationTmp, ["active", true])
        if (indexActive > -1) {
          indexNew = indexActive
          const indexActiveData = findIndex(data, [
            "id",
            conversationTmp[indexActive].id,
          ])
          if (indexActiveData > -1) {
            data[indexActiveData].active = true
            idNew = data[indexActiveData].id
            setConversationActive(data[indexActiveData])
          } else {
            data[0].active = true
            idNew = data[0].id
            setConversationActive(data[0])
          }
        } else {
          data[0].active = true
          idNew = data[0].id
          setConversationActive(data[0])
        }
        setConversation(data)
        sessionStorage.setItem("conversation", JSON.stringify(data))
        eventBus.dispatch("experience-change-conversation", {
          indexOld: -1,
          indexNew: indexNew,
          idOld: "",
          idNew: idNew,
        })
        setTimeout(() => {
          eventBus.dispatch("experience-change-conversation-init-chat", {
            indexOld: -1,
            indexNew: indexNew,
            idOld: "",
            idNew: idNew,
          })
        })
      } else {
        sessionStorage.removeItem("conversation")
        eventBus.dispatch("experience-change-conversation", null)
        eventBus.dispatch("clearChat", null)
        setTimeout(() => {
          eventBus.dispatch("experience-change-conversation-init-chat", null)
        })
        setConversation([])
        isEmptyConversation = true
      }
      setTimeout(() => {
        eventBus.dispatch("empty-conversation", isEmptyConversation)
      })
    } catch (e) {
      console.log(e)
    }
  }
  const onClickConversation = (item: any, idx: any) => {
    // const conversationTmp = cloneDeep(conversation)
    let conversationTmp: any = sessionStorage.getItem("conversation")
    if (conversationTmp && typeof conversationTmp === "string") {
      conversationTmp = JSON.parse(conversationTmp)
    }

    if (conversationTmp) {
      // store conversation
      const indexActiveOld = findIndex(conversationTmp, ["active", true])
      const passData = {
        indexOld: indexActiveOld,
        indexNew: idx,
        idOld: conversationTmp[indexActiveOld]
          ? conversationTmp[indexActiveOld].id
          : null,
        idNew: item.id,
      }

      conversationTmp.map((item: any, key: any) => {
        if (key === idx) {
          item.active = true
        } else {
          item.active = false
        }
        return item
      })
      setConversation(conversationTmp)
      sessionStorage.setItem("conversation", JSON.stringify(conversationTmp))
      setConversationActive(item)

      eventBus.dispatch("experience-change-conversation", passData)
      setTimeout(() => {
        eventBus.dispatch("experience-change-conversation-init-chat", passData)
      })
    }
  }

  const onClickUploadFile = () => {
    const inputFile = document.getElementById("inputFileUpload")
    if (inputFile) {
      inputFile.click()
    }
  }
  const uploadFile = (e: any) => {
    if (e && e.target && e.target.files && e.target.files[0]) {
      if (e.target.files.length > 1) {
        setMessageAlert(
          "Hệ thống chỉ hỗ trợ tải lên 1 tệp tại đây, vui lòng thử lại!"
        )
        setShowAlert(true)
        setShowModalError(true)
        return false
      }
      const file = e.target.files[0]
      handleUploadFile(file)
    }
  }

  // triggers when file is drag
  const handleDrag = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // triggers when file is dropped
  const handleDrop = function (e: any) {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files.length > 1) {
        setMessageAlert(
          "Hệ thống chỉ hỗ trợ tải lên 1 tệp tại đây, vui lòng thử lại!"
        )
        setShowAlert(true)
        setShowModalError(true)
        return false
      }

      const file = e.dataTransfer.files[0]
      handleUploadFile(file)
    }

    return false
  }

  const handleUploadFile = async (file: any) => {
    let extension = ""
    const extensionSupport = [
      "docx",
      "DOCX",
      "doc",
      "DOC",
      "pdf",
      "PDF",
      "txt",
      "TXT",
    ]
    if (file && file.name) {
      extension = file.name.split(".").pop()
      if (extension) {
        extension = extension.toLowerCase()
      }
    }
    // validate file
    if (!extensionSupport.includes(extension) || !extension) {
      setMessageAlert(
        "Hệ thống chỉ hỗ trợ file dạng pdf, .docx, .doc, text, Vui lòng thử lại!"
      )
      setShowModalError(true)
      setShowAlert(true)
      return false
    }

    const fileSize = file.size
    const fileMB = fileSize / 1024 ** 2
    if (fileMB > 10) {
      setMessageAlert("Tệp tải lên quá lớn. Vượt quá kích thước 10MB cho phép!")
      setShowAlert(true)
      setShowModalError(true)
      return false
    }

    // check conversation
    const conversationTmp = getConversationStorage()
    if (
      conversationTmp &&
      conversationTmp.length &&
      conversationTmp.length > 4
    ) {
      setMessageAlert(
        "Hệ thống cho phép hỏi đáp tối đa 5 hội thoại, bạn vui lòng loại bỏ một số hội thoại để tiếp tục"
      )
      setShowAlert(true)
      setShowModalError(true)
      return false
    }

    // check 1 file upload
    if (isLoading) {
      setMessageAlert("Hệ thống chỉ hỗ trợ tải lên 1 tệp tại đây")
      setShowAlert(true)
      setShowModalError(true)
      return false
    }

    // upload file
    try {
      setIsLoading(true)

      const userLocal = JSON.parse(localStorage.getItem("_user") || "{}")
      const userId = userLocal?.userId

      uploadFileApi({ file, userId })
        .then((result) => {
          if (result && result._id) {
            try {
              axios
                .post(
                  import.meta.env.VITE_BASE_DOMAIN +
                    "/indexing-temp-conversation",
                  {
                    id: result._id,
                  },
                  {
                    headers: {
                      ...defaultHeader(),
                    },
                  }
                )
                .then((result) => {
                  // setIsLoading(false);
                  // notify("Tải lên thành công")
                  // getConversation();
                })
                .catch((e: any) => {
                  console.log("ee", e)

                  setIsLoading(false)
                  let error = "Tải lên thất bại"
                  if (
                    e &&
                    e.response &&
                    e.response.data &&
                    e.response.data.error
                  ) {
                    error = e.response.data.error
                  }
                  notifyError(error)
                })
                .finally(() => {
                  // setIsLoading(false);
                })

              const interval = setInterval(async () => {
                const { data } = await axios.post(
                  import.meta.env.VITE_BASE_DOMAIN + "/temp-conversation",
                  {
                    id: result._id,
                  },
                  {
                    headers: {
                      ...defaultHeader(),
                    },
                  }
                )
                if (data) {
                  switch (data.status) {
                    case "UPLOADING":
                      break
                    case "PARSING":
                      break
                    case "INDEXING":
                      break
                    case "DONE":
                      setIsLoading(false)
                      notify("Tải lên thành công")
                      getConversation()
                      clearInterval(interval)
                      break
                  }
                }
              }, 2000)
            } catch (e) {
              setIsLoading(false)
              // notifyError("Tải lên thành công")
            }
          }

          setMessageAlert("")
          setShowAlert(false)
        })
        .catch((e: any) => {
          setIsLoading(false)
          let error = "Tải lên thất bại"
          if (e && e.response && e.response.data && e.response.data.error) {
            error = e.response.data.error
          }
          notifyError(error)
        })
    } catch (e: any) {
      setIsLoading(false)
      let error = "Tải lên thất bại"
      if (e && e.response && e.response.data && e.response.data.error) {
        error = e.response.data.error
      }
      notifyError(error)
    }
  }

  const pinConversation = async (item: any) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_BASE_DOMAIN + "/pin-temp-conversation",
        {
          id: item.id,
          pin: true,
        },
        {
          headers: {
            ...defaultHeader(),
          },
        }
      )
      if (data) {
        getConversation()
      }
    } catch (e) {
      console.log(e)
    }
  }

  const handleActionDelete = async () => {
    try {
      setIsDeleteManual(true)
      const { data } = await axios.post(
        import.meta.env.VITE_BASE_DOMAIN + "/delete-temp-conversation",
        {
          id: idChatExperience,
        },
        {
          headers: {
            ...defaultHeader(),
          },
        }
      )
      if (data) {
        getConversation()
        setShowDeletePopup(false)
      }
    } catch (e) {
      console.log(e)
    }
  }
  const deleteConversation = async (item: any) => {
    setShowDeletePopup(true)
    setIdChatExperience(item?.id || "")
  }
  const onCloseNotification = (e: any) => {
    setShowNotification(false)
    e.preventDefault()
    e.stopPropagation()
    console.log(e)
    return false
  }
  const onCloseTabpanels = () => {}
  const closeSidebar = () => {
    setDisplayOpenSidebar(true)
    const temp = document.querySelector("#historyContainerSubject")
    temp?.classList.add("historyContainerClose")
  }
  const openSidebar = () => {
    eventBus.dispatch("closeAnalysisPanel", {})
    const temp = document.querySelector("#historyContainerSubject")
    temp?.classList.remove("historyContainerClose")
    setDisplayOpenSidebar(false)
  }
  return (
    <>
      <div
        className={`chat-with-subject-container ${styles.chatWithSubjectContainer}`}
        style={{ position: "relative" }}
      >
        {displayOpenSidebar && (
          <div
            className=""
            style={{
              position: "absolute",
              left: "30px",
              top: "20px",
              cursor: "pointer",
              transform: "rotate(180deg)",
              zIndex: 99,
            }}
            onClick={openSidebar}
          >
            <img src={CloseSidebar} />
          </div>
        )}
        <div
          className={`${styles.chatSideBar} ${
            showSidebar ? styles.chatSideBarActive : styles.chatSideBarHide
          }`}
          id="historyContainerSubject"
        >
          <div
            className={styles.chatSideBarOverlay}
            onClick={() => {
              setShowSidebar(!showSidebar), onCloseTabpanels()
            }}
          ></div>
          <div
            className={`${styles.chatSideBarContent} ${
              isMobile ? styles.historyContainerMobile : styles.historyContainer
            }`}
          >
            <div className="">
              <NavbarChatHeader onCloseNavbar={() => setShowSidebar(false)} />
            </div>
            <div
              className={styles.sideBarNewChatBox}
              onClick={onClickUploadFile}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="inputFileUpload"
                onChange={uploadFile}
                type="file"
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.odt,.odp,.txt,.rtf,.html,.htm"
              />

              <div
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  display: "inline-flex",
                }}
              >
                <div style={{ width: 24, height: 24, position: "relative" }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      left: 2,
                      top: 2,
                      position: "absolute",
                    }}
                  >
                    <img
                      src={userTheme().addchat}
                      alt=""
                      style={{ color: "#3DBFFE" }}
                    />
                  </div>
                </div>
                <div
                  className={styles.titleNewChatText}
                  style={{
                    fontWeight: "500",
                    wordWrap: "break-word",
                    color: userTheme().color_bg,
                  }}
                >
                  Thêm mới trò chuyện
                </div>
                <div
                  className={styles.closeSidebar}
                  onClick={(e) => {
                    setShowSidebar(false)
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <FaTimes />
                </div>
              </div>

              {/*<div className={styles.newChatText}><FaPlus style={{marginRight: "0.5rem"}}/> Thêm mới trò chuyện</div>*/}
              <div
                style={{
                  color: "#a5acb8",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                Chọn hoặc kéo thả file tại đây
              </div>
              {isLoading && (
                <div className={styles.loading} title="Đang tải..."></div>
              )}

              {showNotification && (
                <div
                  className={` mt-3`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "100%" }}
                >
                  <Alert
                    className={styles.uploadNotification}
                    variant={notificationVariant}
                    onClose={onCloseNotification}
                    dismissible
                  >
                    {/*<Alert.Heading>Oh snap! You got an error!</Alert.Heading>*/}
                    <p className={`mb-0`} style={{ fontSize: "0.875rem" }}>
                      Tải lên thành công
                    </p>
                  </Alert>
                </div>
              )}
            </div>
            <div className={styles.sideBarSubjectList}>
              {conversation &&
                conversation.map((chat: any, idx: any) => {
                  return (
                    <div
                      className={`${styles.sideBarSubjectItem} ${
                        chat.active ? styles.sideBarSubjectItemActive : ""
                      }`}
                      key={idx}
                      onClick={() => onClickConversation(chat, idx)}
                    >
                      {/*<span style={{marginRight: "0.5rem"}}><FaRegCommentDots/></span>*/}
                      {/*<span className={styles.sideBarSubjectItemText} title={item.file_name}>{item.file_name}</span>*/}

                      <div
                        key={idx}
                        className={`${styles.conversationsContainer}`}
                        style={{ position: "relative" }}
                      >
                        <div
                          className={`${styles.conversation} ${
                            chat.active ? styles.conversationActive : ""
                          }`}
                          style={{ height: "64px" }}
                        >
                          <div className={`${styles.iconContainer}`}>
                            <img
                              src={chatSvg}
                              alt=""
                              style={{ color: "#3DBFFE" }}
                            />
                          </div>
                          <div className="" style={{ position: "relative" }}>
                            <div
                              className=""
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "230px",
                              }}
                            >
                              {chat.document_name ? (
                                <span
                                  title={chat.document_name}
                                  className={`${styles.conversationTittle} ${styles.conversationMessages}`}
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    wordWrap: "break-word",
                                    color: chat.active
                                      ? userTheme().color_text
                                      : "",
                                  }}
                                >
                                  {chat.document_name}
                                </span>
                              ) : (
                                <span
                                  title={chat.file_name}
                                  className={`${styles.conversationTittle} ${styles.conversationMessages}`}
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    wordWrap: "break-word",
                                    color: chat.active
                                      ? userTheme().color_text
                                      : "",
                                  }}
                                >
                                  {chat.file_name}
                                </span>
                              )}
                              <div
                                style={{
                                  color: "#A5ACB8",
                                  fontSize: "13px",
                                  fontWeight: "400",
                                  wordWrap: "break-word",
                                }}
                              >
                                {chat.created_at}
                              </div>
                            </div>
                            {chat &&
                            chat.answers &&
                            chat.answers[0] &&
                            chat.answers[0] &&
                            chat.answers[0][0] ? (
                              <span
                                title={chat?.answers[0]?.[0]}
                                className={`${styles.conversationTittle} ${styles.conversationMessages}`}
                                style={{
                                  left: 0,
                                  top: "30px",
                                  position: "absolute",
                                  width: "225px",
                                  color: chat.active
                                    ? "var(--color-answer)"
                                    : "#a5acb8",
                                  fontSize: 14,
                                  fontWeight: "500",
                                  wordWrap: "break-word",
                                }}
                              >
                                {chat?.answers[0]?.[0]}
                                {/*{chat.conversationText}*/}
                              </span>
                            ) : (
                              <span
                                title={chat.conversationText}
                                className={`${styles.conversationTittle} ${styles.conversationMessages}`}
                                style={{
                                  left: 0,
                                  top: "30px",
                                  position: "absolute",
                                  width: "225px",
                                  color: chat.active
                                    ? "var(--color-answer)"
                                    : "#a5acb8",
                                  fontSize: 14,
                                  fontWeight: "500",
                                  wordWrap: "break-word",
                                }}
                              >
                                {chat.conversationText}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.conversationActionMore}>
                          <Dropdown drop="end">
                            <Dropdown.Toggle
                              variant="success"
                              className={styles.dropdownDot}
                            >
                              <BsThreeDotsVertical
                                className=""
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  color: "#222",
                                }}
                              />
                            </Dropdown.Toggle>

                            <Dropdown.Menu
                              style={{ zIndex: "999999" }}
                              popperConfig={{ strategy: "fixed" }}
                              renderOnMount
                            >
                              {/*<Dropdown.Item onClick={() => pinConversation(chat)}>*/}
                              {/*    <div className="">*/}

                              {/*        <img src={Pin} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} />  Ghim*/}
                              {/*    </div>*/}
                              {/*</Dropdown.Item>*/}
                              {/*<Dropdown.Item>*/}
                              {/*    <div className="" style={{ display: 'flex', alignItems: 'center' }}>*/}

                              {/*        <img src={Edit} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} /> Đổi tên*/}
                              {/*    </div>*/}
                              {/*</Dropdown.Item>*/}
                              {/*<Dropdown.Divider />*/}
                              <Dropdown.Item
                                onClick={() => deleteConversation(chat)}
                              >
                                <div
                                  className=""
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <img
                                    src={Delete}
                                    alt=""
                                    style={{
                                      color: "#3DBFFE",
                                      marginRight: "8px",
                                    }}
                                  />{" "}
                                  Xóa
                                </div>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        <div
          className={`${styles.chatContainer} ${
            !conversation || (conversation && !conversation.length)
              ? "disabled-question-chat"
              : ""
          }`}
        >
          {/*<div className={styles.chatContainerOverlay}></div>*/}

          <div
            className={`${styles.chatIconToggle} ${
              showSidebar ? styles.iconSidebarActive : styles.iconSidebarHide
            }`}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <img src={groupSvg} alt="" />
          </div>
          <Chat
            setHeader={(val: any) => {}}
            messageRequest={messageRequest}
            setMessageRequest={setMessageRequest}
            isConfigPanelOpen={isConfigPanelOpen}
            setIsConfigPanelOpen={setIsConfigPanelOpen}
          />
        </div>
      </div>

      <Modal show={showModalError} onHide={() => setShowModalError(false)}>
        <Modal.Header closeButton style={{ background: "#ebebeb" }}>
          <Modal.Title>
            <span style={{ fontWeight: "bold" }}>Thông báo</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: "flex" }}>
            <span
              style={{
                color: "#e6a23c",
                fontSize: "24px",
                marginRight: "0.5rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaCircleExclamation />
            </span>
            <span>{messageAlert}</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModalError(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showDeletePopup}
        onHide={() => setShowDeletePopup(false)}
        dialogClassName="modal-90w"
        centered
        aria-labelledby="contained-modal-title-center"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Bạn muốn xoá cuộc trò chuyện này?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <p>
              Bạn sẽ không còn nhìn thấy cuộc trò chuyện này ở đây nữa. Thao tác
              này cũng sẽ xóa các hoạt động liên quan, chẳng hạn như câu trả lời
              và ý kiến phản hồi.
            </p>
          </>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={"light"} onClick={() => setShowDeletePopup(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleActionDelete}
            style={{
              backgroundColor: userTheme().color_bg,
              borderColor: userTheme().color_bg,
            }}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ToastContainer />

      {/*<div className={styles.toastContainer}>*/}
      {/*    <Toast show={showToast}>*/}
      {/*        <Toast.Header>*/}
      {/*            <strong className="me-auto">Bootstrap</strong>*/}
      {/*            <small>11 mins ago</small>*/}
      {/*        </Toast.Header>*/}
      {/*        <Toast.Body>Hello, world! This is a toast message.</Toast.Body>*/}
      {/*    </Toast>*/}
      {/*</div>*/}
    </>
  )
}

export default ChatWithSubject
