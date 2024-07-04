import { useMemo, forwardRef, useState, useEffect, useRef} from "react";
import { Stack, TextField } from "@fluentui/react";
import moment from 'moment'
import styles from "./ChatHistory.module.css";
import { BsThreeDotsVertical } from 'react-icons/bs';
import eventBus from "../../plugins/EventBus"
import { Dropdown, Modal, Button } from 'react-bootstrap';
import { editChatSession, pinChatSession, deleteChatSession } from "../../api";
import addChat from "../../assets/thunghiemred.svg"
import Chat from "../../assets/Chat.svg"
import Pin from "../../assets/pin.svg"
import Delete from "../../assets/delete.svg"
import Edit from "../../assets/edit.svg"
import { cloneDeep } from 'lodash'
import CloseSidebar from "../../assets/Group.svg"
import { ClearAllHistory } from "./ClearAllHistory";
import { NavbarChatHeader } from "./NavbarChatHeader";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "../../hooks/useStore";
import {userTheme} from "../../utils/userTheme";

export const ChatHistory = observer(({setIsOpen, height, setIdChatBySessionName, chatBySession, chatSessionList, setChatSessionList, reloadData, isDisableNewchatButton, isMobile }: any) => {
    const navigate = useNavigate()
    const params = useParams();
    const {
        rootStore: { sessionChatsStore },
      } = useStore();

    const [show, setShow] = useState(false);
    const [styleNewChat, setStyleNewChat] = useState({})
    const [textAction, setTextAction] = useState<string>("")
    const [textInput, setTextInput] = useState<string>("")
    const [sessionId, setSessionId] = useState<string>("")
    const [displayOpenSidebar, setDisplayOpenSidebar] = useState<boolean>(!isMobile ? false : true)
    // const CustomToggle = forwardRef(({ children, onClick }: any, ref: any) => (
    //     <a
    //         href=""
    //         ref={ref}
    //         onClick={(e: any) => {
    //             e.preventDefault();
    //             onClick(e);
    //         }}
    //     >
    //         {/* {children} */}
    //         <BsThreeDotsVertical className="xxxxx" style={{ "width": "14px", "height": "14px", color: '#222' }} />
    //     </a>
    // ));

    const onClickNewChat = () => {
        navigate(`/chat`)
        setIdChatBySessionName("")
        const conversationTmp = cloneDeep(chatSessionList)
                conversationTmp.map((item: any, key: any) => {
                    item.active = false
                    return item;
                });
        setChatSessionList(conversationTmp);
        setIsOpen()
        eventBus.dispatch('newChatSession', {})
    };
    const onClickCloseChatSesionMenu = () => {
        setIsOpen(false)
    }
    useEffect(() => {
        if(!params?.id) {
            setStyleNewChat((prev) => ({...prev, opacity: '0.6', cursor: 'initial'}))
        }else {
            setStyleNewChat((prev) => ({...prev, opacity: '1', cursor: 'pointer'}))
        }
    }, [params])

    const firstUpdate = useRef(false);
    useEffect(() => {
        if (firstUpdate.current) {
            return;
        }
        eventBus.on("closeMenuChat", (data: any) => {
            closeSidebar()
        }); 
        return () => {
        };
    }, [])
    const eventDateConverted = (dateIncoming: any) => {
        if (dateIncoming) {
            moment.locale('vi')
            const dateConverted = new Date(dateIncoming)
            const dt = moment(dateConverted, 'YYYY-MM-DD HH:mm:ss')
            const dayName = dt.format('dddd')
            const dayNameShort = dayName.substring(0, 3)
            const fullDate = dt.format('DD/MM/YYYY')
            const timeDate = dt.format('HH:mm')
            return { date: fullDate, dayName: dayNameShort, time: timeDate }
        }
    }
    const onActionInputChange = (_ev?: React.FormEvent, newValue?: string) => {
        setTextInput(newValue || "");
    };
    const handleClose = () => setShow(false);
    const onHandleClickAction = (chat: any, action: string) => {
        setTextAction(action)
        if (action === 'unpin') {
            onUnPinChatSession(chat?.id)
            setShow(false)
        } else if (action === 'pin') {
            onPinChatSession(chat?.id)
            setShow(false)
        } else {
            setShow(true)
        }
        setTextInput(chat?.sessionName || "");
        setSessionId(chat?.id || "");
    }

    const onEditChatSession = async () => {
        const request: any = {
            sessionId: sessionId,
            sessionName: textInput
        }
        const result = await editChatSession(request)
        sessionChatsStore.editItem(sessionId, textInput)
        // reloadData()
        handleClose()
    }
    const onPinChatSession = async (id: string) => {
        const request: any = {
            sessionId: id,
            pinned: true
        }
        const result = await pinChatSession(request)
        eventBus.dispatch('reloadChatPinUnpin', {id: id, pinned: true})
        // reloadData()
        handleClose()
    }
    const onUnPinChatSession = async (id: string) => {
        const request: any = {
            sessionId: id,
            pinned: false
        }
        const result = await pinChatSession(request)
        eventBus.dispatch('reloadChatPinUnpin', {id: id, pinned: false})
        // reloadData()
        handleClose()
    }
    const onDeleteChatSession = async () => {
        const request: any = {
            sessionId: sessionId,
        }
        const result = await deleteChatSession(request)
        setIdChatBySessionName("")
        sessionChatsStore.removeChatById(sessionId)

        if(params.id && params.id === sessionId) {
            navigate(`/chat`)
            eventBus.dispatch('clearChatByDelete', {})
        }
    
        handleClose()
    }
    const handleAction = () => {
        // textAction === 'Ghim' ? onPinChatSession() : 
        textAction === 'rename' ? onEditChatSession() :
        textAction === 'delete' ? onDeleteChatSession() : null
    }

    const closeSidebar = () => {
        setDisplayOpenSidebar(true)
        const temp = document.querySelector("#historyContainer")
        temp?.classList.add("historyContainerClose");
    }
    const openSidebar = () => {
        eventBus.dispatch('closeAnalysisPanel', {})
        const temp = document.querySelector("#historyContainer")
        temp?.classList.remove("historyContainerClose");
        setDisplayOpenSidebar(false)
    }

    const listChatUnpin = useMemo(() => {
        const result = chatSessionList.filter((v: any) => v.pinned)
        return result
    }, [chatSessionList])
    const listChatPin = useMemo(() => {
        const result = chatSessionList.filter((v: any) => !v.pinned)
        return result
    }, [chatSessionList])

    return (
        <Stack verticalAlign="space-between" style={{ position: 'relative' }}>
            {displayOpenSidebar && !isMobile &&
                <div className="" style={{ position: 'absolute', right: '-60px', top: '20px', cursor: 'pointer', transform: 'rotate(180deg)' }} onClick={openSidebar}>
                    <img src={CloseSidebar} />
                </div>
            }
            <div className="">
                <NavbarChatHeader onCloseNavbar = {() => setIsOpen(false)}/>
            </div>
            <div className={`${isMobile ? styles.historyContainerMobile : styles.historyContainer}`} id="historyContainer" >
                <div className={styles.newChatMobile} onClick={() => {`${!params.id ? onClickCloseChatSesionMenu() : onClickNewChat()}`}}>
                    <div className={styles.newChatMobileButton}>
                        <img src={userTheme().addchat}/>
                        <span className={styles.textNewChatMobile} style={{ color: userTheme().color_bg }}>Thêm mới trò chuyện</span>
                    </div>
                </div>
                <div className={`${isMobile ? styles.headerChatSeesionMobile : styles.headerChatSeesion}`} style={{ position: 'relative' }}>
                    <div style={{ justifyContent: 'center', alignItems: 'center', height: '60px', gap: 10, display: 'flex' }}>
                        <div style={{ color: '#2B3674', fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                            Danh sách trò chuyện
                            {(chatSessionList.length) ? (
                                <span className={styles.countChatSeesion}>{chatSessionList.length > 9 ? chatSessionList.length : `0${chatSessionList.length}`}</span>
                            ) : null}
                        </div>
                    </div>
                    {/* <Search/> */}
                    { chatSessionList && chatSessionList.length ? 
                        <ClearAllHistory/> : null
                    } 
                    {!isMobile && 
                        <div className="" style={{ position: 'absolute', right: '-24px', top: '20px', cursor: 'pointer' }} onClick={closeSidebar}>
                            <img src={CloseSidebar} />
                        </div>
                    }
                </div>
                <div className={`${styles.sessionContainer} ${styles.newChatDesk}`} style={{backgroundColor: `${!params.id ? 'transparent' : ''}`, textAlign: 'center'}}>
                    <Button
                        style={{...styleNewChat, width: '80%', background: 'rgba(0, 0, 0, 0)', boxShadow: '0px -1px 0px #E9E9E9 inset', borderColor: userTheme().color_bg, borderRadius: '50px', cursor: 'pointer'}}
                        onClick={() => {`${!params.id ? null : onClickNewChat()}`}}
                    >
                        <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', gap: 16, display: 'inline-flex' }}>
                            <div style={{ width: 24, height: 24, position: 'relative' }}>
                                <div style={{ width: 20, height: 20, left: 2, top: 0, position: 'absolute' }}>
                                    <img src={userTheme().addchat} alt="" />
                                </div>
                            </div>
                            <div style={{ color: userTheme().color_bg, fontSize: '15px', fontWeight: '500', lineHeight: "35px", wordWrap: 'break-word' }} >Thêm mới trò chuyện</div>
                        </div>
                    </Button>
                </div>
                <div className={`${styles.overflowContainer}`}>
                    <div 
                        className={`${styles.chatSettingsSeparator} ${styles.sessionScroll} ${isMobile ? styles.sessionScrollHeightMobile : styles.sessionScrollHeight}`} 
                        style={{ marginBottom: '30px', height: `${height}px` }}
                    >
                        {/* <div style={{cursor: 'pointer'}} className={`${styles.addNewButton}`} onClick={onClickNewChat}>
                            <img src={plus} alt="" style={{"width": "16px", "height": "16px", marginRight: '12px'}}/>
                            <span className={`${styles.textNewButton}`}>{`Cuộc trò chuyện mới`}</span>
                        </div> */}
                        {(listChatUnpin.length) ? (
                            <div style={{ marginBottom: '16px' }}>
                                <p className={`${styles.titleContainer} ${styles.textOverline}`}  style={{ color: userTheme().color_text }}>Đã ghim</p>
                                {listChatUnpin.map((chat: any, idx: any) => (
                                    <div key={idx} className={`${idx == chat.length - 1 ? styles.conversationsNoborder : styles.conversationsContainer}`} style={{ position: 'relative'}}>
                                        <div className={`${styles.conversation} ${chat.active ? styles.conversationActive : ''}`} style={{ height: '64px' }} onClick={() => chatBySession(chat, idx, event)}>

                                            <div className={`${styles.iconContainer}`}>
                                                <img src={Chat} alt="" style={{ color: '#3DBFFE' }} />
                                            </div>
                                            <div className="" style={{ position: 'relative' }}>
                                                <div className="" style={{ display: 'flex', justifyContent: 'space-between', width: '230px' }}>
                                                    <span className={`${styles.conversationTittle} ${styles.conversationMessages}`} style={{ fontSize: '15px', fontWeight: '600', wordWrap: 'break-word', color: chat.active ? userTheme().color_text: '' }}>
                                                        {chat.sessionName}</span>
                                                    <div style={{ color: '#A5ACB8', fontSize: '13px', fontWeight: '400', wordWrap: 'break-word' }}>
                                                        {eventDateConverted(chat?.createdAt)?.date}</div>

                                                </div>
                                                <span className={`${styles.conversationTittle} ${styles.conversationMessages}`} style={{ left: 0, top: '30px', position: 'absolute', width: '225px', color: '#858E96', fontSize: 14, fontWeight: '500', wordWrap: 'break-word' }}>
                                                    {chat?.firstMessage}
                                                </span>

                                            </div>
                                        </div>
                                        <div className={styles.conversationActionMore}>
                                            <Dropdown drop="end">
                                                {/* <Dropdown.Toggle as={CustomToggle}>
                                                                        </Dropdown.Toggle> */}
                                                <Dropdown.Toggle variant="success" className={styles.dropdownDot}>
                                                    <BsThreeDotsVertical className="" style={{ "width": "14px", "height": "14px", color: '#222' }} />
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu style={{ zIndex: '99999999' }} popperConfig={{ strategy: "fixed", }} renderOnMount>
                                                    <Dropdown.Item onClick={() => onHandleClickAction(chat, 'unpin')}>
                                                        <div className="" style={{ display: 'flex', alignItems: 'center' }}>
                                                            <img src={Pin} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} />  Bỏ ghim
                                                        </div>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => onHandleClickAction(chat, 'rename')}>
                                                        <div className="" style={{ display: 'flex', alignItems: 'center' }}>
                                                            <img src={Edit} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} /> Đổi tên
                                                        </div>
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item onClick={() => onHandleClickAction(chat, 'delete')}>
                                                        <div className="" style={{ display: 'flex', alignItems: 'center' }}>

                                                            <img src={Delete} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} />Xóa
                                                        </div>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <>
                        {(listChatPin.length) ? (
                            <>
                                <p className={`${styles.titleContainer} ${styles.textOverline}`} style={{ color: userTheme().color_text }}>Gần đây</p>
                                {listChatPin.map((chat: any, idx: any) => (
                                    <div key={idx} className={`${styles.conversationsContainer}`} style={{ position: 'relative' }}>
                                        <div className={`${styles.conversation} ${chat.active ? styles.conversationActive : ''}`} style={{ height: '64px' }} onClick={() => chatBySession(chat, idx, event)}>

                                            <div className={`${styles.iconContainer}`}>
                                                <img src={Chat} alt="" style={{ color: '#3DBFFE' }} />
                                            </div>
                                            <div className="" style={{ position: 'relative' }}>
                                                <div className="" style={{ display: 'flex', justifyContent: 'space-between', width: '230px' }}>
                                                    <span className={`${styles.conversationTittle} ${styles.conversationMessages}`} style={{fontSize: '15px', fontWeight: '600', wordWrap: 'break-word', color: chat.active ? userTheme().color_text: '' }}>
                                                        {chat.sessionName}</span>
                                                    <div style={{ color: '#A5ACB8', fontSize: '13px', fontWeight: '400', wordWrap: 'break-word' }}>{eventDateConverted(chat?.createdAt)?.date}</div>

                                                </div>
                                                <span className={`${styles.conversationTittle} ${styles.conversationMessages}`} style={{ left: 0, top: '30px', position: 'absolute', width: '225px', color: '#858E96', fontSize: 14, fontWeight: '500', wordWrap: 'break-word' }}>
                                                    {chat?.firstMessage}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.conversationActionMore}>
                                            <Dropdown drop="end">
                                                {/* <Dropdown.Toggle as={CustomToggle}>
                                                </Dropdown.Toggle> */}
                                                <Dropdown.Toggle variant="success" className={styles.dropdownDot}>
                                                    <BsThreeDotsVertical className="" style={{ "width": "14px", "height": "14px", color: '#222' }} />
                                                    </Dropdown.Toggle>

                                                <Dropdown.Menu style={{ zIndex: '999999' }} popperConfig={{ strategy: 'fixed'}} renderOnMount>
                                                    <Dropdown.Item onClick={() => onHandleClickAction(chat, 'pin')}>
                                                        <div className="">

                                                            <img src={Pin} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} />  Ghim
                                                        </div>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => onHandleClickAction(chat, 'rename')}>
                                                        <div className="" style={{ display: 'flex', alignItems: 'center' }}>

                                                            <img src={Edit} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} /> Đổi tên
                                                        </div>
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item onClick={() => onHandleClickAction(chat, 'delete')}>
                                                        <div className="" style={{ display: 'flex', alignItems: 'center' }}>

                                                            <img src={Delete} alt="" style={{ color: '#3DBFFE', marginRight: '8px' }} /> Xóa
                                                        </div>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : null}
                            
                        </>
                    </div>
                    <Modal
                        show={show}
                        onHide={() => setShow(false)}
                        dialogClassName="modal-90w"
                        centered
                        aria-labelledby="contained-modal-title-center"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="example-custom-modal-styling-title">
                                {textAction === 'pin' ? 'Ghim cuộc trò chuyện này' : textAction === 'rename' ? 'Đổi tên cho cuộc trò chuyện này' : textAction === 'delete' ? 'Bạn muốn xoá cuộc trò chuyện?' : ''}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {textAction !== 'delete' ? (
                                <>
                                    <TextField defaultValue={textInput} className={styles.chatSettingsSeparator} onChange={onActionInputChange} />
                                </>
                            ) : (
                                <>
                                    <p>
                                        Bạn sẽ không còn nhìn thấy cuộc trò chuyện này ở đây nữa. Thao tác này cũng sẽ xoá các hoạt động liên quan,
                                        chẳng hạn như các câu lệnh, câu trả lời và ý kiến phản hồi.
                                    </p>
                                </>
                            )}

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant={'light'} onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button onClick={handleAction}  style={{ backgroundColor: userTheme().color_bg, borderColor: userTheme().color_bg }}>
                                {textAction === 'pin' ? 'Ghim' : textAction === 'rename' ? 'Đổi tên' : textAction === 'delete' ? 'Xác nhận' : ''}

                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </Stack>
    );
});
