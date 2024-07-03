import { useRef, useState, useEffect, useMemo } from "react"
import {
  Checkbox,
  Panel,
  DefaultButton,
  TextField,
  SpinButton,
  Label,
  PrimaryButton,
  Button,
  DialogFooter,
  Dialog,
  Dropdown,
} from "@fluentui/react"
import backPng from "../../assets/back.png"
import seeMore from "../../assets/icon-info-black.svg"
import { Form, FormCheck } from "react-bootstrap"
import { findIndex, isArray, forEach, find, uniqBy } from "lodash"
// import { Approaches, AskResponsePrompt } from "../../api/models"
import styles from "./Chat.module.css"
import {
  chatApi,
  chatApiVtccFlow,
  clearMessagesInChatSession,
  Approaches,
  AskResponse,
  addChatMessages,
  ChatRequest,
  createChatSession,
  initDefaultChat,
  listAllChatSession,
  ChatTurn,
  EditPrompt,
  setDefaultPrompt,
  getPrompt,
  PromptRequest,
  citationsCompareApi,
  citationsApi,
  CitationsRequest,
  getDefaultQuestion,
  chatSessionById,
  getConfiguration,
  AskResponsePrompt,
} from "../../api"
// import {
//   Answer,
//   AnswerError,
//   AnswerLoading,
//   AnswerInitChat,
// } from "../../components/Anwser"
// import { QuestionInput } from "../../components/QuestionInput"
// import { UserChatMessage } from "../../components/UserChatMessage"
// import {
//   AnalysisPanel,
//   AnalysisPanelTabs,
// } from "../../components/AnalysisPanel"
// import { SettingsButton } from "../../components/SettingsButton"
// import { ClearChatButton } from "../../components/ClearChatButton"
import eventBus from "../../plugins/EventBus"
import { ToastContainer, toast } from "react-toastify"
import { Tooltip as ReactTooltip } from "react-tooltip"
import "react-toastify/dist/ReactToastify.css"
import "react-tooltip/dist/react-tooltip.css"
import {
  getConversationStorage,
  setConversationStorage,
} from "../../utils/conversationExperience"
import { useViewport } from "../../hooks/useViewport"
// import { ConfirmClearChatPopup } from "../../components/Chat"
// import { CreatePrompt, DropDownPrompt, Password } from "../../components/Prompt"
// import { CloseDebug } from "../../components/CloseDebug"
// import { QuestionInit } from "../../components/Configuration/QuestionInit"
// import { WhitelistInit } from "../../components/Configuration/WhitelistInit"
import { useNavigate, useParams } from "react-router-dom"
import { checkIsExperience } from "../../utils/checkIsExperience"
import { openWindowToUrl } from "../../utils/openWindowUrl"
import { useStore } from "../../hooks/useStore"
import { isShowConfiguration } from "../../utils/isShowConfiguration"
import { checkBoxStyles } from "../../utils/checkBoxStyles"
import { defaultConfiguration } from "../../utils/defaultConfiguration"
import {
  DEFAULT_MODEL_VERSION,
  HYBRID_SEARCH,
  MODEL_VERSIONS,
  SEMANTIC_SEARCH,
} from "../../utils/constants"
import { userTheme } from "../../utils/userTheme"
import {
  ERROR_COUNT_MAX,
  errorChatResult,
  ERROR_DEFAULT,
  ERROR_NETWORK_MAX,
} from "../../utils/errorChatResult"
import { AnalysisPanelTabs } from "../../components/AnalysisPanel/AnalysisPanelTabs"
import { UserChatMessage } from "../../components/UserChatMessage/UserChatMessage"
import { ClearChatButton } from "../../components/ClearChatButton/ClearChatButton"
import { ConfirmClearChatPopup } from "../../components/Chat/ConfirmClearChatPopup"
import { SettingsButton } from "../../components/SettingsButton/SettingsButton"
import { AnalysisPanel } from "../../components/AnalysisPanel/AnalysisPanel"
import { QuestionInput } from "../../components/QuestionInput/QuestionInput"
import { CloseDebug } from "../../components/CloseDebug/CloseDebug"
import { DropDownPrompt } from "../../components/Prompt/DropDownPrompt"
import { AnswerInitChat } from "../../components/Anwser/AnswerInitChat"
import { Answer } from "../../components/Anwser/Answer"
import { AnswerLoading } from "../../components/Anwser/AnswerLoading"
import { AnswerError } from "../../components/Anwser/AnswerError"

