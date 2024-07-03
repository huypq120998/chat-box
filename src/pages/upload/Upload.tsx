import React, { useRef, useState, useEffect } from "react"
import styles from "./Upload.module.css"
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  ProgressBar,
} from "react-bootstrap"
import fromUrlSvg from "../../assets/fromUrl.svg"
import raisingHandsSvg from "../../assets/raisingHands.svg"
import eventBus from "../../plugins/EventBus"
import { LiaCloudUploadAltSolid } from "react-icons/lia"
import { PiFileDocLight } from "react-icons/pi"
import { cloneDeep, findIndex, forEach } from "lodash"
import uploadSvg from "../../assets/upload.svg"
import officeDoc from "../../assets/office-doc.svg"
import { uploadFileApi } from "../../api"
import axios from "axios"
import {
  getConversationStorage,
  setConversationStorage,
} from "../../utils/conversationExperience"
import { defaultHeader } from "../../utils/localStorage"

const Upload = ({ showHeader, setHeader }: any) => {
  const [showAlert, setShowAlert] = useState(false)
  const [showProcess, setShowProcess] = useState(false)
  const [messageAlert, setMessageAlert] = useState("")
  // const [cancelUpload, setCancelUpload] = useState(false);
  const cancelUpload = useRef<any>(false)
  const [intervalID, setIntervalID] = useState<any>(null)
  const [fileUpload, setFileUpload] = useState({
    name: "Example.pdf",
    dataPass: 0,
    percent: 0,
    fileSize: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getConversation()

    return () => {}
  }, [])

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

      if (data && data.length) {
        dispatchUpload()
      }
    } catch (e) {
      console.log(e)
    }
  }
  const dispatchUpload = () => {
    setHeader(false)
    window.location.replace("/#/experience/chat")
    // eventBus.dispatch('showSideBar', {})
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
        return false
      }

      // check 1 file upload
      if (isLoading) {
        setMessageAlert("Hệ thống chỉ hỗ trợ tải lên 1 tệp tại đây")
        setShowAlert(true)
        return false
      }

      setMessageAlert("")
      setShowAlert(false)

      const file = e.target.files[0]
      handleUploadFile(file)
    }
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
      setShowAlert(true)
      return false
    }

    const fileSize = file.size
    let fileMB: any = fileSize / 1024 ** 2
    fileMB = fileMB.toFixed(2)
    fileMB = Number(fileMB)
    if (fileMB > 10) {
      setMessageAlert("Tệp tải lên quá lớn. Vượt quá kích thước 10MB cho phép!")
      setShowAlert(true)
      return false
    }

    // upload file
    try {
      const fileUploadTmp = cloneDeep(fileUpload)
      fileUploadTmp.name = file.name
      fileUploadTmp.fileSize = fileMB
      setFileUpload(fileUploadTmp)

      setIsLoading(true)

      const userLocal = JSON.parse(localStorage.getItem("_user") || "{}")
      const userId = userLocal?.userId

      uploadFileApi({ file, userId })
        .then(async (result) => {
          if (result && result._id) {
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
                const fileUploadTmp = cloneDeep(fileUpload)
                fileUploadTmp.name = file.name
                switch (data.status) {
                  case "UPLOADING":
                    fileUploadTmp.percent = 25
                    const tmpFileMBUpload: any = (fileMB / 4).toFixed(2)
                    fileUploadTmp.dataPass = tmpFileMBUpload
                    break
                  case "PARSING":
                    fileUploadTmp.percent = 50
                    const tmpFileMBParsing: any = (fileMB / 2).toFixed(2)
                    fileUploadTmp.dataPass = tmpFileMBParsing
                    break
                  case "INDEXING":
                    fileUploadTmp.percent = 75
                    const tmpFileMBIndexing: any = (fileMB / 1.75).toFixed(2)
                    fileUploadTmp.dataPass = tmpFileMBIndexing
                    break
                  case "DONE":
                    fileUploadTmp.percent = 100
                    fileUploadTmp.dataPass = fileMB

                    setIsLoading(false)
                    setMessageAlert("")
                    setShowAlert(false)
                    if (!cancelUpload.current) {
                      dispatchUpload()
                    }
                    setShowProcess(false)
                    resetFileUpload()
                    cancelUpload.current = false
                    clearInterval(interval)
                    break
                }
                setFileUpload(fileUploadTmp)
              }
            }, 2000)

            setIntervalID(interval)

            setShowProcess(true)
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
                // setMessageAlert('');
                // setShowAlert(false)
                // if (!cancelUpload.current) {
                //     dispatchUpload();
                // }
              })
              .catch((e: any) => {
                console.log("e.response.data", e.response.data)

                if (
                  e &&
                  e.response &&
                  e.response.data &&
                  e.response.data.error
                ) {
                  setMessageAlert(e.response.data.error)
                  setShowAlert(true)
                  setIsLoading(false)
                  resetFileUpload()
                  setShowProcess(false)
                  clearInterval(interval)
                }
                // if (!cancelUpload.current) {
                //     if (e && e.response && e.response.data && e.response.data.error) {
                //         setMessageAlert(e.response.data.error)
                //         setShowAlert(true)
                //     } else {
                //         setMessageAlert('Tải lên thất bại, vui lòng thử lại!')
                //         setShowAlert(true)
                //     }
                // }
              })
              .finally(() => {
                // clearInterval(interval)
                // setIsLoading(false)
                // cancelUpload.current = false
                // resetFileUpload();
                // setShowProcess(false)
              })
          }
        })
        .catch((e: any) => {
          let error = "Có lỗi xảy ra trong quá trình tải tệp. Vui lòng thử lại!"
          if (e && e.response && e.response.data && e.response.data.error) {
            error = e.response.data.error
          }
          setMessageAlert(error)
          setShowAlert(true)
          setIsLoading(false)
          resetFileUpload()
        })
    } catch (e) {
      setMessageAlert("Lỗi kết nối đến máy chủ!")
      setShowAlert(true)
      setIsLoading(false)
      resetFileUpload()
    }
  }

  const resetFileUpload = () => {
    setFileUpload({
      name: "Example.pdf",
      dataPass: 0,
      percent: 0,
      fileSize: 0,
    })
  }

  const onCancelUpload = () => {
    cancelUpload.current = true
    setIsLoading(false)
    if (intervalID) {
      clearInterval(intervalID)
    }
    setFileUpload({
      name: "Example.pdf",
      dataPass: 0,
      percent: 0,
      fileSize: 0,
    })
  }

  // triggers when file is drag`
  const handleDrag = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const handleDragContainer = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    return false
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
        return false
      }

      // check 1 file upload
      if (isLoading) {
        setMessageAlert("Hệ thống chỉ hỗ trợ tải lên 1 tệp tại đây")
        setShowAlert(true)
        return false
      }

      const file = e.dataTransfer.files[0]
      handleUploadFile(file)
    }

    return false
  }

  return (
    <>
      <div className={styles.uploadHeader}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={12} xxl={9} xl={12} md={12}>
              <Card
                className={styles.cardUpload}
                onDragEnter={handleDragContainer}
                onDragLeave={handleDragContainer}
                onDragOver={handleDragContainer}
              >
                <Card.Body className={styles.cardBodyUpload}>
                  {showAlert && (
                    <Alert
                      className="mb-3"
                      variant="danger"
                      onClose={() => setShowAlert(false)}
                      dismissible
                    >
                      <p className="mb-0">{messageAlert}</p>
                    </Alert>
                  )}
                  <div
                    className={styles.uploadContainer}
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
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <div
                      className={styles.uploadContent}
                      onClick={onClickUploadFile}
                    >
                      <div className={`${styles.uploadContentIcon} me-4`}>
                        <span
                          style={{
                            fontSize: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/*<LiaCloudUploadAltSolid/>*/}
                          {/*    <FiUploadCloud style={{ color: "#a2a5a8"}}/>*/}
                          <img src={uploadSvg} alt="" />
                        </span>
                      </div>
                      <div
                        className={`${styles.uploadContentText} me-4 text-start`}
                        style={{ flex: "1" }}
                      >
                        <div className="mb-1">
                          <span>
                            Chọn 01 tài liệu hoặc kéo thả file tại đây
                          </span>
                        </div>
                        <div>
                          <span
                            style={{ fontSize: "0.875rem", color: "#b9bbbc" }}
                          >
                            DOC, DOCX, TXT hoặc PDF, dung lượng không quá 10MB
                          </span>
                        </div>
                      </div>
                      <Button
                        className={`${styles.uploadContentBtn} btnUpload`}
                        style={{
                          textTransform: "uppercase",
                          background:
                            "linear-gradient(135deg, #3DBFFD 0%, #1DE9B6 100%)",
                          border: "0.50px rgba(15, 145, 210, 0.70) solid",
                        }}
                      >
                        Chọn File
                      </Button>
                    </div>
                  </div>

                  {showProcess ? (
                    <div className={styles.uploadProcess}>
                      <span
                        className="me-3"
                        style={{
                          fontSize: "40px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img src={officeDoc} alt="" />
                      </span>
                      <div className={styles.uploadProcessContent}>
                        <div className={styles.uploadProcessContentInfo}>
                          <span>{fileUpload.name}</span>
                          <span style={{ color: "#6c6c6c" }}>
                            {fileUpload.dataPass}MB
                          </span>
                        </div>
                        <div className={styles.uploadProcessMain}>
                          <ProgressBar
                            animated
                            now={fileUpload.percent}
                            style={{ height: "0.375rem" }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close porcess"
                        onClick={onCancelUpload}
                      ></button>
                    </div>
                  ) : null}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}

export default Upload
