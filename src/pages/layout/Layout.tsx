import { Outlet, NavLink, Link, useParams } from "react-router-dom"
import {
  Modal,
  Button,
  Tab,
  Tabs,
  InputGroup,
  Dropdown,
  Form,
} from "react-bootstrap"
import LogoutIc from "../../assets/ic_logout2.svg"
import DropdownId from "../../assets/ic_dropdown.svg"
import DropdownIdWhite from "../../assets/ic_dropdown_white.svg"

import _, { cloneDeep, filter, forEach, map } from "lodash"

import chatMainRed from "../../assets/chatMainRed.svg"
import chatMainWhite from "../../assets/chatMainWhite.svg"
import thunghiem from "../../assets/thunghiem.svg"
import thunghiemred from "../../assets/thunghiemred.svg"
import thunghiemWhite from "../../assets/thunghiemWhite.svg"

import listChatSvg from "../../assets/listChat.svg"
import chatStarSvg from "../../assets/icon-star.svg"
import downloadIcon from "../../assets/ic_download.svg"
import downloadIconWhite from "../../assets/ic_downloadWhite.svg"

import menuMobile from "../../assets/ic_mobile_menu.svg"
import eventBus from "../../plugins/EventBus"
import { initTooltip } from "../../utils/tooltip"
import { FaBars } from "react-icons/fa"
import ChangePass from "../../assets/ic_change_pass.svg"

import styles from "./Layout.module.css"
import { useEffect, useRef, useState } from "react"
import set = Reflect.set
import axios from "axios"
import InfiniteScroll from "./InfiniteScroll"
import { useViewport } from "../../hooks/useViewport"
import { ChangePassword } from "../../components/Password"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ModelDownload } from "../../components/Layout"
import {
  getMobileOperatingSystem,
  makeDownloadApp,
} from "../../utils/urlDownloadApp"
import { BannerScreen } from "./BannerScreen"
import { isShowConfiguration } from "../../utils/isShowConfiguration"
import { defaultHeader } from "../../utils/localStorage"

import { userTheme } from "../../utils/userTheme"