const Chat = ({
  messageRequest,
  setMessageRequest,
  idChatBySessionName,
}: any) => {
  const {
    rootStore: { sessionChatsStore, citationsStore },
  } = useStore()
  const params = useParams()
  const navigate = useNavigate()
  const viewPort = useViewport()
  const isMobile = viewPort.width <= 768

  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false)
  const [vtccFlow, setVtccFlow] = useState<boolean>(false)
  const [openPrompt, setOpenPrompt] = useState(false)
  const [openWhitelist, setOpenWhitelist] = useState(false)
  const [openQuestionInit, setOpenQuestionInit] = useState(false)

  const [promptTemplate, setPromptTemplate] = useState<string>("")
  const [temperature, setTemperature] = useState<number>(0.2)
  const [temperatureGenQuery, setTemperatureGenQuery] = useState<number>(0)
  // const [searchSource, setSearchSource] = useState<string>("azure")
  const [typeFullTextSearch, setTypeFullTextSearch] =
    useState<string>(SEMANTIC_SEARCH)
  const [searchSource, setSearchSource] = useState<string>("VTCC")

  // const [versionSearch, setVersionSearch] = useState<string>("gpt-35-turbo")
  const [retrieveCount, setRetrieveCount] = useState<number>(5)
  const [attachHistoryCount, setAttachHistoryCount] = useState<number>(1)
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(false)
  const [autoClearChat, setAutoClearChat] = useState<boolean>(false)
  const [isStreaming, setIsStreaming] = useState<boolean>(true)
  const [showTextGen, setShowTextGen] = useState<boolean>(true)
  const [retrievalMode, setRetrievalMode] = useState<string>("text")
  const [largeLanguageModel, setLargeLanguageModel] = useState<string>(
    DEFAULT_MODEL_VERSION
  )
  const [llmGenQuery, setLlmGenQuery] = useState<string>(DEFAULT_MODEL_VERSION)
  const [noPrompt, setNoPrompt] = useState<boolean>(false)
  const [noQueryGeneration, setNoQueryGeneration] = useState<boolean>(false)
  const [noSearchEngine, setNoSearchEngine] = useState<boolean>(false)
  const [isRerankRetrieve, setIsRerankRetrieve] = useState<boolean>(false)
  const [useWhitelist, setUseWhitelist] = useState<boolean>(true)
  const [googleSeo, setGoogleSeo] = useState<boolean>(false)

  const [segmentRuleSearch, setSegmentRuleSearch] = useState<boolean>(true)
  const [nerRuleSearch, setNerRuleSearch] = useState<boolean>(true)
  const [semanticRuleSearch, setSemanticRuleSearch] = useState<boolean>(true)
  const [configuration, setConfiguration] = useState<any>(
    defaultConfiguration()
  )

  // Play voice
  const [isPlayVoive, setIsPlayVoive] = useState<any>({
    status: false,
    config: false,
  })

  const [promptArr, setPromptArr] = useState<AskResponsePrompt[]>([])
  const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false)
  const [excludeCategory, setExcludeCategory] = useState<string>("")
  const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] =
    useState<boolean>(false)
  const [disabledSwitchButton, setDisabledSwitchButton] =
    useState<boolean>(true)
  const [sessionId, setSessionId] = useState<string>("")
  const [requestSocket, setRequestSocket] = useState<any>({})
  const [isMobileAnalysisPanel, setMobileAnalysisPanel] =
    useState<boolean>(false)
  const [prefixPrompt, setPrefixPrompt] = useState<string>("")
  const [followUpPrompt, setFollowUpPrompt] = useState<string>("")
  const [queryPrompt, setQueryPrompt] = useState<string>("")
  const [idPrompt, setIdPrompt] = useState<string>("")
  const lastQuestionRef = useRef<string>("")
  const errorSectionRef = useRef<string>("")
  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null)
  const [opentPopupConfirm, setOpenPopupConfirm] = useState<boolean>(false)
  const [passwordConfirm, setPasswordConfirm] = useState<string>("")
  const [errorEditPrompt, setErrorEditPrompt] = useState<string>("")
  const [saveChangePrompt, setSaveChangePrompt] = useState<boolean>(false)
  const [loadingCitation, setLoadingCitation] = useState<boolean>(false)
  // propmpt
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPromptChange, setIsPromptChange] = useState<boolean>(false)
  const [isPromptChangeToApply, setIsPromptChangeToApply] =
    useState<boolean>(false)
  const [promptCopy, setPromptCopy] = useState<any>({
    // follow_up_prompt: "",
    prefix_prompt: "",
    query_prompt: "",
  })
  const [promptSelected, setPromptSelected] = useState<any>(null)
  const [showCreatePrompt, setShowCreatePrompt] = useState<boolean>(false)
  const [showConfirmDefaultPrompt, setShowConfirmDefaultPrompt] =
    useState<boolean>(false)
  const [passwordTextError, setPasswordTextError] = useState<any>(undefined)

  const [error, setError] = useState<unknown>()
  const [activeCitation, setActiveCitation] = useState<string>()
  const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<
    AnalysisPanelTabs | undefined
  >(undefined)
  const [selectedAnswer, setSelectedAnswer] = useState<number>(0)
  const [answers, setAnswers] = useState<
    [user: string, response: AskResponse][]
  >([])
  const [openConfirmClearChat, setOpenConfirmClearChat] =
    useState<boolean>(false)

  // experience
  const [indexConversationActive, setIndexConversationActive] = useState<any>(0)
  const idConversationActive = useRef<string>("")
  const isExperienceUrl = checkIsExperience()
  //Default question
  const [defaultQuestion, setDefaultQuestion] = useState<any>(null)
  const [defaultIntro, setDefaultIntro] = useState<any>(null)
  const optionsRitrival: any = [
    { text: "Vectors + Text(Hybrid)", key: "hybrid" },
    { text: "Vectors", key: "vectors" },
    { text: "Text", key: "text" },
  ]
  const optionsLargeLanguage: any = MODEL_VERSIONS

  const onPromptTemplateChange = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setPromptTemplate(newValue || "")
  }

  const onPromptPrefixChange = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setPrefixPrompt(newValue || "")
    listenPromptChangeToSave
    listenPromptChangeToApply
  }

  const onPromptFollowUpChange = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setFollowUpPrompt(newValue || "")
    listenPromptChangeToSave
    listenPromptChangeToApply
  }

  const onPromptQueryChange = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setQueryPrompt(newValue || "")
    listenPromptChangeToSave
    listenPromptChangeToApply
  }

  const onPasswordConfirmChange = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setPasswordConfirm(newValue || "")
    setErrorEditPrompt("")
  }

  const onSelectedRetrivalMode = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: any
  ) => {
    setRetrievalMode(newValue.key || "")
  }

  const onSelectedLargeLanguageModel = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: any
  ) => {
    // setVersionSearch("gpt-35-turbo")
    setLargeLanguageModel(newValue.key || "")
  }

  const onSelectedLlmGenQuery = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: any
  ) => {
    setLlmGenQuery(newValue.key || "")
  }

  const onTemperatureChange = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: string
  ) => {
    setTemperature(parseFloat(newValue || "0.2"))
  }

  const onTemperatureGenQueryChange = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: string
  ) => {
    setTemperatureGenQuery(parseFloat(newValue || "0"))
  }

  const onRetrieveCountChange = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: string
  ) => {
    setRetrieveCount(parseInt(newValue || "5"))
  }

  const onAttachHistoryCountChange = (
    _ev?: React.SyntheticEvent<HTMLElement, Event>,
    newValue?: string
  ) => {
    setAttachHistoryCount(parseInt(newValue || "1"))
  }

  const onAutoClearChatChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setAutoClearChat(!!checked)
  }

  const onUseSemanticRankerChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSemanticRanker(!!checked)
  }

  const onUseSemanticCaptionsChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSemanticCaptions(!!checked)
  }

  const onExcludeCategoryChanged = (
    _ev?: React.FormEvent,
    newValue?: string
  ) => {
    setExcludeCategory(newValue || "")
  }

  const onUseSuggestFollowupQuestionsChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSuggestFollowupQuestions(!!checked)
  }
  const onRenderFooterContent = () => (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      <DefaultButton
        className={`${styles.chatSettingsSeparator}`}
        onClick={() => setIsConfigPanelOpen(false)}
      >
        Close
      </DefaultButton>
      <PrimaryButton
        className={styles.chatSettingsSeparator}
        style={{ backgroundColor: userTheme().color_bg }}
        onClick={() => {
          setOpenPrompt(true),
            setOpenQuestionInit(false),
            setOpenWhitelist(false)
        }}
      >
        Prompt
      </PrimaryButton>
      {/*<PrimaryButton className={styles.chatSettingsSeparator} onClick={() => { setOpenQuestionInit(true), setOpenPrompt(false), setOpenWhitelist(false) }}>*/}
      {/*    Question*/}
      {/*</PrimaryButton>*/}
      {/*<PrimaryButton className={`${styles.chatSettingsSeparator} ${styles.chatSettingsWitelist}`} onClick={() => { setOpenQuestionInit(false), setOpenWhitelist(true), setOpenPrompt(false) }}>*/}
      {/*    Whitelist*/}
      {/*</PrimaryButton>*/}
    </div>
  )
  const onNoRenderFooterContent = () => <></>

  const checkHadLaw = async (content: any, el: any, els: any) => {
    let contentRequest = content
    contentRequest = contentRequest.trim()
    if (contentRequest && contentRequest.includes(". ")) {
      const contentPieces = contentRequest.split(". ")
      if (contentPieces && isArray(contentPieces) && contentPieces[1]) {
        contentRequest = contentPieces[1]
      }
    }

    if (contentRequest.startsWith("-")) {
      contentRequest = contentRequest.slice(0, 1)
    }

    const request: CitationsRequest = { content: contentRequest }
    const result = await citationsApi(request)
    if (result && result.data && result.data.url) {
      el.classList.add("is-law-underline")
      el.addEventListener("click", function (e: any) {
        window.open(result.data.url, "_blank")
      })
      el.addEventListener("mouseout", function (e: any) {
        forEach(els, function (e: any, key: any) {
          e.classList.remove("is-law-underline")
        })
      })
    }
  }

  const getLawItem = (text: any, laws: any) => {
    let textT = text
    if (textT) {
      textT = textT.trim()
      if (textT.includes(". ")) {
        const textPieces = textT.split(". ")
        if (textPieces && textPieces.length && textPieces[1]) {
          textT = textPieces[1]
        }
      }

      if (textT.startsWith("-")) {
        textT = textT.slice(0, 1)
      }

      textT = textT.trim()
      textT = textT.slice(0, -1)
    }

    let law = null
    if (laws && laws.length) {
      law = find(laws, function (o) {
        return o.name && o.name.includes(textT)
      })
    }
    return law
  }

  const setLastQuestionRefByAnswers = (answers: any) => {
    if (answers && answers.length) {
      const lastAnswers = answers[answers.length - 1]
      if (lastAnswers && lastAnswers[0]) {
        lastQuestionRef.current = lastAnswers[0]
      }
    } else {
      lastQuestionRef.current = ""
    }
  }
  const makeApiGetPrompt = () => {
    const userIdLocal = JSON.parse(localStorage.getItem("_user") || "{}")
    const enterprise_id = userIdLocal.enterpriseId
    async function fetchMyAPI() {
      const result = await getPrompt(enterprise_id)
      let cloneArray: any = result
      if (result && result.length) {
        result.map(
          (v: any, ind: any) => (
            (cloneArray[ind].value = v.name), (cloneArray[ind].label = v.name)
          )
        )
      }
      setPromptArr(cloneArray)
      cloneArray?.forEach((v: any, idx: any) => {
        if (v["is_apply"]) {
          setPromptSelected((prev: any) => ({ ...prev, ...v }))
          setPromptCopy((prevState: object) => ({
            ...prevState,
            prefix_prompt: cloneArray[idx]["prefix_prompt"],
            // follow_up_prompt: cloneArray[idx]["follow_up_prompt"],
            query_prompt: cloneArray[idx]["query_prompt"],
          }))
        }
      })
    }

    fetchMyAPI()
  }
  const makeGetConfiguration = async () => {
    try {
      const userIdLocal = JSON.parse(localStorage.getItem("_user") || "{}")
      const enterprise_id = userIdLocal.enterpriseId
      const result = await getConfiguration(enterprise_id)
      if (result) {
        setConfiguration({ ...defaultConfiguration(), ...result["config"] })
        setDefaultQuestion({
          data: result["default_question"]["question"],
        })
        setDefaultIntro(result["default_question"]["description"])
      }
    } catch (e) {
      console.log(e)
      setConfiguration(defaultConfiguration())
    }
  }

  // const makeApiGetDefaultQuestion = async () => {
  //     try {
  //         const result = await getDefaultQuestion();
  //         if(result) {
  //             setDefaultQuestion(result)
  //         }
  //     } catch (e) {
  //         console.log(e)
  //     }
  // }

  const makeApiGetChatById = async (id: string) => {
    const postData = {
      sessionId: id,
    }
    try {
      const result = await chatSessionById(postData)
      citationsStore.addCitationLinks([])
      if (result && result.data) {
        const allChatById = result.data[0]?.messages
        if (allChatById && allChatById.length) {
          let answerBySession: any[] = []
          allChatById.forEach((v: any, ind: any) => {
            const question = v.question
            const temp = Object.assign({}, v)
            delete temp.question
            answerBySession[ind] = [question, temp]
          })
          setAnswers(answerBySession)
          setIsLoading(false)
          setError(false)
          lastQuestionRef.current =
            answerBySession[answerBySession.length - 1][0]
        } else if (idChatBySessionName) {
          setAnswers([])
          setIsLoading(false)
          setError(false)
          lastQuestionRef.current = ""
        }
        setIsPlayVoive((prev: any) => ({ ...prev, status: false }))
      }
    } catch (e: any) {}
  }

  const makeApiRequest = async (
    question: string,
    id = sessionId,
    retry: boolean = false
  ) => {
    const userIdLocal = JSON.parse(localStorage.getItem("_user") || "{}")
    lastQuestionRef.current = question
    error && setError(undefined)
    setIsLoading(true)
    setActiveCitation(undefined)
    setActiveAnalysisPanelTab(undefined)

    let answersByAttachHistoryCount = []
    answersByAttachHistoryCount =
      attachHistoryCount != 0 ? answers.slice(-attachHistoryCount) : []

    const history: ChatTurn[] = !errorSectionRef.current
      ? answersByAttachHistoryCount.map((a) => ({
          user: a[0],
          bot: a[1].answer,
          gen_query: a[1].gen_query,
        }))
      : []

    const promptBySave: any = {
      prefix_prompt: prefixPrompt,
      // follow_up_prompt: followUpPrompt,
      query_prompt: queryPrompt,
    }

    let conversation_id = null
    const url = window.location.href
    if (url && url.endsWith("experience/chat")) {
      let conversation: any = sessionStorage.getItem("conversation")
      if (conversation && typeof conversation === "string") {
        conversation = JSON.parse(conversation)
        if (
          conversation &&
          conversation.length &&
          conversation[indexConversationActive]
        ) {
          if (conversation[indexConversationActive].id) {
            conversation_id = conversation[indexConversationActive].id
          }
        }
      }
    }

    const bot = configuration["bot"]
    const questionRequest = sessionChatsStore.getQuestionFollowup
      ? sessionChatsStore.getQuestionFollowup
      : question

    const request: ChatRequest = !vtccFlow
      ? {
          history: [
            ...history,
            { user: questionRequest, bot: undefined, gen_query: undefined },
          ],
          approach: Approaches.ReadRetrieveRead,
          username: userIdLocal?.username,
          fullname: userIdLocal?.fullname,
          overrides: {
            ...promptBySave,
            promptTemplate:
              promptTemplate.length === 0 ? undefined : promptTemplate,
            excludeCategory:
              excludeCategory.length === 0 ? undefined : excludeCategory,
            top: retrieveCount,
            semanticRanker: useSemanticRanker,
            semanticCaptions: useSemanticCaptions,
            suggestFollowupQuestions: useSuggestFollowupQuestions,
            semantic_law_retriever:
              typeFullTextSearch === SEMANTIC_SEARCH ? true : false,
            fulltext_search_retriever:
              typeFullTextSearch === HYBRID_SEARCH ? true : false,
            use_whitelist: useWhitelist,
            google_seo: useWhitelist ? !googleSeo : false,
            temperature: temperature,
            temperature_gen_query: temperatureGenQuery,
            retrieval_mode: retrievalMode,
            no_prompt: noPrompt,
            no_search_engine: noSearchEngine,
            rerank_retrieve: isRerankRetrieve,
            no_gen_query: noQueryGeneration,
            chatgpt_model: largeLanguageModel,
            chatgpt_model_gen_query: llmGenQuery,
            conversation_id: conversation_id,
            enterprise_id: userIdLocal.enterpriseId,
            segment_rule_search: segmentRuleSearch,
            ner_rule_search: nerRuleSearch,
            semantic_rule_search: semanticRuleSearch,
            is_stream: isStreaming,
            bot_id: bot?.bot_id,
            app_id: bot?.app_id,
            authen_key: bot?.authen_key,
            bot_name: bot?.bot_name,
          },
        }
      : {
          query: question,
        }

    const makeApiRequestSocket = () => {
      setRequestSocket({ request, question, id, retry })
    }

    const makeApiRequestNormal = async () => {
      const url = window.location.href
      let isExperience = false
      if (url && url.endsWith("experience/chat")) {
        isExperience = true
      }
      try {
        const idConversationActiveOld = idConversationActive.current
        let result = vtccFlow
          ? await chatApiVtccFlow(request)
          : await chatApi(request)
        sessionChatsStore.updateErrorCountNetwork(0)

        // TODO check
        if (
          result &&
          result.documents &&
          isArray(result.documents) &&
          result.documents?.length
        ) {
          result = transformDataSpecial(result, question)
        }

        if (!isExperience) {
          if (!params.id) {
            const requestCreate: any = {
              userId: userIdLocal.userId,
              question: question,
            }
            const resultCreateChatSession = await initDefaultChat(requestCreate)
            sessionChatsStore.getIdParams(resultCreateChatSession?.data?.id)
            sessionChatsStore.addItem(resultCreateChatSession?.data)
            navigate(resultCreateChatSession?.data?.id ?? "")
          }
          const requestAnswer: any = {
            ...result,
            question: question,
            senderId: userIdLocal.userId,
            sessionId: sessionChatsStore.idRouter,
          }

          const resultAddMessage = await addChatMessages(requestAnswer)
          if (answers && answers.length === 0) {
            eventBus.dispatch("reloadMessageChat", {
              id: params.id,
              firstMessage: resultAddMessage?.data?.question,
            })
          }
          setIsPlayVoive((prev: any) => ({ ...prev, status: true }))

          const idMessage = resultAddMessage.data.id
          if (params.id === resultAddMessage?.data?.chatSessionId) {
            result = { ...result, id: idMessage }
            setAnswers([...answers, [question, result]])
          }
        } else {
          const idConversationActiveNew = idConversationActive.current
          if (idConversationActiveOld === idConversationActiveNew) {
            setAnswers([...answers, [question, result]])
          }
        }
        errorSectionRef.current = ""
        // reloadData()
      } catch (e: any) {
        const errorCount = sessionChatsStore.errorCountNetwork
        const messageErr =
          e && e?.toString()?.trim() && errorCount < ERROR_COUNT_MAX
            ? errorChatResult(e.toString().trim() || "")
            : e && e?.toString()?.trim() && errorCount >= ERROR_COUNT_MAX
            ? errorChatResult(ERROR_NETWORK_MAX)
            : errorChatResult(ERROR_DEFAULT)

        setError(messageErr)
        errorSectionRef.current = question
      } finally {
        sessionChatsStore.changeQuestionFollowup("")
        setIsLoading(false)
      }
    }
    if (showTextGen) {
      makeApiRequestSocket()
    } else {
      await makeApiRequestNormal()
    }
  }

  const hasResponseSocket = async (
    data: AskResponse,
    question: string,
    id = sessionId,
    retry: boolean = false
  ) => {
    const url = window.location.href
    let isExperience = false
    if (url && url.endsWith("experience/chat")) {
      isExperience = true
    }
    try {
      const userIdLocal = JSON.parse(localStorage.getItem("_user") || "{}")
      let result = data

      // transform data
      if (
        result &&
        result.documents &&
        isArray(result.documents) &&
        result.documents?.length
      ) {
        result = transformDataSpecial(data, question)
      }

      if (!isExperience) {
        if (!params.id) {
          const requestCreate: any = {
            userId: userIdLocal.userId,
            question: question,
          }
          const resultCreateChatSession = await initDefaultChat(requestCreate)
          sessionChatsStore.getIdParams(resultCreateChatSession?.data?.id)
          sessionChatsStore.addItem(resultCreateChatSession?.data)
          // navigate(resultCreateChatSession?.data?.id ?? '')
        }
        const requestAnswer: any = {
          ...result,
          question: question,
          senderId: userIdLocal.userId,
          sessionId: sessionChatsStore.idRouter,
        }

        const resultAddMessage = await addChatMessages(requestAnswer)

        if (!params.id) {
          navigate(sessionChatsStore.idRouter ?? "")
        }

        if (answers && answers.length === 0) {
          eventBus.dispatch("reloadMessageChat", {
            id: params.id,
            firstMessage: resultAddMessage?.data?.question,
          })
        }

        setIsPlayVoive((prev: any) => ({ ...prev, status: true }))
        const idMessage = resultAddMessage.data.id
        if (params.id === resultAddMessage?.data?.chatSessionId) {
          result = { ...result, id: idMessage }
          setAnswers([...answers, [question, result]])
        }
      } else {
        setAnswers([...answers, [question, result]])
      }

      errorSectionRef.current = ""
    } catch (error) {
      setError(error)
      if (!isExperience) {
        errorSectionRef.current = question
      }
    } finally {
      sessionChatsStore.changeQuestionFollowup("")
      setIsLoading(false)
    }
  }

  const transformDataSpecial = (data: any, question: any) => {
    const result = data
    if (result && result.answer) {
      const answerPiece = result.answer.split("\n")

      let answersSort = answerPiece
      let answerHtml = ""
      if (answersSort && isArray(answersSort)) {
        forEach(answersSort, function (item, key) {
          answerHtml += `<div class="law-text-hover">${item}</div>`
        })
      }
      result.answer = answerHtml
    }
    return result
  }

  const onErrorSocket = (
    data: any,
    question: string,
    id = sessionId,
    retry: boolean = false
  ) => {
    sessionChatsStore.changeQuestionFollowup("")
    let toString = (obj: any) =>
      Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    setIsLoading(false)
    errorSectionRef.current = question
    const messageErr =
      data && toString(data)?.trim()
        ? errorChatResult(toString(data)?.trim() || "")
        : errorChatResult(ERROR_DEFAULT)
    if (!messageErr?.includes("Do kết nối mạng không ổn định")) {
      sessionChatsStore.updateErrorCountNetwork(0)
    }
    setError(messageErr)
    // setError(data?.error ?? 'error');
  }

  const onEditPrompt = async () => {
    const request: PromptRequest = {
      bot: "GPT_OPENAI",
      password: passwordConfirm,
      prefixPrompt: prefixPrompt,
      followUpPrompt: followUpPrompt,
      queryPrompt: queryPrompt,
      idPrompt: idPrompt,
      is_apply: true,
    }
    EditPrompt(request)
      .then((result) => {
        notify("Cập nhật thành công")
        setPromptCopy((prevState: object) => ({
          ...prevState,
          prefix_prompt: result["prefix_prompt"],
          // follow_up_prompt: result["follow_up_prompt"],
          query_prompt: result["query_prompt"],
        }))
        setPrefixPrompt(result["prefix_prompt"] || "")
        // setFollowUpPrompt(result["follow_up_prompt"] || "");
        setQueryPrompt(result["query_prompt"] || "")
        setPasswordConfirm("")
        setOpenPopupConfirm(false)
        makeApiGetPrompt()
      })
      .catch((e) => {
        console.log(e)
        setErrorEditPrompt(e)
      })
  }

  const onSetDefaultPrompt = async (e: any) => {
    if (e.target.checked) {
      setShowConfirmDefaultPrompt(true)
    }
  }
  const makeApiDefaultPrompt = async (p: string) => {
    const request: PromptRequest = {
      bot: "GPT_OPENAI",
      password: p,
      prefixPrompt: prefixPrompt,
      followUpPrompt: followUpPrompt,
      queryPrompt: queryPrompt,
      idPrompt: idPrompt,
      is_apply: true,
    }
    setDefaultPrompt(request)
      .then((result) => {
        notify("Cập nhật prompt mặc định thành công")
        setShowConfirmDefaultPrompt(false)
        makeApiGetPrompt()
      })
      .catch((e) => {
        console.log(e)
        setPasswordTextError(e || undefined)
      })
  }

  const clearChat = async () => {
    const url = window.location.href
    let isExperience = false
    if (url && url.endsWith("experience/chat")) {
      isExperience = true
    }

    if (!isExperience) {
      try {
        const requestClear: any = {
          sessionId: params.id,
        }
        await clearMessagesInChatSession(requestClear)
        eventBus.dispatch("clearchatNavbar", { id: params.id })
        setOpenConfirmClearChat(false)
      } catch (e) {
        console.log(e)
      }
    } else {
      const conversation = getConversationStorage()
      if (
        indexConversationActive > -1 &&
        conversation &&
        conversation[indexConversationActive] &&
        conversation[indexConversationActive].answers
      ) {
        conversation[indexConversationActive].answers = []
        setConversationStorage(conversation)
      }
    }
    lastQuestionRef.current = ""
    error && setError(undefined)
    setActiveCitation(undefined)
    setActiveAnalysisPanelTab(undefined)
    setAnswers([])
    setOpenConfirmClearChat(false)
  }
  const clearChatByDelete = () => {
    lastQuestionRef.current = ""
    error && setError(undefined)
    setActiveCitation(undefined)
    setActiveAnalysisPanelTab(undefined)
    setAnswers([])
  }
  const newChatSession = () => {
    lastQuestionRef.current = ""
    setSessionId("")
    error && setError(undefined)
    setActiveCitation(undefined)
    setActiveAnalysisPanelTab(undefined)
    setAnswers([])
  }

  const listenPromptChangeToSave = useMemo(() => {
    if (saveChangePrompt) {
      setIsPromptChange(true)
    } else {
      if (
        promptCopy.prefix_prompt !== prefixPrompt ||
        promptCopy.follow_up_prompt !== followUpPrompt ||
        promptCopy.query_prompt !== queryPrompt
      ) {
        setIsPromptChange(true)
      } else {
        setIsPromptChange(false)
      }
    }
  }, [prefixPrompt, followUpPrompt, queryPrompt, promptCopy])
  const listenPromptChangeToApply = useMemo(() => {
    if (
      promptCopy.prefix_prompt !== prefixPrompt ||
      promptCopy.follow_up_prompt !== followUpPrompt ||
      promptCopy.query_prompt !== queryPrompt
    ) {
      setIsPromptChangeToApply(true)
    } else {
      setIsPromptChangeToApply(false)
    }
  }, [prefixPrompt, followUpPrompt, queryPrompt, promptCopy])

  const scrollIntoView = () => {
    chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" })
  }
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

  const onExampleClicked = async (example: string) => {
    makeApiRequest(example)
  }

  const makeApiCitationRequest = async (
    content: string,
    indexSelected: number
  ) => {
    var dataResult = null
    const request: CitationsRequest = { content: content }
    const result = await citationsApi(request)
    if (result && result.data) {
      dataResult = result.data
    } else {
      if (answers && answers[indexSelected] && answers[indexSelected][1]) {
        const textList = answers[indexSelected][1]["data_points"]
        const requestCompare: any = { word: content, textList: textList }
        const resultCompare = await citationsCompareApi(requestCompare)
        if (resultCompare && resultCompare.data) {
          const request: CitationsRequest = { content: resultCompare.data }
          const result = await citationsApi(request)
          dataResult = result && result.data ? result.data : null
        }
      }
    }
    return dataResult
  }
  const setHighlightCitation = (citation: any) => {
    if (
      citation &&
      citation.noteChildContents &&
      citation.noteChildContents.length
    ) {
      forEach(citation.noteChildContents, function (note: any, keyNote: any) {
        const word = citation.noteChildContents[keyNote].word
        let wordHtml = word
        if (note.noteMetadatas && note.noteMetadatas.length) {
          const noteMetadatas = uniqBy(note.noteMetadatas, "to")
          if (isHighlightCitation(noteMetadatas)) {
            forEach(noteMetadatas, function (metadata: any, keyMetadata: any) {
              if (metadata.to) {
                const wordHighlight = word.substring(metadata.from, metadata.to)
                if (wordHighlight) {
                  const wordHighlightHtml = `<span class="is-highlight citation-highlight" data-key-note="${keyNote}" data-key-metadata="${keyMetadata}">${wordHighlight}</span>`
                  wordHtml = wordHtml.replace(wordHighlight, wordHighlightHtml)
                }
              }
            })
          }
        }
        citation.noteChildContents[keyNote].wordHtml = wordHtml
      })
    }
    return citation
  }
  const isHighlightCitation = (noteMetadatas: any) => {
    let isHighlight = false
    if (noteMetadatas && noteMetadatas.length) {
      forEach(noteMetadatas, function (metadata: any, key: any) {
        if (metadata.guide) {
          isHighlight = true
          return false
        }
      })
    }

    return isHighlight
  }
  const onShowCitation = async (citation: string, index: number) => {
    // console.log('citation', citation);
    // console.log('selectedAnswer', answers[selectedAnswer][1]);

    const content = citation.replace("/content/", "")
    setLoadingCitation(true)
    try {
      const result = await makeApiCitationRequest(content, index)
      let citation = result ? result : null

      if (citation && citation.isSearchTitle && citation.url) {
        openWindowToUrl(citation.url)
        // window.open(citation.url, '_blank');
        return
      }

      if (answers && answers[index] && answers[index][1] && citation) {
        if (
          citation.noteChildContent &&
          typeof citation.noteChildContent === "string"
        ) {
          citation.noteChildContent = JSON.parse(citation.noteChildContent)
        }
        // if (citation.noteContent && typeof citation.noteContent === "string") {
        //     citation.noteContent = JSON.parse(citation.noteContent)
        // }
      }
      const updatedAnswer = [...answers]
      citation = setHighlightCitation(citation)
      updatedAnswer[index][1].citation = citation
      // answers[index][1].citation = citation;
      // console.log(answers)
      setAnswers(updatedAnswer)
      // console.log(answers)
      setLoadingCitation(false)
    } catch (e) {
      // setError(e);
      setLoadingCitation(false)
    } finally {
    }

    if (
      activeCitation === citation &&
      activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab &&
      selectedAnswer === index
    ) {
      setActiveAnalysisPanelTab(undefined)
    } else {
      setActiveCitation(citation)
      setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab)
    }

    setSelectedAnswer(index)
  }

  const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
    if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
      setActiveAnalysisPanelTab(undefined)
    } else {
      setActiveAnalysisPanelTab(tab)
    }

    setSelectedAnswer(index)
  }
  useEffect(() => {
    if (window.innerWidth <= 800) {
      setMobileAnalysisPanel(true)
    }

    let ctrlPress = false
    document.addEventListener("keydown", (e) => {
      if (e.keyCode === 17) {
        ctrlPress = true
      }
      if (ctrlPress && e.keyCode === 116) {
        sessionStorage.clear()
      }
    })

    document.addEventListener("keyup", (e) => {
      ctrlPress = false
    })

    return () => {}
  }, [])
  useEffect(() => {
    if (messageRequest) {
      onExampleClicked(messageRequest)
      setMessageRequest("")
    }
  }, [messageRequest])

  useEffect(() => {
    let isExperience = false
    const url = window.location.href
    if (url && url.endsWith("experience/chat")) {
      isExperience = true
    }
    if (isExperience) {
      if (answers && answers.length) {
        if (indexConversationActive > -1) {
          let conversation: any = sessionStorage.getItem("conversation")
          if (conversation && typeof conversation === "string") {
            conversation = JSON.parse(conversation)
            if (conversation && conversation[indexConversationActive]) {
              conversation[indexConversationActive].answers = answers
              sessionStorage.setItem(
                "conversation",
                JSON.stringify(conversation)
              )
            }
          }

          if (answers && answers.length === 1) {
            eventBus.dispatch("update-conversation-storage", {})
          }
        }
      }
    } else {
    }
  }, [answers])
  useEffect(() => {}, [sessionId])
  const firstUpdate = useRef(false)
  // event bus
  useEffect(() => {
    if (firstUpdate.current) {
      return
    }
    eventBus.on("clearChat", (data: any) => {
      lastQuestionRef.current = ""
      clearChat()
    })
    eventBus.on("clearChatByDelete", (data: any) => {
      clearChatByDelete()
    })
    eventBus.on("closeAnalysisPanel", (data: any) => {
      setActiveAnalysisPanelTab(undefined)
    })
    eventBus.on("clearChatByDeleteAll", (data: any) => {
      clearChatByDelete()
    })
    eventBus.on("newChatSession", (data: any) => {
      lastQuestionRef.current = ""
      newChatSession()
    })

    eventBus.on("experience-change-conversation", async (data: any) => {
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

        if (data.indexNew > -1) {
          setIndexConversationActive(data.indexNew)
        }
        if (conversationTmp) {
          const conversationNew = conversationTmp[data.indexNew] || null

          if (conversationNew) {
            idConversationActive.current = conversationNew.id
          }

          if (
            conversationNew &&
            conversationNew.answers &&
            conversationNew.answers.length
          ) {
            setLastQuestionRefByAnswers(conversationNew.answers)
            setAnswers(conversationNew.answers)
          } else {
            lastQuestionRef.current = ""
            setAnswers([])
          }
        }
      }
    })

    eventBus.on("toggle-disabled-chat", (data: any) => {
      setIsLoading(data.isDisabled)
      // setDisabledChat(data.isDisabled)
    })

    firstUpdate.current = true
    return () => {}
  }, [answers])

  // hover in law text
  useEffect(() => {
    let lastAnswer = null
    if (answers && answers.length) {
      lastAnswer = answers[answers.length - 1]
    }
    const result = lastAnswer && lastAnswer[1] ? lastAnswer[1] : null
    if (
      result &&
      result.documents &&
      isArray(result.documents) &&
      result.documents.length
    ) {
      const lawsTextHover = document.getElementsByClassName("law-text-hover")
      if (lawsTextHover) {
        forEach(lawsTextHover, function (el: any, key) {
          let text = el.textContent || el.innerText
          const law = getLawItem(text, result.documents)

          el.removeEventListener("mouseover", function () {}, false) // Fails
          el.removeEventListener("mouseout", function () {}, false) // Fails
          el.removeEventListener("click", function () {}, false) // Fails
          el.addEventListener("mouseover", function (e: any) {
            if (law) {
              el.classList.add("is-law-underline")
            } else {
              checkHadLaw(text, el, lawsTextHover)
            }
          })
          if (law && law.url) {
            el.addEventListener("click", function (e: any) {
              window.open(law.url, "_blank")
            })
            el.addEventListener("mouseout", function (e: any) {
              el.classList.remove("is-law-underline")
            })
          }
        })
      }
    }
  }, [answers])
  useEffect(() => {
    makeGetConfiguration()
    makeApiGetPrompt()
    // makeApiGetDefaultQuestion()
    return () => {}
  }, [])

  useEffect(() => {
    if (promptSelected) {
      setPrefixPrompt(promptSelected["prefix_prompt"] || "")
      // setFollowUpPrompt(promptSelected["follow_up_prompt"] || "");
      setQueryPrompt(promptSelected["query_prompt"] || "")
      setIdPrompt(promptSelected.id)
    } else {
      setPrefixPrompt("")
      setFollowUpPrompt("")
      setQueryPrompt("")
      setIdPrompt("")
    }

    //disable switch button default prompt
    setDisabledSwitchButton(
      promptSelected && promptSelected["is_apply"]
        ? true
        : !promptSelected
        ? true
        : false
    )
  }, [promptSelected])

  useEffect(() => {
    if (params.id) {
      makeApiGetChatById(params.id || "")
    }
  }, [params])
  useEffect(() => {
    setActiveAnalysisPanelTab(undefined)
  }, [idChatBySessionName])
  useEffect(() => {
    if (searchSource === "VTCC") {
      setRetrievalMode("text")
      setUseSemanticRanker(false)
      setUseSemanticCaptions(false)
    } else setUseSemanticRanker(false)
  }, [searchSource])
  useEffect(() => {
    if (activeAnalysisPanelTab) {
      eventBus.dispatch("closeMenuChat", {})
    }
  }, [activeAnalysisPanelTab])

  useEffect(() => scrollIntoView(), [isLoading, lastQuestionRef?.current])

  useEffect(() => {
    if (autoClearChat) {
      setAttachHistoryCount(0)
    } else {
      setAttachHistoryCount(configuration["attach_history_count"])
    }
  }, [autoClearChat])

  useEffect(() => {
    setAttachHistoryCount(configuration["attach_history_count"])
    setLargeLanguageModel(configuration["large_language_model"])
    setLlmGenQuery(configuration["chatgpt_model_gen_query"])
    setTypeFullTextSearch(configuration["fulltext_search"])
    setNoQueryGeneration(configuration["no_gen_query"])
    setAutoClearChat(configuration["auto_clear_chat"])
    setIsStreaming(configuration["is_streaming"])
    // setNoPrompt(configuration["no_prompt"])
    // setNoSearchEngine(configuration["no_search_engine"])
    // setIsRerankRetrieve(configuration["rerank_retrieve"])
    // setRetrievalMode(configuration["retrieval_mode"]);
    // setUseSemanticCaptions(configuration["semantic_captions"])
    // setUseSemanticRanker(configuration["semantic_ranker"])
    // setUseSuggestFollowupQuestions(configuration["suggest_followup_questions"])
    setTemperature(parseFloat(configuration.temperature))
    setTemperatureGenQuery(parseFloat(configuration.temperature_gen_query))
    setRetrieveCount(configuration.top)
    setUseWhitelist(configuration["use_whitelist"])
    setGoogleSeo(configuration["google_seo"])

    setSegmentRuleSearch(
      configuration["fulltext_rule_search"]["segment_rule_search"]
    )
    setNerRuleSearch(configuration["fulltext_rule_search"]["ner_rule_search"])
    setSemanticRuleSearch(
      configuration["fulltext_rule_search"]["semantic_rule_search"]
    )

    setIsPlayVoive({
      status: false,
      config: configuration["play_voice"],
    })
  }, [configuration])

  return (
    <>
      <div
        style={{
          display: "flex",
          flex: "1 1 auto",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div className={styles.container}>
          <div className={styles.commandsContainer}>
            {activeAnalysisPanelTab && !isMobileAnalysisPanel && (
              <CloseDebug
                className={styles.commandButton}
                onClick={() => setActiveAnalysisPanelTab(undefined)}
                activeAnalysisPanelTab={activeAnalysisPanelTab}
              />
            )}
            {lastQuestionRef.current && (
              // <>
              //     <ClearChatButton className={styles.commandButton} onClick={() => {onClickClearChat()}} disabled={!lastQuestionRef.current || isLoading} />
              //     {/* <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} /> */}
              // </>
              <>
                <ClearChatButton
                  className={styles.commandButton}
                  onClick={() => {
                    !lastQuestionRef.current || isLoading
                      ? null
                      : setOpenConfirmClearChat(true)
                  }}
                  disabled={!lastQuestionRef.current || isLoading}
                />
                <ConfirmClearChatPopup
                  clearChat={clearChat}
                  setOpenConfirmClearChat={setOpenConfirmClearChat}
                  openConfirmClearChat={openConfirmClearChat}
                />
                {/* <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} /> */}
              </>
            )}
            {isShowConfiguration() ? (
              <SettingsButton
                className={styles.commandButton}
                onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
              />
            ) : null}
          </div>
          <div className={styles.chatRoot}>
            <div className={styles.chatContainer}>
              {!lastQuestionRef.current ? (
                // <div className={styles.chatEmptyState}>
                //     <SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />
                //     <h1 className={styles.chatEmptyStateTitle}>Chat with your data</h1>
                //     <h2 className={styles.chatEmptyStateSubtitle}>Ask anything or try an example</h2>
                //     <ExampleList onExampleClicked={onExampleClicked} />

                // </div>
                <div
                  className={`${styles.chatMessageStream} ${
                    isMobile ? styles.chatMessageStreamMobile : ""
                  }`}
                >
                  <div className={styles.chatMessageGpt}>
                    <AnswerInitChat
                      onFollowupQuestionClicked={(q) => makeApiRequest(q)}
                      getDefaultQuestion={defaultQuestion}
                      getDefaultIntro={defaultIntro}
                    />
                  </div>
                </div>
              ) : (
                // class="chat-message-stream"
                // <div className={styles.chatMessageStream}>
                <div
                  className={`chat-message-stream ${styles.chatMessageStream} ${
                    isMobile ? styles.chatMessageStreamMobile : ""
                  }`}
                >
                  {answers.map((answer, index) => (
                    <div key={index}>
                      <UserChatMessage message={answer[0]} />
                      <div className={styles.chatMessageGpt}>
                        <div className="">
                          <Answer
                            key={index}
                            answer={answer[1]}
                            isSelected={
                              selectedAnswer === index &&
                              activeAnalysisPanelTab !== undefined
                            }
                            onCitationClicked={(c) => onShowCitation(c, index)}
                            onThoughtProcessClicked={() =>
                              onToggleTab(
                                AnalysisPanelTabs.ThoughtProcessTab,
                                index
                              )
                            }
                            onSupportingContentClicked={() =>
                              onToggleTab(
                                AnalysisPanelTabs.SupportingContentTab,
                                index
                              )
                            }
                            onFollowupQuestionClicked={(q) => makeApiRequest(q)}
                            showFollowupQuestions={
                              useSuggestFollowupQuestions &&
                              answers.length - 1 === index
                            }
                            isPlayVoive={isPlayVoive}
                            onSend={(question) => makeApiRequest(question)}
                          />
                          {/* <RelatedQuestion getDefaultQuestion={defaultQuestion}/> */}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <>
                      <UserChatMessage message={lastQuestionRef.current} />
                      <div
                        className={
                          showTextGen
                            ? styles.chatMessageGpt
                            : styles.chatMessageGptMinWidth
                        }
                      >
                        <AnswerLoading
                          onChangeHeight={scrollIntoView}
                          onErrorSocket={onErrorSocket}
                          requestSocket={requestSocket}
                          receivedSocketData={hasResponseSocket}
                          isShowTextGen={showTextGen}
                        />
                      </div>
                    </>
                  )}
                  {error &&
                  errorSectionRef.current &&
                  errorSectionRef.current.length &&
                  errorSectionRef.current.length > 0 &&
                  errorSectionRef.current === lastQuestionRef.current ? (
                    <>
                      <UserChatMessage message={errorSectionRef.current} />
                      <div className={styles.chatMessageGptMinWidth}>
                        <AnswerError
                          error={error.toString()}
                          onRetry={() => {
                            makeApiRequest(errorSectionRef.current, "", true)
                          }}
                        />
                      </div>
                    </>
                  ) : null}
                  <div ref={chatMessageStreamEnd} />
                </div>
              )}

              <div
                className={`${styles.chatInput} ${
                  isMobile ? styles.chatMessageStreamMobile : ""
                } question-input`}
              >
                <QuestionInput
                  clearOnSend
                  placeholder="Type a new question (e.g. does my plan cover annual eye exams?)"
                  disabled={isLoading}
                  onSend={(question) => makeApiRequest(question)}
                />
              </div>
            </div>

            {answers.length > 0 &&
              activeAnalysisPanelTab &&
              !isMobileAnalysisPanel && (
                <AnalysisPanel
                  className={styles.chatAnalysisPanel}
                  activeCitation={activeCitation}
                  onActiveTabChanged={(x) => onToggleTab(x, selectedAnswer)}
                  citationHeight="810px"
                  answer={answers[selectedAnswer][1]}
                  activeTab={activeAnalysisPanelTab}
                  loadingCitation={loadingCitation}
                />
              )}

            {answers.length > 0 &&
              activeAnalysisPanelTab &&
              isMobileAnalysisPanel && (
                <Dialog
                  isOpen={activeAnalysisPanelTab ? true : false}
                  onDismiss={() => setActiveAnalysisPanelTab(undefined)}
                  styles={{
                    main: {
                      selectors: {
                        ["@media (min-width: 480px)"]: {
                          width: 500,
                          minWidth: 450,
                        },
                      },
                    },
                  }}
                >
                  <span
                    onClick={() => setActiveAnalysisPanelTab(undefined)}
                    style={{
                      position: "absolute",
                      right: "-10px",
                      top: "-25px",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i>x</i>
                  </span>
                  <AnalysisPanel
                    className={styles.chatAnalysisPanel}
                    activeCitation={activeCitation}
                    onActiveTabChanged={(x) => onToggleTab(x, selectedAnswer)}
                    citationHeight="810px"
                    answer={answers[selectedAnswer][1]}
                    activeTab={activeAnalysisPanelTab}
                    loadingCitation={loadingCitation}
                  />
                  <DialogFooter>
                    <PrimaryButton
                      onClick={() => setActiveAnalysisPanelTab(undefined)}
                      text="Close"
                    />
                  </DialogFooter>
                </Dialog>
              )}

            <Panel
              headerText="Configuration"
              isOpen={isConfigPanelOpen}
              isBlocking={false}
              onDismiss={() => setIsConfigPanelOpen(false)}
              closeButtonAriaLabel="Close"
              onRenderFooterContent={
                !openPrompt ? onRenderFooterContent : onNoRenderFooterContent
              }
              isFooterAtBottom={true}
            >
              {!openPrompt && !openQuestionInit && !openWhitelist && (
                <div className="bbbbb">
                  <Checkbox
                    styles={() =>
                      checkBoxStyles(autoClearChat ? "checked" : "")
                    }
                    className={styles.chatSettingsSeparator}
                    checked={autoClearChat}
                    label="No chat history"
                    onChange={onAutoClearChatChange}
                  />
                  <SpinButton
                    style={{ marginBottom: "5px" }}
                    disabled={vtccFlow ? true : autoClearChat ? true : false}
                    className={styles.chatSettingsSeparator}
                    label="Number of chat history attached:"
                    min={0}
                    max={15}
                    defaultValue={attachHistoryCount.toString()}
                    value={attachHistoryCount.toString()}
                    onChange={onAttachHistoryCountChange}
                  />
                  <Checkbox
                    disabled={vtccFlow ? true : false}
                    styles={() => checkBoxStyles(showTextGen ? "checked" : "")}
                    className={styles.chatSettingsSeparator}
                    checked={showTextGen}
                    label="Show text generation"
                    onChange={(_ev, checked) => setShowTextGen(!!checked)}
                  />
                  <Checkbox
                    styles={() =>
                      checkBoxStyles(noQueryGeneration ? "checked" : "")
                    }
                    className={styles.chatSettingsSeparator}
                    checked={noQueryGeneration}
                    label="No query generation"
                    onChange={(_ev, checked) => {
                      setNoQueryGeneration(!!checked)
                    }}
                  />
                  {/*<Checkbox*/}
                  {/*    styles={() => checkBoxStyles(noPrompt ? 'checked' : '')}*/}
                  {/*    className={styles.chatSettingsSeparator}*/}
                  {/*    checked={noPrompt}*/}
                  {/*    label="No Prompt"*/}
                  {/*    onChange={(_ev, checked) => setNoPrompt(!!checked)}*/}
                  {/*/>*/}
                  {/*<Checkbox*/}
                  {/*    styles={() => checkBoxStyles(noSearchEngine ? 'checked' : '')}*/}
                  {/*    className={styles.chatSettingsSeparator}*/}
                  {/*    checked={noSearchEngine}*/}
                  {/*    label="No search engine"*/}
                  {/*    onChange={(_ev, checked) => { setNoSearchEngine(!!checked), setSearchSource("azure"), setRetrievalMode("text") }}*/}
                  {/*/>*/}
                  {/*<Checkbox*/}
                  {/*    styles={() => checkBoxStyles(isRerankRetrieve ? 'checked' : '')}*/}
                  {/*    className={styles.chatSettingsSeparator}*/}
                  {/*    checked={isRerankRetrieve}*/}
                  {/*    label="Rerank Retrieve"*/}
                  {/*    onChange={(_ev, checked) => { setIsRerankRetrieve(!!checked) }}*/}
                  {/*/>*/}
                  <Checkbox
                    styles={() =>
                      checkBoxStyles(isPlayVoive.config ? "checked" : "")
                    }
                    className={styles.chatSettingsSeparator}
                    checked={isPlayVoive.config}
                    label="Play voice"
                    onChange={(_ev, checked) => {
                      setIsPlayVoive((prev: any) => ({
                        ...prev,
                        config: !!checked,
                      }))
                    }}
                  />
                  <Checkbox
                    styles={() => checkBoxStyles(isStreaming ? "checked" : "")}
                    className={styles.chatSettingsSeparator}
                    checked={isStreaming}
                    label="Streaming gen answer"
                    onChange={(_ev, checked) => {
                      setIsStreaming(!!checked)
                    }}
                  />
                  <div>
                    <Label className={styles.chatSettingsSeparator}>
                      Search Engine
                    </Label>
                    <div
                      className={styles.chatSettingsSource}
                      style={{ marginTop: "5px" }}
                    >
                      <Checkbox
                        styles={() =>
                          checkBoxStyles(
                            typeFullTextSearch === SEMANTIC_SEARCH
                              ? "checked"
                              : ""
                          )
                        }
                        checked={typeFullTextSearch === SEMANTIC_SEARCH}
                        label={SEMANTIC_SEARCH}
                        onChange={() => setTypeFullTextSearch(SEMANTIC_SEARCH)}
                      />
                      <Checkbox
                        styles={() =>
                          checkBoxStyles(
                            typeFullTextSearch === HYBRID_SEARCH
                              ? "checked"
                              : ""
                          )
                        }
                        checked={typeFullTextSearch === HYBRID_SEARCH}
                        label={HYBRID_SEARCH}
                        onChange={() => setTypeFullTextSearch(HYBRID_SEARCH)}
                      />
                    </div>
                  </div>

                  {typeFullTextSearch == HYBRID_SEARCH && (
                    <div>
                      <Label className={styles.chatSettingsSeparator}>
                        Full text rule search
                      </Label>
                      <div
                        className={styles.chatSettingsSource}
                        style={{ marginTop: "5px" }}
                      >
                        <Checkbox
                          styles={() =>
                            checkBoxStyles(segmentRuleSearch ? "checked" : "")
                          }
                          checked={segmentRuleSearch}
                          label="Segment rule"
                          onChange={() =>
                            setSegmentRuleSearch(!segmentRuleSearch)
                          }
                        />
                        <Checkbox
                          styles={() =>
                            checkBoxStyles(nerRuleSearch ? "checked" : "")
                          }
                          checked={nerRuleSearch}
                          label="Ner rule"
                          onChange={() => setNerRuleSearch(!nerRuleSearch)}
                        />
                        <Checkbox
                          styles={() =>
                            checkBoxStyles(semanticRuleSearch ? "checked" : "")
                          }
                          checked={semanticRuleSearch}
                          label="Semantic rule"
                          onChange={() =>
                            setSemanticRuleSearch(!semanticRuleSearch)
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className={styles.chatSettingsSeparator}>
                      Use whitelist
                    </Label>

                    <div className="mb-3">
                      <Checkbox
                        styles={() =>
                          checkBoxStyles(useWhitelist ? "checked" : "")
                        }
                        checked={useWhitelist}
                        label="Use whitelist"
                        onChange={(_ev, checked) => {
                          setUseWhitelist(!!checked)
                        }}
                      />
                    </div>

                    {useWhitelist && (
                      <div
                        className={styles.chatSettingsSource}
                        style={{ marginTop: "5px" }}
                      >
                        <Checkbox
                          styles={() =>
                            checkBoxStyles(!googleSeo ? "checked" : "")
                          }
                          checked={!googleSeo}
                          label="Use whitelist with initial search keywords"
                          onChange={() => setGoogleSeo(false)}
                        />
                        <Checkbox
                          styles={() =>
                            checkBoxStyles(googleSeo ? "checked" : "")
                          }
                          checked={googleSeo}
                          label="Use whitelist for search results"
                          onChange={() => setGoogleSeo(true)}
                        />
                      </div>
                    )}
                  </div>

                  {/* <Checkbox
                                        disabled={showTextGen ? true : false}
                                        className={styles.chatSettingsSeparator}
                                        checked={vtccFlow}
                                        label="VTCC chat flow"
                                        onChange={(_ev, checked) => setVtccFlow(!!checked)}
                                    /> */}
                  {/* {!noSearchEngine ? (
                                        <>
                                            <div>
                                                <Label className={styles.chatSettingsSeparator}>
                                                    Search Engine
                                                </Label>
                                                <div className={styles.chatSettingsSource}>
                                                    <Checkbox
                                                        disabled={vtccFlow ? true : false}
                                                        checked={searchSource === 'azure'}
                                                        label="Cognitive Search"
                                                        onChange={() => setSearchSource("azure")}
                                                    />
                                                    <Checkbox
                                                        disabled={vtccFlow ? true : false}
                                                        checked={searchSource === 'VTCC'}
                                                        label="VTCC"
                                                        onChange={() => setSearchSource("VTCC")}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.chatSettingsSeparator}>
                                                <Dropdown
                                                    disabled={vtccFlow ? true : searchSource === 'VTCC' ? true : false}
                                                    label={'Retrieval mode'}
                                                    onChange={onSelectedRetrivalMode}
                                                    defaultSelectedKey="text"
                                                    selectedKey={retrievalMode}
                                                    options={optionsRitrival}
                                                />
                                            </div>
                                        </>
                                    ) : null} */}
                  <SpinButton
                    disabled={vtccFlow ? true : false}
                    className={styles.chatSettingsSeparator}
                    label="Retrieve this many documents from search:"
                    min={1}
                    max={15}
                    defaultValue={retrieveCount.toString()}
                    onChange={onRetrieveCountChange}
                  />
                  {!noQueryGeneration && (
                    <div>
                      <Label className={styles.chatSettingsSeparator}>
                        LLM gen query
                      </Label>
                      <div>
                        <Dropdown
                          // disabled={vtccFlow ? true : false}
                          // label={''}
                          onChange={onSelectedLlmGenQuery}
                          defaultSelectedKey={llmGenQuery}
                          selectedKey={llmGenQuery}
                          options={optionsLargeLanguage}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className={styles.chatSettingsSeparator}>
                      Large Language Model
                    </Label>
                    <div>
                      <Dropdown
                        disabled={vtccFlow}
                        // label={''}
                        onChange={onSelectedLargeLanguageModel}
                        selectedKey={largeLanguageModel}
                        options={optionsLargeLanguage}
                      />
                    </div>
                    {/* <div className={styles.chatSettingsSourceBlock}>
                                            <div className={styles.chatSettingsSourceBlock}>
                                                <Checkbox
                                                    disabled={vtccFlow ? true : largeLanguageModel === 'llm-vtcc-model' ? true : false}
                                                    checked={versionSearch === 'gpt-35-turbo'}
                                                    label="gpt-35-turbo"
                                                    onChange={() => setVersionSearch("gpt-35-turbo")}
                                                />
                                            </div>
                                            <div className={styles.chatSettingsSourceBlock}>
                                                <Checkbox
                                                    disabled={vtccFlow ? true : largeLanguageModel === 'llm-vtcc-model' ? true : false}
                                                    checked={versionSearch === 'gpt-35-turbo-4k'}
                                                    label="gpt-35-turbo-4k"
                                                    onChange={() => setVersionSearch("gpt-35-turbo-4k")}
                                                />
                                            </div>
                                            <div className={styles.chatSettingsSourceBlock}>
                                                <Checkbox
                                                    disabled={vtccFlow ? true : largeLanguageModel === 'llm-vtcc-model' ? true : false}
                                                    checked={versionSearch === 'gpt-35-turbo-16k'}
                                                    label="gpt-35-turbo-16k"
                                                    onChange={() => setVersionSearch("gpt-35-turbo-16k")}
                                                />
                                            </div>
                                            <div className={styles.chatSettingsSourceBlock}>
                                                <Checkbox
                                                    disabled={vtccFlow ? true : largeLanguageModel === 'llm-vtcc-model' ? true : false}
                                                    checked={versionSearch === 'gpt-35-turbo-32k'}
                                                    label="gpt-35-turbo-32k"
                                                    onChange={() => setVersionSearch("gpt-35-turbo-32k")}
                                                />
                                            </div>
                                        </div> */}
                    {/*{largeLanguageModel === 'Azure OpenAI GPT' ? (*/}
                    {/*    <div className={styles.chatSettingsSource} style={{ marginTop: '20px' }}>*/}
                    {/*        <Checkbox*/}
                    {/*            styles={() => checkBoxStyles(versionSearch === 'gpt-35-turbo' ? 'checked' : '')}*/}
                    {/*            disabled={vtccFlow ? true : false}*/}
                    {/*            checked={versionSearch === 'gpt-35-turbo'}*/}
                    {/*            label="gpt-35-turbo"*/}
                    {/*            onChange={() => setVersionSearch("gpt-35-turbo")}*/}
                    {/*        />*/}
                    {/*        <Checkbox*/}
                    {/*            styles={() => checkBoxStyles(versionSearch === 'gpt-35-turbo-16k' ? 'checked' : '')}*/}
                    {/*            disabled={vtccFlow ? true : false}*/}
                    {/*            checked={versionSearch === 'gpt-35-turbo-16k'}*/}
                    {/*            label="gpt-35-turbo-16k"*/}
                    {/*            onChange={() => setVersionSearch("gpt-35-turbo-16k")}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*) : null}*/}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Label className={styles.chatSettingsSeparator}>
                      Temperature gen query
                    </Label>
                    <SpinButton
                      disabled={vtccFlow ? true : false}
                      min={0}
                      max={1}
                      step={0.1}
                      defaultValue={temperatureGenQuery.toString()}
                      onChange={onTemperatureGenQueryChange}
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <Label className={styles.chatSettingsSeparator}>
                      Temperature
                      <img
                        id="Temperature-title"
                        className={styles.headerNavPageLinkIcon}
                        src={seeMore}
                        alt=""
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          marginLeft: "6px",
                        }}
                      />
                      <ReactTooltip
                        className={styles.customTooltip}
                        anchorId="Temperature-title"
                        place="top"
                        content="LLM temperature là một tham số điều chỉnh độ ngẫu nhiên, hoặc sáng tạo, của các phản ứng của trí tuệ nhân tạo (AI). Một giá trị temperature cao thường làm cho kết quả trở nên đa dạng và sáng tạo hơn, nhưng cũng có thể làm tăng khả năng nó đi lạc khỏi ngữ cảnh. Ngược lại, một giá trị temperature thấp làm cho các phản ứng của AI trở nên xác định hơn, tuân thủ chặt chẽ hơn đến dự đoán có khả năng cao nhất."
                        // content="The LLM temperature is a hyperparameter that regulates the randomness, or creativity, of the AI’s responses. A higher temperature value typically makes the output more diverse and creative but might also increase its likelihood of straying from the context. Conversely, a lower temperature value makes the AI’s responses more focused and deterministic, sticking closely to the most likely prediction"
                      />
                    </Label>
                    <SpinButton
                      // className={styles.chatSettingsSeparator}
                      // label="Temperature:"
                      disabled={vtccFlow ? true : false}
                      min={0}
                      max={1}
                      step={0.1}
                      defaultValue={temperature.toString()}
                      onChange={onTemperatureChange}
                    />
                  </div>

                  {/* <TextField
                                className={styles.chatSettingsSeparator}
                                defaultValue={promptTemplate}
                                label="Override prompt template"
                                multiline
                                autoAdjustHeight
                                onChange={onPromptTemplateChange}
                            /> */}

                  {/*<TextField*/}
                  {/*    disabled={vtccFlow ? true : false}*/}
                  {/*    className={styles.chatSettingsSeparator}*/}
                  {/*    label="Exclude category"*/}
                  {/*    onChange={onExcludeCategoryChanged}*/}
                  {/*/>*/}
                  {/* <Checkbox
                                        disabled={vtccFlow ? true : searchSource === 'VTCC' ? true : false}
                                        className={styles.chatSettingsSeparator}
                                        checked={useSemanticRanker}
                                        label="Use semantic ranker for retrieval"
                                        onChange={onUseSemanticRankerChange}
                                    />
                                    <Checkbox
                                        className={styles.chatSettingsSeparator}
                                        checked={useSemanticCaptions}
                                        label="Use query-contextual summaries instead of whole documents"
                                        onChange={onUseSemanticCaptionsChange}
                                        disabled={vtccFlow || !useSemanticRanker}
                                    /> */}
                  {/*<Checkbox*/}
                  {/*    disabled={vtccFlow ? true : false}*/}
                  {/*    styles={() => checkBoxStyles(useSuggestFollowupQuestions ? 'checked' : '')}*/}
                  {/*    className={styles.chatSettingsSeparator}*/}
                  {/*    checked={useSuggestFollowupQuestions}*/}
                  {/*    label="Suggest follow-up questions"*/}
                  {/*    onChange={onUseSuggestFollowupQuestionsChange}*/}
                  {/*/>*/}
                  {/* <PrimaryButton className={styles.chatSettingsSeparator} onClick={() => setOpenPrompt(true)}>
                                Edit Prompt
                            </PrimaryButton> */}
                </div>
              )}
              {/*{openQuestionInit && (*/}
              {/*    <>*/}
              {/*        <Button className={styles.chatSettingsSeparator} onClick={() => { setOpenQuestionInit(false), makeApiGetPrompt() }}>*/}
              {/*            <img className={styles.headerNavPageLinkIcon} src={backPng} alt="" style={{ "width": "16px", "height": "16px" }} />*/}
              {/*        </Button>*/}
              {/*        <QuestionInit */}
              {/*            getDefaultQuestion={defaultQuestion} */}
              {/*            notify = {() => notify("Cập nhật thành công")}*/}
              {/*            reload = {makeApiGetDefaultQuestion}*/}
              {/*        />*/}
              {/*        <ToastContainer />*/}
              {/*    </>*/}
              {/*)}*/}

              {/*{openWhitelist && (*/}
              {/*    <>*/}
              {/*        <Button className={styles.chatSettingsSeparator} onClick={() => { setOpenWhitelist(false), makeApiGetPrompt() }}>*/}
              {/*            <img src={backPng} alt="" style={{ "width": "16px", "height": "16px" }} />*/}
              {/*        </Button>*/}
              {/*        <WhitelistInit*/}
              {/*            // getDefaultQuestion={defaultQuestion}*/}
              {/*            notify = {() => notify("Cập nhật thành công")}*/}
              {/*            reload = {makeApiGetDefaultQuestion}*/}
              {/*        />*/}
              {/*        <ToastContainer />*/}
              {/*    </>*/}
              {/*)}*/}

              {openPrompt && (
                <div className="">
                  <div className={styles.chatSettingsSource}>
                    <Button
                      className={styles.chatSettingsSeparator}
                      onClick={() => {
                        setOpenPrompt(false)
                      }}
                    >
                      <img
                        className={styles.headerNavPageLinkIcon}
                        src={backPng}
                        alt=""
                        style={{ width: "16px", height: "16px" }}
                      />
                    </Button>
                    {/*<PrimaryButton className={styles.chatSettingsSeparator} text="Thêm mới" onClick={() => { setShowCreatePrompt(true), setIsConfigPanelOpen(false) }} />*/}
                  </div>
                  <div>
                    <Label className={styles.chatSettingsSeparator}>
                      Prompt
                    </Label>

                    <DropDownPrompt
                      optionsPrompt={promptArr}
                      setPromptSelected={setPromptSelected}
                      promptSelected={promptSelected}
                    />
                  </div>
                  {/*<FormCheck className={styles.chatSettingsSeparator}// prettier-ignore*/}
                  {/*    disabled={disabledSwitchButton ? true : false}*/}
                  {/*    type="switch"*/}
                  {/*    id="custom-switch"*/}
                  {/*    label="Xét làm prompt mặc định"*/}
                  {/*    onChange={onSetDefaultPrompt}*/}
                  {/*    checked={promptSelected && promptSelected['is_apply'] ? true : false}*/}
                  {/*/>*/}
                  {/*{*/}
                  {/*    showConfirmDefaultPrompt ? (*/}
                  {/*        <Password*/}
                  {/*            opentPopupConfirm={showConfirmDefaultPrompt}*/}
                  {/*            setOpenPopupConfirm={setShowConfirmDefaultPrompt}*/}
                  {/*            makeApiDefaultPrompt={p => makeApiDefaultPrompt(p)}*/}
                  {/*            passwordTextError={passwordTextError}*/}
                  {/*            setPasswordTextError={setPasswordTextError}*/}
                  {/*        />*/}
                  {/*    ) : null*/}
                  {/*}*/}
                  <TextField
                    className={styles.chatSettingsSeparator}
                    defaultValue={prefixPrompt}
                    value={prefixPrompt}
                    label="Promp tạo phản hồi"
                    multiline
                    autoAdjustHeight
                    onChange={onPromptPrefixChange}
                  />
                  {/*<TextField*/}
                  {/*    className={styles.chatSettingsSeparator}*/}
                  {/*    defaultValue={followUpPrompt}*/}
                  {/*    value={followUpPrompt}*/}
                  {/*    label="Promt tạo câu gợi ý tiếp theo"*/}
                  {/*    multiline*/}
                  {/*    autoAdjustHeight*/}
                  {/*    onChange={onPromptFollowUpChange}*/}
                  {/*/>*/}
                  <TextField
                    className={styles.chatSettingsSeparator}
                    defaultValue={queryPrompt}
                    value={queryPrompt}
                    label="Promt tạo câu truy vấn"
                    multiline
                    autoAdjustHeight
                    onChange={onPromptQueryChange}
                  />
                  <div
                    className={`${styles.chatSettingsSeparator} ${styles.flexEnd}`}
                  >
                    <PrimaryButton
                      style={{
                        backgroundColor: userTheme().color_bg,
                        borderColor: userTheme().color_bg,
                      }}
                      // disabled={promptSelected && !promptSelected['is_apply'] ? true
                      //     : !promptSelected ? true
                      //         : !isPromptChange ? true
                      //             : false}
                      disabled={
                        !promptSelected ? true : !isPromptChange ? true : false
                      }
                      className={`${styles.chatSettingsSeparator} ${styles.mr15}`}
                      onClick={() => {
                        setSaveChangePrompt(true),
                          setIsPromptChange(false),
                          notify("Prompt đã đưọc lưu cho phiên sử dụng này")
                      }}
                    >
                      Save
                    </PrimaryButton>
                    {/*<PrimaryButton*/}
                    {/*    disabled={promptSelected && !promptSelected['is_apply'] ? true*/}
                    {/*        : !promptSelected ? true*/}
                    {/*            : !isPromptChangeToApply ? true*/}
                    {/*                : false}*/}
                    {/*    className={styles.chatSettingsSeparator}*/}
                    {/*    onClick={() => setOpenPopupConfirm(true)}*/}
                    {/*>*/}
                    {/*    Apply*/}
                    {/*</PrimaryButton>*/}
                  </div>
                  <Dialog
                    isOpen={opentPopupConfirm}
                    onDismiss={() => {
                      setErrorEditPrompt(""),
                        setPasswordConfirm(""),
                        setOpenPopupConfirm(false)
                    }}
                    styles={{
                      main: {
                        selectors: {
                          ["@media (min-width: 480px)"]: {
                            width: 500,
                            minWidth: 300,
                            maxWidth: "1000px",
                          },
                        },
                      },
                    }}
                  >
                    <div className="5555">
                      <p
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          marginTop: "0px",
                        }}
                      >
                        Chỉnh sửa Prompt
                      </p>
                      {/* <span style={{fontSize: "16px"}}>Bạn có chắc chắn muốn chỉnh sửa Prompt?</span> */}
                      <TextField
                        className={styles.chatSettingsSeparator}
                        defaultValue={passwordConfirm}
                        label="Mật khẩu"
                        type="password"
                        autoComplete="new-password"
                        required={true}
                        errorMessage={errorEditPrompt}
                        autoAdjustHeight
                        onChange={onPasswordConfirmChange}
                      />
                      {/* <span style={{ fontSize: "14px", color: "#bc3433" }}>{errorEditPrompt}</span> */}
                    </div>
                    <DialogFooter>
                      <PrimaryButton
                        disabled={!passwordConfirm ? true : false}
                        onClick={() => onEditPrompt()}
                        text="Cập nhật"
                      />
                      <Button
                        onClick={() => {
                          setErrorEditPrompt(""),
                            setPasswordConfirm(""),
                            setOpenPopupConfirm(false)
                        }}
                        text="Đóng"
                      />
                    </DialogFooter>
                  </Dialog>
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
                  {/* <ToastContainer /> */}
                </div>
              )}
            </Panel>
            {/*{showCreatePrompt ? (*/}
            {/*    <CreatePrompt*/}
            {/*        showCreatePrompt={showCreatePrompt}*/}
            {/*        setShowCreatePrompt={setShowCreatePrompt}*/}
            {/*        promptArr={promptArr}*/}
            {/*        makeApiGetPrompt={makeApiGetPrompt}*/}
            {/*    />*/}
            {/*) : null}*/}
          </div>
        </div>
      </div>
    </>
  )
}

export default Chat
