import { Text } from "@fluentui/react";
import { useEffect, useRef, useState } from "react";
import { MdLogout } from "react-icons/md"
import eventBus from "../../plugins/EventBus"
import { SplitButton, Dropdown, Modal, Button } from 'react-bootstrap';

import iconDeleteAll from "../../assets/ic_clear_all.svg"
import styles from "./ChatHistory.module.css";
import { deleteAllChatSession } from "../../api";
import {userTheme} from "../../utils/userTheme";

interface Props {
    className?: string;
    clearChat: () => void;
    setOpenConfirmClearChat?: any;
    openConfirmClearChat?:boolean
}

export const ConfirmClearChatPopup = ({clearChat, openConfirmClearChat, setOpenConfirmClearChat}: Props) => {

    return (
        <>
            <div className="">
                <Modal
                    show={openConfirmClearChat}
                    onHide={() => setOpenConfirmClearChat(false)}
                    dialogClassName="modal-90w"
                    centered
                    aria-labelledby="contained-modal-title-center"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            Xóa lịch sử chat
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <>
                            <p>
                            Thao tác này sẽ xoá các hoạt động liên quan, chẳng hạn như các câu lệnh, câu trả lời và ý kiến phản hồi khỏi Hoạt động của bạn tại hội thoại này.
                            </p>
                        </>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={'light'} onClick={() => setOpenConfirmClearChat(false)}>
                            Hủy
                        </Button>
                        <Button onClick={clearChat} style={{ backgroundColor: userTheme().color_bg, borderColor: userTheme().color_bg }}>
                            Xác nhận
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    )
};