const Layout = ({ showHeader, token, setToken, setHeader }: any) => {
  const params = useParams()
  const viewPort = useViewport()
  const isMobile = viewPort.width <= 768
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [lawTypes, setLawTypes] = useState<any>([])
  const [lawTypesNameActive, setLawTypesNameActive] = useState<any>("")
  const [page, setPage] = useState(0)
  const [lawDocuments, setLawDocuments] = useState<any>([])
  const [searchLawDocuments, setSearchLawDocuments] = useState<
    string | undefined
  >("")
  const [lawDocumentsDefault, setLawDocumentsDefault] = useState<any>([])
  const [isExperience, setIsExperience] = useState<boolean>(false)
  const firstUpdate = useRef(false)
  const [user, setUser] = useState<any>(localStorage.getItem("_user"))
  const [show, setShow] = useState<boolean>(false)
  const [openDownloadModal, setOpenDownloadModal] = useState<boolean>(false)
  const [noDataLaw, setNoDataLaw] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>("")
  const [datadocumentTypeActive, setDatadocumentTypeActive] = useState<any>([])
  const [lawTypeActiveSearch, setLawTypesActiveSearch] = useState<any>(null)
  useEffect(() => {
    const url = window.location.href
    if (url && url.endsWith("experience")) {
      document.body.classList.add("overflow-auto")
    } else {
      document.body.classList.remove("overflow-auto")
    }
  }, [isExperience])
  useEffect(() => {
    if (firstUpdate.current) {
      return
    }

    if (user) {
      const userTmp = JSON.parse(user)
      setUser(userTmp)
    }

    const url = window.location.href
    if (url && url.endsWith("experience")) {
      setIsExperience(true)
    } else {
      setIsExperience(false)
    }
    eventBus.on("logOutNavbar", (data: any) => {
      logout()
    })
    eventBus.on("redirectHomePageNavbar", (data: any) => {
      onClickLogo()
    })

    eventBus.on("dispatch-unauthorized", () => {
      logoutWithVerify()
    })

    firstUpdate.current = true
    return () => {}
  }, [])

  const onClickLogo = () => {
    setIsExperience(false)
    setHeader(true)
    // eventBus.dispatch('clearChat', {})
  }
  const openDialogDownload = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const type = getMobileOperatingSystem()
    if (type === "ios" || type === "android") {
      makeDownloadApp(type)
    } else {
      setOpenDownloadModal(true)
    }
  }
  const makeApiDownloadApp = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const type = getMobileOperatingSystem()

    if (type) {
      makeDownloadApp(type)
    }
  }
  const onClickLogin = () => {
    window.location.replace("/#/login")
  }
  const onClickBtnExperience = () => {
    if (token) {
      window.location.replace("/#/chat")
    } else {
      window.location.replace("/#/login")
    }
  }
  const onClickNavLinkExperience = (type = "") => {
    setIsExperience(true)
    eventBus.dispatch("onClickNavLinkExperience", {})
  }
  const onClickNavLink = (e: any, type = "home") => {
    if (token) {
      if (type === "experience") {
        setIsExperience(true)
        eventBus.dispatch("onClickNavLinkExperience", {})
      } else {
        setIsExperience(false)
      }
    } else {
      onClickLogin()
      e.preventDefault()
      e.stopPropagation()
    }
  }
  const closeLawDocumentSupportPopup = () => {
    setOpenDialog(false)
    setNoDataLaw(false)
    setPage(0)
    setLawDocuments([])
    setLawDocumentsDefault([])
    setLawTypesNameActive("")
    setSearchLawDocuments("")
    setLawTypesActiveSearch(null)
    setSearchText("")
    localStorage.removeItem("lawDocuments")
  }
  const openNavMobile = () => {
    const url = window.location.href
    const isUrlSessionChat =
      url && (url.endsWith("chat") || url.endsWith(`chat/${params.id}`))
    if (url && url.endsWith("experience/chat")) {
      eventBus.dispatch("onOpenNavbarMobileExperience", {})
    } else if (isUrlSessionChat) {
      eventBus.dispatch("onOpenNavbarMobile", {})
    }
  }
  useEffect(() => {
    if (page === 0) {
      changeLawType()
    }
  }, [lawTypesNameActive])

  useEffect(() => {
    changeLawType()
    getLawTypes()
    // LoadSearch()
  }, [searchLawDocuments])

  const LoadSearch = async () => {
    const resultLawTypes: any = []
    await forEach(lawTypes, async (v, idx) => {
      const { data: dataDocument } = await axios.get(
        `https://amb.cyberbot.vn/api/judgment/lawDocuments?type=` +
          v.name +
          "&word=" +
          searchLawDocuments
      )
      v = { ...v, totalLaw: dataDocument?.quantity }
      resultLawTypes.push(v)
    })
  }

  useEffect(() => {
    if (page > 0) {
      let timer = setTimeout(() => changeLawType(), 1000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [page])

  useEffect(() => {
    localStorage.setItem("lawDocuments", JSON.stringify(lawDocuments))
  }, [lawDocuments])

  useEffect(() => {
    if (isMobile) {
      setOpenDownloadModal(false)
    }
  }, [isMobile])

  const getLawTypes = async () => {
    const { data } = await axios.get(
      `https://amb.cyberbot.vn/api/judgment/getLawDocumentByTypes?word=${searchLawDocuments}`
    )
    if (data && data.data) {
      setLawTypes(data.data)
      getLawtypeActiveBySearch(data.data)
    }
  }

  const getLawtypeActiveBySearch = async (lawTypesData: any) => {
    const lawTypesActiveList = filter(lawTypesData, (v, ind) => v.totalLaw)
    if (lawTypesActiveList && lawTypesActiveList.length && searchLawDocuments) {
      onSelectTabs(lawTypesActiveList[0].id)
    }
  }

  const changeLawType = async () => {
    let lawDocumentList = []
    const lawDocumentlocal = JSON.parse(
      localStorage.getItem("lawDocuments") || "{}"
    )
    lawDocumentList =
      lawDocumentlocal && lawDocumentlocal?.length ? lawDocumentlocal : []

    try {
      const { data: dataDocument } = await axios.get(
        `https://amb.cyberbot.vn/api/judgment/lawDocuments?size=10&page=${page}&word=` +
          searchLawDocuments +
          "&type=" +
          lawTypesNameActive
      )
      setDatadocumentTypeActive(dataDocument)
      if (dataDocument && dataDocument.data) {
        const resultData = dataDocument.data
        _.forEach(resultData, function (law, keyLaw) {
          let html = '<div class="row" style="text-align: left">'
          if (law.documentCode) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Số hiệu văn bản</span>: ' +
              law.documentCode
            html += "    </div>"
          }
          if (law.validityStatus) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Tình trạng hiệu lực</span>: ' +
              law.validityStatus
            html += "    </div>"
          }
          if (law.agencyIssued) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Cơ quan ban hành</span>: ' +
              law.agencyIssued
            html += "    </div>"
          }
          if (law.applyDate) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Ngày áp dụng</span>: ' + law.applyDate
            html += "    </div>"
          }
          if (law.passedDate) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Ngày thông qua</span>: ' +
              law.passedDate
            html += "    </div>"
          }
          if (law.documentType) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Loại văn bản</span>: ' +
              law.documentType
            html += "    </div>"
          }
          if (law.publicationDate) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Ngày công báo</span>: ' +
              law.publicationDate
            html += "    </div>"
          }
          if (law.signedBy) {
            html += '<div class="mb-2 col-6">'
            html += '<span class="font-medium">Người ký</span>: ' + law.signedBy
            html += "    </div>"
          }
          if (law.dateIssued) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Ngày ban hành</span>: ' +
              law.dateIssued
            html += "    </div>"
          }
          if (law.field) {
            html += '<div class="mb-2 col-6">'
            html += '<span class="font-medium">Lĩnh vực</span>: ' + law.field
            html += "    </div>"
          }
          if (law.decision) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Quyết định</span>: ' + law.decision
            html += "    </div>"
          }
          if (law.legalRelation) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Quan hệ pháp luật</span>: ' +
              law.legalRelation
            html += "    </div>"
          }
          if (law.courtType) {
            html += '<div class="mb-2 col-6">'
            html += '<span class="font-medium">Tòa án</span>: ' + law.courtType
            html += "    </div>"
          }
          if (law.level) {
            html += '<div class="mb-2 col-6">'
            html += '<span class="font-medium">Cấp</span>: ' + law.level
            html += "    </div>"
          }
          if (law.applyPrecedent) {
            html += '<div class="mb-2 col-6">'
            html += law.applyPrecedent
            html += "    </div>"
          }
          if (law.expirationDate) {
            html += '<div class="mb-2 col-6">'
            html +=
              '<span class="font-medium">Ngày hết hiệu lực</span>: ' +
              law.expirationDate
            html += "    </div>"
          }

          html += "</div>"

          resultData[keyLaw].tooltip = html
        })
        // setLawDocuments(resultData)
        if (page > 0 && resultData && resultData.length) {
          setNoDataLaw(false)
          setLawDocuments([...lawDocumentList, ...resultData])
        } else if (resultData && resultData.length) {
          setNoDataLaw(false)
          setLawDocuments(resultData)
        } else if (
          searchLawDocuments &&
          page === 0 &&
          resultData &&
          !resultData.length
        ) {
          setNoDataLaw(true)
        }
        setLawDocumentsDefault(resultData)
      }
    } catch (e) {
      console.log(e)
    }
  }
  const loadLawDocuments = async () => {
    if (!lawDocuments || (lawDocuments && !lawDocuments.length)) {
      try {
        const { data } = await axios.get(
          "https://amb.cyberbot.vn/api/judgment/getLawDocumentByTypes"
        )
        if (data && data.data) {
          setLawTypes(data.data)
          setLawTypesNameActive(data.data[0].name)
        }
      } catch (e) {
        console.log(e)
      } finally {
      }
    }
    if (lawDocumentsDefault && lawDocumentsDefault.length) {
      setLawDocuments(lawDocumentsDefault)
    }
    setTimeout(() => {
      initTooltip()
    })
    setOpenDialog(true)
  }
  const onClickLaw = (data: any) => {
    if (data && data.url) {
      window.open(data.url, "_blank")
    }
  }
  const onChangeSearch = (event: any) => {
    setPage(0)
    const input = event.target.value
    if (event.keyCode === 13 || event.keyCode === "13") {
      if (input) {
        setSearchLawDocuments(input)
        // const documentTmp = _.cloneDeep(lawDocumentsDefault);
        // _.forEach(documentTmp, function (item, key) {
        //     const lawFilter = _.filter(item.lawDocuments, function (o) {
        //         return o.title && o.title.includes(input)
        //     });
        //     documentTmp[key].lawDocuments = lawFilter
        // })
        // setLawDocuments(documentTmp)
      } else {
        // setLawDocuments(lawDocumentsDefault)
      }
    }
    if (!input) {
      setSearchLawDocuments(searchText)
    }
  }
  const onSelectTabs = (key: any) => {
    const lawTypeActive = _.find(lawTypes, ["id", key])
    setLawTypesActiveSearch(lawTypeActive)
    if (lawTypeActive) {
      setPage(0)
      setLawTypesNameActive(lawTypeActive.name)

      const inputSearch = document.getElementById(
        "input-search-document-support"
      ) as HTMLInputElement
      if (inputSearch) {
        const valueInput = inputSearch.value
        setSearchLawDocuments(valueInput)
      }
    }

    setTimeout(() => {
      initTooltip()
    })

    // const searchBtn = document.getElementById('btn-search-document-support');
    // if (searchBtn) {
    //     searchBtn.click();
    // }
  }
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

    localStorage.removeItem("_token")
    localStorage.removeItem("_user")
    // localStorage.removeItem('_refresh_token')
    localStorage.removeItem("_typeAuthorization")
    localStorage.removeItem("_configuaration")
    localStorage.removeItem("_configuaration_sup_content")
    setHeader(true)
    setToken("")

    window.location.replace("/#/")

    document.title = userTheme().layout_title
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (link) {
      link.href = userTheme().favicon
    }
  }
  const logoutWithVerify = async () => {
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
  }
  const openModelChangePass = () => {
    setShow(true)
  }
  // const onExampleClicked = (event: any) => {
  //     const message = event.target.innerText
  //     eventBus.dispatch('onExampleClicked', { message })
  // }
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
      rtl: false,
    })
  return (
    <div
      className={`${styles.layout} ${showHeader ? styles.layoutHeader : ""}`}
      style={{
        backgroundImage: showHeader ? `url(${userTheme().layout_bg})` : "",
      }}
    >
      <header
        className={showHeader ? `${styles.showBgHeader}` : `${styles.header}`}
        role={"banner"}
        style={{
          backgroundImage: showHeader ? "" : `url(${userTheme().header_main})`,
        }}
      >
        <div
          className={`${
            showHeader ? styles.boxHeader : styles.boxHeaderBorder
          }`}
        >
          <div
            className={`${styles.headerContainer} ${
              !showHeader ? styles.headerContainerSpace : ""
            }`}
            style={{
              padding:
                isMobile && !token
                  ? "10px 20px 10px 20px"
                  : isMobile && !showHeader
                  ? "10px 0px"
                  : isMobile
                  ? "10px 0 10px 20px"
                  : "",
            }}
          >
            <Link
              to="/"
              className={styles.headerTitleContainer}
              style={{ display: isMobile && !showHeader ? "none" : "block" }}
            >
              <div className={styles.headerLeft} onClick={onClickLogo}>
                <img
                  className={styles.headerLogo}
                  src={showHeader ? userTheme().logo : userTheme().logo_mimi}
                  alt=""
                />
                <div style={{ position: "relative" }}>
                  <h3
                    className={`${styles.headerTitle}`}
                    style={{
                      fontSize: isMobile ? "1rem" : "",
                      color: showHeader
                        ? userTheme().color_text
                        : userTheme().color_text_no_header,
                    }}
                  >
                    {userTheme().layout_title}
                  </h3>
                  {/* <Button className={showHeader ? styles.badeExperienceShowHeader : styles.badeExperience}>Thử nghiệm</Button> */}
                  {/*<div className={showHeader ? styles.badeExperienceShowHeader : styles.badeExperience}>Thử nghiệm</div>*/}
                </div>
              </div>
            </Link>
            <div
              className={styles.openNavMobileIcon}
              onClick={openNavMobile}
              style={{ display: showHeader ? "none" : "" }}
            >
              <img src={menuMobile} />
            </div>
            {isShowConfiguration() && (
              <nav>
                <ul
                  className={styles.headerNavList}
                  style={{ display: isMobile && showHeader ? "none" : "flex" }}
                >
                  {token && (
                    <li
                      className={styles.headerNavLeftMargin}
                      style={{ marginRight: "2rem" }}
                    >
                      <NavLink
                        to="/chat"
                        onClick={(e) => onClickNavLink(e, "home")}
                        className={({ isActive }) =>
                          isActive
                            ? styles.headerNavPageLinkActive
                            : styles.headerNavPageLink
                        }
                        style={({ isActive }) =>
                          isActive
                            ? {
                                borderBottomColor:
                                  userTheme().color_text_no_header,
                              }
                            : {}
                        }
                      >
                        <img
                          className={styles.headerNavPageLinkIcon}
                          src={
                            showHeader
                              ? userTheme().chat_main
                              : userTheme().chat_main_no_header
                          }
                          alt=""
                        />
                        <span
                          className={`${styles.headerNavPageLinkName}`}
                          style={{
                            color: showHeader
                              ? userTheme().color_text
                              : userTheme().color_text_no_header,
                          }}
                        >
                          Trò chuyện
                        </span>
                      </NavLink>
                    </li>
                  )}
                  {token && (
                    <li>
                      <NavLink
                        to="/experience"
                        onClick={(e) => onClickNavLink(e, "experience")}
                        className={({ isActive }) =>
                          isActive
                            ? styles.headerNavPageLinkActive
                            : styles.headerNavPageLink
                        }
                      >
                        <img
                          className={styles.headerNavPageLinkIcon}
                          src={
                            showHeader
                              ? userTheme().thu_nghiem
                              : userTheme().thu_nghiem_no_header
                          }
                          alt=""
                          style={{ marginTop: "3px" }}
                        />
                        <span
                          className={`${styles.headerNavPageLinkName}`}
                          style={{
                            color: showHeader
                              ? userTheme().color_text
                              : userTheme().color_text_no_header,
                          }}
                        >
                          Thử nghiệm
                        </span>
                      </NavLink>
                    </li>
                  )}
                </ul>
              </nav>
            )}
            {token && (
              <div className={styles.headerRight}>
                {/*<div className={styles.iconDownload} onClick={() => openDialogDownload(event)}>*/}
                {/*    <img src={showHeader ? downloadIcon : downloadIconWhite} />*/}
                {/*</div>*/}
                {openDownloadModal ? (
                  <div className={styles.boxModelDownload}>
                    <ModelDownload
                      openDowloadModal={openDownloadModal}
                      closeDownloadModal={() => setOpenDownloadModal(false)}
                    />
                  </div>
                ) : null}
                {user && user.avatar && (
                  <img className="me-3" src={user.avatar} alt="" />
                  // <span className="me-3">{user.fullname}</span>
                )}
                {user && user.fullname && (
                  <>
                    <span
                      className={`${styles.headerUserName} me-3`}
                      style={{
                        color: showHeader
                          ? userTheme().color_text
                          : userTheme().color_text_no_header,
                      }}
                    >
                      {user.fullname}
                    </span>
                    <div className={styles.boxLogoutChangePass}>
                      <Dropdown>
                        <Dropdown.Toggle
                          className={showHeader ? "" : styles.iconMenuMobile}
                        >
                          <span>
                            <img
                              src={showHeader ? DropdownId : DropdownIdWhite}
                              style={{ width: "16px", height: "16px" }}
                            />
                          </span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item>
                            <div
                              className={styles.boxLogout}
                              style={{ marginLeft: "0px" }}
                              onClick={openModelChangePass}
                            >
                              <img src={ChangePass} />
                              <span style={{ color: userTheme().color_text }}>
                                {" "}
                                Đổi mật khẩu
                              </span>
                            </div>
                            {show && (
                              <ChangePassword
                                show={show}
                                setShow={setShow}
                                notify={notify}
                              />
                            )}
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <div className={styles.boxLogout} onClick={logout}>
                              <img src={LogoutIc} />
                              <span style={{ color: userTheme().color_text }}>
                                Đăng xuất
                              </span>
                            </div>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </>
                )}
                <div
                  className={styles.headerMenuMobile}
                  style={{ display: !showHeader ? "none" : "" }}
                >
                  <div
                    className=""
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {/*<div onClick={() => makeApiDownloadApp(event)}>*/}
                    {/*    <img src={downloadIcon} />*/}
                    {/*</div>*/}
                    <Dropdown>
                      <Dropdown.Toggle
                        variant=""
                        className={styles.iconMenuMobile}
                      >
                        <span style={{ color: "#000" }}>
                          <FaBars></FaBars>
                        </span>
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item
                          href="#/chat"
                          onClick={(e) => onClickNavLink(e, "home")}
                        >
                          Hội thoại
                        </Dropdown.Item>
                        {isShowConfiguration() && (
                          <Dropdown.Item
                            href="#/experience"
                            onClick={(e) => onClickNavLink(e, "experience")}
                          >
                            Thử nghiệm
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                {/* <span title="Đăng xuất" style={{ fontSize: "24px", cursor: "pointer", color: "#AFAFAF", display: isMobile && !showHeader ? 'none' : 'block' }} onClick={logout}><MdLogout/></span> */}
              </div>
            )}
            {!token && (
              <div>
                <Button
                  className={`${styles.btnLogin} ${styles.btnLoginStyle}`}
                  onClick={onClickLogin}
                >
                  Đăng nhập
                </Button>
              </div>
            )}
          </div>
        </div>
        {!isExperience && (
          // <div className={styles.headerBoxIntro} style={{ textAlign: "center", padding: '100px 30px 0 30px', display: showHeader ? "block" : "none" }}>
          //     <span className={styles.iconStar} style={{ display: "inline-block", marginBottom: "1.5rem" }}><img src={chatStarSvg} alt="" /></span>
          //     <div className="mb-5">
          //         <h1 className={styles.headerBoxIntroTitle} style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: "bold" }}>
          //             Trò chuyện với dữ liệu <span style={{ display: "inline-block", position: "relative" }}>
          //                 chuyên ngành
          //                 <img onClick={loadLawDocuments} className={styles.headerNavPageLinkIcon} src={seeMore} alt="" style={{ "width": "20px", "height": "20px", cursor: "pointer", marginLeft: "10px", position: "absolute", top: "10px", right: "-30px" }} />
          //             </span>
          //         </h1>
          //         <p className={styles.headerBoxIntroSubTitle}>Tương tác với Trợ lý ảo sử dụng công nghệ AI tiên tiến</p>
          //     </div>
          //     <div>
          //         <Button className={styles.btnExperience} variant="primary" onClick={onClickBtnExperience}>Trải nghiệm ngay</Button>
          //     </div>
          // </div>
          <div className="" style={{ display: showHeader ? "block" : "none" }}>
            <BannerScreen
              onClickBtnExperience={onClickBtnExperience}
              loadLawDocuments={loadLawDocuments}
            />
          </div>
        )}

        {isExperience && (
          <div
            className={styles.headerBoxIntro}
            style={{
              textAlign: "center",
              padding: "100px 30px 0 30px",
              display: showHeader ? "block" : "none",
            }}
          >
            <span
              className={styles.iconStar}
              style={{ display: "inline-block", marginBottom: "1.5rem" }}
            >
              <img src={userTheme().star} alt="" />
            </span>
            <div>
              <h1
                className={styles.headerBoxIntroTitle}
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "10px",
                  fontWeight: "bold",
                }}
              >
                Tải một tài liệu để bắt đầu...
              </h1>
              <p className={styles.headerBoxIntroSubTitle}>
                Tương tác thông minh với văn bản bất kỳ
              </p>
            </div>
          </div>
        )}

        <Modal
          className="modal-document-support"
          show={openDialog}
          size="lg"
          aria-labelledby="contained-modal-title-center"
          centered
          scrollable
          onHide={closeLawDocumentSupportPopup}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-center">
              Các văn bản hỗ trợ hiện tại
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ overflowX: "inherit" }}>
            <InputGroup className="me-4 mb-3">
              <Form.Control
                onKeyUp={onChangeSearch}
                type="text"
                id="input-search-document-support"
                className=""
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                onClick={onChangeSearch}
                variant="primary"
                id="btn-search-document-support"
              >
                Tìm
              </Button>
            </InputGroup>
            {lawDocuments && (
              <Tabs
                // defaultActiveKey={lawTypesNameActive.id}
                transition={false}
                activeKey={lawTypeActiveSearch?.id}
                id="noanim-tab-example"
                className={`mb-3 ${styles.tabActive}`}
                onSelect={onSelectTabs}
              >
                {/*{lawDocuments.map((document: any, i: any) => (*/}
                {/*    <Tab eventKey={document.id} title={document.name} key={i}>*/}
                {/*        {document && document.lawDocuments && (*/}
                {/*            <div className="">*/}
                {/*                <ol>*/}
                {/*                    {document.lawDocuments.map((law: any, i: any) => (*/}
                {/*                        <li onClick={() => onClickLaw(law)} style={{marginBottom: "8px", cursor: "pointer"}} key={i} data-tooltip-container data-tooltip-label={law.tooltip}>{law.title}</li>*/}
                {/*                    ))}*/}
                {/*                </ol>*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </Tab>*/}
                {/*))}*/}

                {lawTypes.map((document: any, i: any) => (
                  <Tab
                    eventKey={document.id}
                    title={`${document.name} (${document.totalLaw})`}
                    key={i}
                    style={{ maxHeight: "450px" }}
                  >
                    {lawDocuments && lawDocuments.length && !noDataLaw ? (
                      <div className="">
                        <ol>
                          {/* {lawDocuments.map((law: any, i: any) => (
                                                            <li onClick={() => onClickLaw(law)} style={{marginBottom: "8px", cursor: "pointer"}} key={i} data-tooltip-container data-tooltip-label={law.tooltip}>{law.title}</li>
                                                        ))} */}
                          <InfiniteScroll
                            // loader={<p>Đang tải...</p>}
                            className="w-[800px] mx-auto my-10"
                            fetchMore={() => setPage((prev) => prev + 1)}
                            hasMore={lawDocuments.length < document.totalLaw}
                            // endMessage={<p>Đã tải hết</p>}
                          >
                            {lawDocuments.map((law: any, i: any) => (
                              <li
                                onClick={() => onClickLaw(law)}
                                style={{
                                  marginBottom: "8px",
                                  cursor: "pointer",
                                }}
                                key={i}
                                data-tooltip-container
                                data-tooltip-label={law.tooltip}
                              >
                                {law.title}
                              </li>
                            ))}
                          </InfiniteScroll>
                        </ol>
                      </div>
                    ) : (
                      <div style={{ paddingLeft: "1rem", color: "#ccc" }}>
                        Không có dữ liệu...
                      </div>
                    )}
                  </Tab>
                ))}
              </Tabs>
            )}

            {/* {lawDocuments && lawDocuments.length === 0 && (
                            <Tabs
                                transition={false}
                                id="noanim-tab-example"
                                className="mb-3"
                                onSelect={onSelectTabs}
                            >
                                {lawTypes.map((document: any, i: any) => (
                                    <Tab eventKey={document.id} title={`${document.name} (${document.totalLaw})`} key={i}>
                                        <div style={{ paddingLeft: "1rem", color: "#ccc" }}>Không có dữ liệu...</div>
                                    </Tab>
                                ))}
                            </Tabs>
                        )} */}
          </Modal.Body>
          <Modal.Footer>
            {/*<div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>*/}
            {/*<FormControl onChange={onChangeSearch} type="text" className="me-4" placeholder="Nhập từ khóa..."></FormControl>*/}
            {/*<InputGroup className="me-4">*/}
            {/*    <FormControl onKeyDown={onChangeSearch} type="text" className="" placeholder="Nhập từ khóa..."></FormControl>*/}
            {/*    <Button onClick={onChangeSearch} variant="primary" id="search-document-support">Tìm</Button>*/}
            {/*</InputGroup>*/}
            {/*</div>*/}
            <Button onClick={closeLawDocumentSupportPopup}>Đóng</Button>
          </Modal.Footer>
        </Modal>

        {/* { !isExperience && (
                    <div className={styles.headerBoxExample} style={{ display: showHeader ? "flex" : "none", alignItems: "center", justifyContent: "center", padding: "0 30px" }}>
                        <div className={styles.headerBoxExampleItem} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", borderRadius: "8px" }}>
                            <div className={styles.headerBoxExampleItemIcon} style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: '1rem'}}>
                                <img style={{ marginRight: '0.5rem'}} src={raisingHandsSvg} alt=""/>
                                <span className={styles.headerBoxExampleItemTextTop} style={{fontSize: '1.5rem'}}>Khám phá thông tin vô tận</span>
                            </div>
                        </div>
                        <div className={`${styles.headerBoxExampleItemMiddle} ${styles.headerBoxExampleItem}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", margin: "120px 40px 0 40px" }}>
                            <div className={styles.headerBoxExampleItemIcon} style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: '1rem'}}>
                                <img style={{ marginRight: '0.5rem'}} src={faceWithMonocle} alt=""/>
                                <span className={styles.headerBoxExampleItemTextTop} style={{fontSize: '1.5rem'}}>Trò chuyện đầy sáng tạo</span>
                            </div>
                        </div>
                        <div className={styles.headerBoxExampleItem} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <div className={styles.headerBoxExampleItemIcon} style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: '1rem'}}>
                                <img style={{ marginRight: '0.5rem'}} src={artistPalette} alt=""/>
                                <span className={styles.headerBoxExampleItemTextTop} style={{fontSize: '1.5rem'}}>Hiệu quả hóa công việc</span>
                            </div>
                        </div>
                    </div>
                ) } */}
        {/* <ToastContainer /> */}
      </header>

      <Outlet />
    </div>
  )
}

export default Layout
