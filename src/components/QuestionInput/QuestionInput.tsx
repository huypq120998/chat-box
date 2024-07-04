import { useEffect, useRef, useState, forwardRef, useCallback } from "react";
import { Stack, TextField } from "@fluentui/react";
import chatWhiteSvg from "../../assets/chatWhite.svg"
import sentSvg from "../../assets/sent.svg"
import sendRed from "../../assets/send_red.svg"
import ic_speak from "../../assets/speak.gif"
import { AiOutlineClose } from "react-icons/ai";

import styles from "./QuestionInput.module.css";
import { useViewport } from "../../hooks/useViewport";
import eventBus from "../../plugins/EventBus";
import ChatVoice from "../MicrophoneRecorder/Voice";
import {userTheme} from "../../utils/userTheme";


interface Props {
    onSend: (question: string) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend }: Props) => {
    const viewPort = useViewport();
    const isMobile = viewPort.width <= 768;
    const [question, setQuestion] = useState<string>("");
    const [disableInput, setDisableInput] = useState<boolean>(false);
    const [textListening, setTextListening] = useState<string>("")
    const [hideListening, setHideListening] = useState<boolean>(true)
    const [isCssInputchange, setIsCssInputchange] = useState<boolean>(false);

    const firstUpdate = useRef(false);
    useEffect(() => {
        if (firstUpdate.current) {
            return;
        }
        isUserPermission()
        eventBus.on('empty-conversation', (data: any) => {
            if (data) {
                setQuestion('');
            }
            setDisableInput(data)
        });

        firstUpdate.current = true;
        return () => { };
    }, []);
    const handleUserKeyPress = (event: any) => {
        if (disabled) {
            return;
        }
        const { key, keyCode } = event;
        if (keyCode === 32) {
            if (event.target && event.target.localName !== 'input' && event.target.localName !== 'textarea') {
                hideListening ? eventBus.dispatch('startRecordingParent', {}) : stopRecording()
            }

        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleUserKeyPress);
        return () => {
            window.removeEventListener("keydown", handleUserKeyPress);
        };
    }, [handleUserKeyPress]);

    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }
        onSend(question);

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    // const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    const onQuestionChange = (event: any) => {
        const newValue = event.target.value
        if (!newValue) {
            setQuestion("");
        } else if (newValue.length <= 1000) {
            setQuestion(newValue);
        }
    };

    const sendQuestionDisabled = disabled || !question.trim();

    const clearQuestion = () => {
        setQuestion("");
    }

    const makeChatVoice = (textVoice: string) => {
        setQuestion("");
        setTextListening(textVoice)
    }

    const changeRecord = (val: boolean) => {
        setHideListening(val)
    }

    const sendTextMess = (t: string) => {
        onSend(t)
        setTextListening("")
    }

    const stopRecording = () => {
        eventBus.dispatch('stopRecordingParent', {})
        setHideListening(true)
        setTextListening("")
    }
    const startVoice = () => {
        setTextListening("")
    }

    const isUserPermission = () => {
        const userLocal = JSON.parse(localStorage.getItem('_user') || '{}')
        const isHavePermission = userLocal?.username === "0345923535" || userLocal?.username === "0362752732"
        return isHavePermission
    }

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (textareaRef && textareaRef.current) {
          textareaRef.current.style.height = "0px";
          const scrollHeight = textareaRef.current.scrollHeight;
          setIsCssInputchange(scrollHeight > 28 ? true : false)
          textareaRef.current.style.height = scrollHeight + "px";
        }
      }, [question]);


    return (
        <>
            {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stack horizontal className={styles.questionInputContainer}>
                    <textarea 
                        className={styles.questionInputTextArea2} 
                        rows={2} disabled={disableInput} 
                        value={question} 
                        style={{ width: "100%", marginTop: isMobile ? '6px' : '4px', border: "none", outline: "none", background: "#fff", lineHeight: isMobile ? '100%' : ''}} 
                        onChange={onQuestionChange} 
                        onKeyDown={onEnterPress}
                        placeholder={'Đặt câu hỏi tại đây...'}
                    />
                    <img src={sendRed} alt="" style={{maxHeight: "24px", marginRight: "10px", marginTop: "6px", cursor: 'pointer'}} />

                    <div className={styles.questionInputCircle}></div>
                    <div className={`${styles.questionInputDot} ${styles.questionInputDotTop}`}></div>
                    <div className={`${styles.questionInputDot} ${styles.questionInputDotBottom}`}></div>
                </Stack>
                <div className={`${styles.questionInputSendButton} ${isMobile ? styles.questionInputSendButtonMobile : ''}`} onClick={sendQuestion}>
                    <img src={sendRed} alt="" style={{maxHeight: "24px", marginRight: "10px", marginTop: "6px", cursor: 'pointer'}} />
                </div>
            </div> */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!hideListening &&
                    <div style={{ width: '100%', display: "flex", alignItems: "center", justifyContent: "start" }}>
                        <span>{textListening}</span>
                    </div>
                }
                <Stack horizontal className={styles.questionInputContainer} style={{ display: !hideListening ? 'none' : 'flex' }}>
                    {/* <img src={chatWhiteSvg} alt="" style={{maxHeight: "24px", marginRight: "10px", marginTop: "2px"}} /> */}
                    <textarea
                        ref={textareaRef}
                        className={styles.questionInputTextArea2}
                        // rows = {textareaheight}
                        disabled={disableInput}
                        value={question}
                        style={{height: '160px', width: "100%", marginLeft: '10px', marginTop: isMobile ? '6px' : '4px', border: "none", outline: "none", background: "#fff", lineHeight: isMobile ? '100%' : '' }} onChange={onQuestionChange} onKeyDown={onEnterPress}
                        placeholder={'Đặt câu hỏi tại đây...'}>
                    </textarea>

                    {
                        question ?
                            <button className={styles.clearButton} onClick={clearQuestion}>
                                <AiOutlineClose></AiOutlineClose>
                            </button> :
                            <>
                                {
                                    isUserPermission() ?
                                        <ChatVoice
                                            makeChatVoice={(q: string) => makeChatVoice(q)}
                                            changeRecord={(v: boolean) => changeRecord(v)}
                                            onSendText={(t: string) => sendTextMess(t)}
                                            stopRecording={stopRecording}
                                            startVoice={startVoice}
                                            disabled={disabled}
                                        /> : null
                                }
                            </>
                    }
                    {!isCssInputchange ? 
                        <div className={styles.questionInputCircle}></div> 
                        : null
                    }
                    
                    <div className={`${styles.questionInputDot} ${styles.questionInputDotTop}`}></div>
                    <div className={`${styles.questionInputDot} ${styles.questionInputDotBottom}`}></div>
                </Stack>

                {!hideListening &&
                    <div className={`${styles.questionInputSendButton} ${isMobile ? styles.questionInputSendButtonMobile : ''}`} onClick={stopRecording}>
                        <img src={ic_speak} alt="" style={{ maxHeight: "70px", height: isMobile ? '60px' : '70px' }} />
                    </div>
                }
                {hideListening &&
                    <div className={`${styles.questionInputSendButton} ${isMobile ? styles.questionInputSendButtonMobile : ''}`} onClick={sendQuestion}>
                        <img src={userTheme().sendred} alt="" style={{ maxHeight: "24px", height: isMobile ? '20px' : '22px' }} />
                    </div>}
            </div>
        </>
    );
};
