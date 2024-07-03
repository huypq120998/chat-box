import React, { useRef, useState, useEffect } from "react"
import {
  Row,
  Col,
  Container,
  Form,
  Button,
  InputGroup,
  Alert,
} from "react-bootstrap"
import styles from "./Login.module.css"
import logo from "../../assets/logo.svg"
import chatStarSvg from "../../assets/icon-star.svg"
import icPhone from "../../assets/ic_phone_red.svg"

import {
  FaPhoneFlip,
  FaEye,
  FaEyeSlash,
  FaArrowLeftLong,
} from "react-icons/fa6"
import { FaRegUser } from "react-icons/fa"

import axios from "axios"
import { useSearchParams } from "react-router-dom"
import { encryptConfig } from "../../utils/encryptConfig"
import { userTheme } from "../../utils/userTheme"

const Login = ({ setToken, setHeader }: any) => {
  const [validated, setValidated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showMessageError, setMessageError] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setErrorMessage(message)
      setShowError(false)
    }
  }, [searchParams])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    if (!username || !password) {
      setValidated(true)
      return
    } else {
      setValidated(false)
    }

    const requestData = {
      userName: username,
      password: password,
      rememberMe: true,
    }
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_BASE_DOMAIN +
          "/api/tlacc-user-personal/loginPersonal",
        requestData
      )

      if (data) {
        if (data?.user?.isShowConfig) {
          encryptConfig(
            JSON.stringify(data.user.isShowConfig),
            "_configuaration"
          )
        }
        if (data?.user?.isShowSupContent) {
          encryptConfig(
            JSON.stringify(data.user.isShowSupContent),
            "_configuaration_sup_content"
          )
        }
        setHeader(false)
        localStorage.setItem("_token", `Bearer ${data.access_token}`)
        localStorage.setItem("_user", JSON.stringify(data.user))
        localStorage.setItem("_typeAuthorization", "OWNER")
        setToken(data.access_token)
        setHeader(false)
        window.location.replace("/#/chat")

        document.title = userTheme().layout_title
        const link = document.querySelector(
          "link[rel~='icon']"
        ) as HTMLLinkElement
        if (link) {
          link.href = userTheme().favicon
        }
      }
    } catch (e: any) {
      if (e && e.response && e.response.data && e.response.data.messages) {
        setShowError(true)
        setMessageError(e.response.data.messages.message)
        setErrorMessage("")
      }
    }
  }
  const onKeyUpSubmit = (e: any) => {
    if (e.keyCode === 13 || e.keyCode === "13") {
      handleSubmit(e)
    }
  }
  const onClickHome = (e: any) => {
    window.location.replace("/#/")
  }
  return (
    <>
      <div className={styles.pageLogin} style={{ height: "100%" }}>
        <Row style={{ height: "100%" }}>
          <Col lg={6} className={styles.pageLoginLeft}>
            <div className={styles.headerLoginLeft}>
              {/*<div onClick={onClickHome} className={styles.headerLoginLeftLogo}>*/}
              {/*    <img className={styles.headerLogo} src={logo} alt=""/>*/}
              {/*    <div style={{textAlign: "left", cursor: "pointer"}}>*/}
              {/*        <h3 className={styles.headerTitle}>Trợ lý ảo</h3>*/}
              {/*        <p className={styles.headerSubTitle}>Bộ Thông tin và Truyền thông</p>*/}
              {/*    </div>*/}
              {/*</div>*/}
              <div className={styles.headerLoginLeftContent}>
                <span
                  className={styles.iconStar}
                  style={{
                    display: "inline-block",
                    marginBottom: "1.5rem",
                    cursor: "pointer",
                  }}
                  onClick={onClickHome}
                >
                  <img src={chatStarSvg} alt="" />
                </span>
                <h1
                  className={styles.headerLoginLeftContentTitle}
                  style={{ cursor: "pointer" }}
                  onClick={onClickHome}
                >
                  Trợ lý ảo
                </h1>
                <div className={styles.headerLoginLeftContentSubTitle}>
                  Tương tác với Trợ lý ảo sử dụng công nghệ AI tiên tiến
                </div>
              </div>
            </div>
          </Col>
          <Col lg={6} className={styles.pageLoginRight}>
            <Row
              className="align-items-center justify-content-center"
              style={{ height: "100%", position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-90px",
                  left: "-30px",
                  cursor: "pointer",
                }}
                onClick={onClickHome}
              >
                <FaArrowLeftLong />
              </div>
              <Col xxl={6} xl={12} lg={12} md={12}>
                <div className={styles.formLogin}>
                  <div className={styles.formLoginHeader}>
                    <h3 className={styles.formTitle}>Đăng nhập tài khoản</h3>
                    {/*<p className={styles.formSubTitle}>Vì quy định nghành, thông tin của bạn là bắt buộc</p>*/}
                  </div>
                  <div className={styles.formLoginContent}>
                    <Form noValidate validated={validated}>
                      {showError && (
                        <Alert
                          variant="danger"
                          onClose={() => setShowError(false)}
                          dismissible
                        >
                          <div>Thông tin đăng nhập không đúng!</div>
                        </Alert>
                      )}

                      {errorMessage && (
                        <Alert
                          variant="danger"
                          onClose={() => setErrorMessage("")}
                          dismissible
                        >
                          <div>{errorMessage}</div>
                        </Alert>
                      )}

                      <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlInput1"
                      >
                        <Form.Label
                          className={`${styles.formLabel} ${styles.formLabelRequired}`}
                        >
                          Tên đăng nhập
                        </Form.Label>
                        <InputGroup className={styles.formInputGroup}>
                          <Form.Control
                            className={styles.formInput}
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            required
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyUp={onKeyUpSubmit}
                          />
                          <Button
                            tabIndex={-1}
                            className={styles.formInputIcon}
                            variant="outline-secondary"
                            id="button-addon-1"
                          >
                            <span>
                              <FaRegUser
                                style={{ fill: "var(--color-primary)" }}
                              />
                            </span>
                          </Button>
                        </InputGroup>
                        {!username && (
                          <Form.Control.Feedback type="invalid">
                            Tên đăng nhập là bắt buộc
                          </Form.Control.Feedback>
                        )}
                        {/*<Form.Control.Feedback>Looks good!</Form.Control.Feedback>*/}
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlTextarea1"
                      >
                        <Form.Label
                          className={`${styles.formLabel} ${styles.formLabelRequired}`}
                        >
                          Mật khẩu
                        </Form.Label>
                        <InputGroup className={styles.formInputGroup}>
                          <Form.Control
                            className={styles.formInput}
                            type={`${!showPassword ? "password" : "text"}`}
                            placeholder="Nhập mật khẩu"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyUp={onKeyUpSubmit}
                          />
                          <Button
                            tabIndex={-1}
                            className={styles.formInputIcon}
                            variant="outline-secondary"
                            id="button-addon-2"
                          >
                            <span
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {!showPassword && (
                                <FaEye
                                  style={{ fill: "var(--color-primary)" }}
                                />
                              )}
                              {showPassword && (
                                <FaEyeSlash
                                  style={{ fill: "var(--color-primary)" }}
                                ></FaEyeSlash>
                              )}
                            </span>
                          </Button>
                        </InputGroup>
                        {!password && (
                          <Form.Control.Feedback type="invalid">
                            Mật khẩu là bắt buộc
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Form>
                  </div>
                  <div className={styles.formLoginSubmit}>
                    <div
                      className={styles.formBtnSubmit}
                      onClick={handleSubmit}
                      onKeyUp={onKeyUpSubmit}
                    >
                      Đăng nhập
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default Login
