import React, { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Routes, Route, Router } from "react-router-dom"
import { initializeIcons } from "@fluentui/react"
import eventBus from "./plugins/EventBus"
import { Provider } from "react-redux"
import { store } from "./redux/store"

import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"

import Login from "./pages/login/Login"
import Layout from "./pages/layout/Layout"
import NoPage from "./pages/NoPage"
import OneShot from "./pages/oneshot/OneShot"
// import Chat from "./pages/chat/Chat";
import Upload from "./pages/upload/Upload"
import ChatWithSubject from "./pages/chat-with-subject/ChatWithSubject"
import { ChatWithHistory } from "./pages/chat-with-history/ChatWithHistory"
import { isShowConfiguration } from "./utils/isShowConfiguration"
import { defaultHeader } from "./utils/localStorage"
import axios from "axios"
import { userTheme } from "./utils/userTheme"

initializeIcons("/fonts/")

export default function App() {
  const childRef = useRef(null)
  const [token, setToken] = useState(localStorage.getItem("_token"))
  const [showHeader, setHeader] = useState(true)
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false)
  const [messageRequest, setMessageRequest] = useState<string>("")
  const onExampleClicked = (event: any) => {
    setMessageRequest(event.target.innerText)
  }

  // event bus
  const firstUpdate = useRef(false)
  useEffect(() => {
    if (firstUpdate.current) {
      return
    }
    eventBus.on("onClickNavLinkExperience", (data: any) => {
      setHeader(true)
    })

    firstUpdate.current = true
    verifyUserSso()

    document.title = userTheme().layout_title
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (link) {
      link.href = userTheme().favicon
    }

    return () => {}
  }, [])
  const logout = async () => {
    try {
      await axios.post(
        import.meta.env.VITE_BASE_DOMAIN + "/auth/logout",
        {},
        {
          headers: {
            ...defaultHeader(),
          },
        }
      )
    } catch (e) {
      console.log(e)
    }

    // const typeAuthorization = localStorage.getItem('_typeAuthorization')
    localStorage.removeItem("_token")
    localStorage.removeItem("_user")
    // localStorage.removeItem('_refresh_token')
    localStorage.removeItem("_typeAuthorization")
    localStorage.removeItem("_configuaration")
    setHeader(true)
    setToken("")

    const message =
      "Phiên làm việc của bạn đã bị hết hạn. Vui lòng đăng nhập lại."
    window.location.replace(`/#/login?message=${message}`)

    document.title = userTheme().layout_title
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (link) {
      link.href = userTheme().favicon
    }
  }

  const verifyUserSso = async () => {
    if (token) {
      try {
        const { data } = await axios.post(
          import.meta.env.VITE_BASE_DOMAIN + "/auth/verify-token",
          {},
          {
            headers: {
              ...defaultHeader(),
            },
          }
        )
        if (data && data.status) {
          return
        } else {
          logout()
        }
      } catch (e) {
        console.log(e)
        logout()
      }
    }
  }

  if (!token) {
    return (
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                showHeader={showHeader}
                onClickMenu={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
                onExampleClicked={() => onExampleClicked(event)}
                token={token}
                setToken={(val: any) => setToken(val)}
                setHeader={(val: any) => setHeader(val)}
              />
            }
          ></Route>
          <Route
            path="/login"
            element={
              <Login
                setToken={(val: any) => setToken(val)}
                setHeader={(val: any) => setHeader(val)}
              />
            }
          />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </HashRouter>
    )
  }
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              showHeader={showHeader}
              onClickMenu={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
              onExampleClicked={() => onExampleClicked(event)}
              token={token}
              setToken={(val: any) => setToken(val)}
              setHeader={(val: any) => setHeader(val)}
            />
          }
        >
          <Route
            path="chat"
            element={
              <ChatWithHistory
                showHeader={showHeader}
                setHeader={(val: any) => setHeader(val)}
                messageRequest={messageRequest}
                setMessageRequest={setMessageRequest}
                isConfigPanelOpen={isConfigPanelOpen}
              />
            }
          />
          <Route
            path="chat/:id"
            element={
              <ChatWithHistory
                showHeader={showHeader}
                setHeader={(val: any) => setHeader(val)}
                messageRequest={messageRequest}
                setMessageRequest={setMessageRequest}
                isConfigPanelOpen={isConfigPanelOpen}
              />
            }
          />
          {/* <Route path="qa" element={<OneShot />} /> */}
          <Route path="*" element={<NoPage />} />
          {isShowConfiguration() && (
            <>
              <Route
                path="experience"
                element={
                  <Upload
                    showHeader={showHeader}
                    setHeader={(val: any) => setHeader(val)}
                  />
                }
              />
              <Route
                path="experience/chat"
                element={
                  <ChatWithSubject
                    setHeader={(val: any) => setHeader(val)}
                    messageRequest={messageRequest}
                    setMessageRequest={setMessageRequest}
                    isConfigPanelOpen={isConfigPanelOpen}
                  />
                }
              />
            </>
          )}
        </Route>
      </Routes>
    </HashRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
