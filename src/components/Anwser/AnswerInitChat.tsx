import { useEffect, useRef, useState } from "react"
import { Stack } from "@fluentui/react"
import styles from "./Answer.module.css"
import { AnswerIcon } from "./AnswerIcon"
import DownIcon from "../../assets/down-arrow.png"
import { getConversationStorage } from "../../utils/conversationExperience"
import eventBus from "../../plugins/EventBus"
import { findIndex } from "lodash"

interface Props {
  onFollowupQuestionClicked?: (question: string) => void
  getDefaultQuestion: any
  getDefaultIntro: any
}

export const AnswerInitChat = ({
  onFollowupQuestionClicked,
  getDefaultQuestion,
  getDefaultIntro,
}: Props) => {
  const [displayInitQuestion, setDisplayInitQuestion] = useState<boolean>(true)
  const [style, setStyle] = useState({
    width: "12px",
    height: "12px",
    marginLeft: "6px",
    cursor: "pointer",
    transform: "rotate(180deg)",
  })
  const [questionInit, setQuestionInit] = useState([])

  const [isExperienceChat, setIsExperienceChat] = useState<boolean>(false)
  const [conversationExperienceActive, setConversationExperienceActive] =
    useState<any>(null)
  const [conversationActiveName, setConversationActiveName] =
    useState<string>("")
  const [isEmptyConversation, setIsEmptyConversation] = useState<boolean>(false)

  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleWindowResize)
    return () => window.removeEventListener("resize", handleWindowResize)
  }, [])
  const isMobile = width <= 600
  useEffect(() => {
    setStyle((prev) => ({
      ...prev,
      transform: `${displayInitQuestion ? "rotate(180deg)" : ""}`,
    }))
  }, [displayInitQuestion])

  const firstUpdate = useRef(false)
  useEffect(() => {
    if (firstUpdate.current) {
      return
    }

    const url = window.location.href
    if (url && url.endsWith("experience/chat")) {
      setIsExperienceChat(true)
    }

    eventBus.on(
      "experience-change-conversation-init-chat",
      async (data: any) => {
        if (data) {
          const conversationTmp = await getConversationStorage()

          if (data && data.idOld) {
            const indexOldTmp = findIndex(conversationTmp, ["id", data.idOld])
            if (indexOldTmp > -1) {
              data.indexOld = indexOldTmp
            }
          }

          if (data && data.idNew) {
            const indexNewTmp = findIndex(conversationTmp, ["id", data.idNew])
            if (indexNewTmp > -1) {
              data.indexNew = indexNewTmp
            }
          }

          if (conversationTmp) {
            const conversationActive = conversationTmp[data.indexNew] || null
            if (conversationActive) {
              conversationActive.conversationName =
                conversationActive.document_name
                  ? conversationActive.document_name
                  : conversationActive.file_name
              setConversationExperienceActive(conversationActive)
              setConversationActiveName(conversationActive.conversationName)
            }
          }
        } else {
          setConversationExperienceActive(null)
          setConversationActiveName("")
        }
      }
    )

    eventBus.on("empty-conversation", (data: any) => {
      setIsEmptyConversation(data)
    })

    firstUpdate.current = true
    return () => {}
  }, [])
  useEffect(() => {
    if (getDefaultQuestion && getDefaultQuestion.data) {
      setQuestionInit(getDefaultQuestion.data)
    }
  }, [getDefaultQuestion])
  return (
    <>
      {isExperienceChat ? (
        <Stack>
          {conversationActiveName && (
            <Stack.Item>
              <Stack
                className={`${styles.answerContainer}`}
                verticalAlign="space-between"
              >
                <Stack.Item>
                  <Stack horizontal horizontalAlign="space-between">
                    <div
                      className=""
                      style={{ borderRadius: "50%", padding: "2px" }}
                    >
                      <AnswerIcon />
                    </div>
                  </Stack>
                </Stack.Item>

                <Stack.Item grow>
                  {conversationActiveName && (
                    <div className={styles.answerText}>
                      Mời bạn thực hiện hỏi đáp với "{conversationActiveName}".
                    </div>
                  )}
                </Stack.Item>
              </Stack>
            </Stack.Item>
          )}

          {isEmptyConversation && (
            <Stack.Item>
              <Stack
                className={`${styles.answerContainer}`}
                verticalAlign="space-between"
              >
                <Stack.Item>
                  <Stack horizontal horizontalAlign="space-between">
                    <div
                      className=""
                      style={{ borderRadius: "50%", padding: "2px" }}
                    >
                      <AnswerIcon />
                    </div>
                  </Stack>
                </Stack.Item>

                <Stack.Item grow>
                  <div className={styles.answerText}>
                    Thêm mới trò chuyện ngay để sử dụng tính năng này
                  </div>
                </Stack.Item>
              </Stack>
            </Stack.Item>
          )}
        </Stack>
      ) : (
        <Stack>
          <Stack.Item>
            <Stack
              className={`${styles.answerContainer}`}
              verticalAlign="space-between"
            >
              <Stack.Item>
                <Stack horizontal horizontalAlign="space-between">
                  <div
                    className=""
                    style={{ borderRadius: "50%", padding: "2px" }}
                  >
                    <AnswerIcon />
                  </div>
                </Stack>
              </Stack.Item>

              <Stack.Item grow>
                <div className={styles.answerText}>
                  {getDefaultIntro
                    ? getDefaultIntro
                    : "Tôi là Trợ lý ảo, một người đồng hành đáng tin cậy trong công việc của bạn. Mặc dù tôi có những giới hạn kiến thức, nhưng tôi cam kết cố gắng hết sức để hỗ trợ bạn một cách tốt nhất."}
                </div>
              </Stack.Item>
            </Stack>
          </Stack.Item>

          <Stack.Item grow>
            <Stack className={``} verticalAlign="space-between">
              <Stack.Item>
                <div className={`${styles.answerInitQuestion}`}>
                  Hỏi bất cứ điều gì hoặc thử một ví dụ liên quan các thông tin
                  sau:
                  <img
                    src={DownIcon}
                    style={style}
                    onClick={() => {
                      setDisplayInitQuestion(!displayInitQuestion)
                    }}
                  />
                </div>
              </Stack.Item>

              <Stack.Item grow>
                <div className={`${styles.boxQuestionInit}`}>
                  {questionInit.length &&
                  displayInitQuestion &&
                  onFollowupQuestionClicked
                    ? questionInit.map((question: string, index: any) => (
                        <div
                          key={index}
                          className={`${styles.questionInit} ${
                            isMobile ? styles.questionInitMobile : ""
                          }`}
                          onClick={() => onFollowupQuestionClicked(question)}
                        >
                          {question}
                        </div>
                      ))
                    : null}
                </div>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
      )}
    </>
  )
}
