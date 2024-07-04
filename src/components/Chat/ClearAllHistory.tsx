import { useEffect, useRef, useState } from "react";
import eventBus from "../../plugins/EventBus"
import { Modal, Button } from 'react-bootstrap';
import { Delete24Regular } from "@fluentui/react-icons";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import iconDeleteAll from "../../assets/ic_clear_all.svg"
import styles from "./ChatHistory.module.css";
import { deleteAllChatSession } from "../../api";
import { useNavigate } from "react-router-dom";
import {userTheme} from "../../utils/userTheme";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

export const ClearAllHistory = () => {
    const navigate = useNavigate()
    const firstUpdate = useRef(false);
    const [show, setShow] = useState<boolean>(false)
    const [user, setUser] = useState<any>(localStorage.getItem('_user'))
    const [showBinIcon, setShowBinIcon] = useState<boolean>(false)
    useEffect(() => {
        if (firstUpdate.current) {
            return;
        }
        if (user) {
            const userTmp = JSON.parse(user)
            setUser(userTmp)
        }
        eventBus.on("onReloadShowIcon", (data: any) => {
            setShowBinIcon(true)
        });
        eventBus.on("onReloadShowIconFalse", (data: any) => {
            setShowBinIcon(false)
        });
        firstUpdate.current = true;
        return () => { };
    }, []);
    const handleClose = () => {
        setShow(false)
    }
    const onDeleteAllChatSession = async () => {
        const request: any = {
            userId: user.userId,
        }
        const result = await deleteAllChatSession(request)
        setShowBinIcon(false)
        eventBus.dispatch('reloadChatByClearAll', {})
        eventBus.dispatch('clearChatByDeleteAll', {})
        navigate(`/chat`)
        handleClose()
    }
    const handleConfirmDelete = () => {
        onDeleteAllChatSession()
    }
    return (
        <> 
        {/* {showBinIcon ? 
        ( */}
            <div className="">
                <div id="Icon-bin-history" className={styles.buttonDeleteAllContainer} onClick={() => setShow(true)}>
                    {/* <img src={iconDeleteAll} />
                    <span className={styles.textDeleteAll}>Xóa</span> */}
                    <Delete24Regular style={{width: '20px', height: '20px'}}/>
                </div>
                <ReactTooltip
                    className={styles.customTooltipBin}
                    anchorId="Icon-bin-history"
                    place="right"
                    content="Xóa toàn bộ hội thoại"
                />
                <Modal
                    show={show}
                    onHide={() => setShow(false)}
                    dialogClassName="modal-90w"
                    centered
                    aria-labelledby="contained-modal-title-center"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            Xóa toàn bộ hội thoại
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <>
                            <p>
                                Bạn đang chuẩn bị xóa toàn bộ danh sách hội thoại. Hành động này sẽ không thể khôi phục lại. Xác nhận để tiếp tục hoặc hủy bỏ để thoát.
                            </p>
                        </>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={'light'} onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button onClick={handleConfirmDelete} style={{ backgroundColor: userTheme().color_bg, borderColor: userTheme().color_bg }}>
                            Xác nhận
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        {/* )
        : null} */}
        </>
    )
};
