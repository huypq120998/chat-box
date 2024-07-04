import { useEffect, useRef, useState } from "react";
import eventBus from "../../plugins/EventBus"
import { Modal, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import "react-tooltip/dist/react-tooltip.css";
import styles from "./Password.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import closeModel from "../../assets/close.png"
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {userTheme} from "../../utils/userTheme";



interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

export const ChangePassword = ({show, setShow, notify}: any) => {
    // const [show, setShow] = useState<boolean>(false)
    const [validated, setValidated] = useState(false);
    const [username, setUsername] = useState('');
    const [passwordOld, setPasswordOld] = useState('');
    const [passwordNew, setPasswordNew] = useState('');
    const [passwordNewConfirm, setPasswordNewConfirm] = useState('');
    const [showError, setShowError] = useState(false);
    const [showMessageError, setMessageError] = useState(true);
    const [messageErrorText, setMessageErrorText] = useState<string>("")
    const [showPasswordOld, setShowPasswordOld] = useState(false);
    const [showPasswordNew, setShowPasswordNew] = useState(false);
    const [showPasswordNewConfirm, setShowPasswordNewConfirm] = useState(false);
    const [user, setUser] = useState<any>(localStorage.getItem('_user'))
    const firstUpdate = useRef(false);

    useEffect(() => {
        if (firstUpdate.current) {
            return;
        }
        if (user) {
            const userTmp = JSON.parse(user)
            setUser(userTmp)
        }
        firstUpdate.current = true;
        return () => { };
    }, []);


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (!passwordNew || !passwordNewConfirm || !passwordOld) {
            setValidated(true);
            return;
        } else if(passwordNewConfirm !== passwordNew) {
            setShowError(true)
            setMessageErrorText('Mật khẩu nhập lại không khớp')
            setValidated(true);
            return;
        } else {
            setValidated(false);
        }
        const requestData = {
            userName: user.username,
            password: passwordNew,
            oldPassword: passwordOld
        };
        const token = localStorage.getItem('_token')
        try {
            const { data } = await axios.post(import.meta.env.VITE_BASE_DOMAIN + '/api/tlacc-user-personal/changePassword', requestData, { headers: {"Authorization" : `${token}`} });

            if (data && data.messages && data.messages.status === 200) {
                notify("Đổi mật khẩu thành công")
                handleCloseModel()
            }
        } catch (e: any) {
            if (e && e.response && e.response.data && e.response.data.messages) {
                setShowError(true)
                setMessageErrorText(e.response.data.messages.message === 'New password must be difference old password!' ? "Mật khẩu mới phải khác mật khẩu cũ!" : e.response.data.messages.message);
            }

        }
    };
    const onKeyUpSubmit = (e: any) => {
        if (e.keyCode === 13 || e.keyCode === '13') {
            handleSubmit(e)
        }
    };
    const onClickHome = (e: any) => {
        window.location.replace('/#/');
    };
    const handleCloseModel = () => {
        setPasswordOld("")
        setPasswordNew("")
        setPasswordNewConfirm("")
        setShowPasswordOld(false)
        setShowPasswordNew(false)
        setShowPasswordNewConfirm(false)
        setShowError(false)
        setMessageErrorText("")
        setShow(false)
    }
    // const notify = (e: any) => toast.success(`${e}`, {
    //     position: "top-right",
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: "light",
    //     rtl: false
    // });
    return (
        <>
            <div className={styles.changePasswordContainer}>
                {/* <div className={styles.boxChangePass} onClick={() => setShow(true)}>
                    <img src={ChangePass}/>
                    <span> Đổi mật khẩu</span>
                </div> */}
                <Modal
                    show={show}
                    onHide={handleCloseModel}
                    dialogClassName="modal-90w"
                    centered
                    animation={false}
                    aria-labelledby="contained-modal-title-center"
                    className="myModelChangePass"
                >
                    <Modal.Body>
                        <>
                            <div className={styles.formLogin}>
                                <div className={styles.closeIconModelBox} onClick={handleCloseModel} >
                                    <img className={styles.closeIconModel} src={closeModel}/>
                                </div>
                                <div className={styles.formLoginHeader}>
                                    <h3 className={styles.formTitle}>Đổi mật khẩu</h3>
                                    <span className={styles.formTitleDes}>Vui lòng nhập các thông tin dưới đây</span>
                                    {/*<p className={styles.formSubTitle}>Vì quy định nghành, thông tin của bạn là bắt buộc</p>*/}
                                </div>
                                <div className={styles.formLoginContent}>
                                    <Form noValidate validated={validated}>

                                        {showError && (
                                            <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                                                <div>{messageErrorText}</div>
                                            </Alert>
                                        )}

                                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Nhập mật khẩu cũ</Form.Label>
                                            <InputGroup className={styles.formInputGroup}>
                                                <Form.Control
                                                    className={styles.formInput}
                                                    type={`${!showPasswordOld ? 'password' : 'text'}`}
                                                    placeholder="Nhập mật khẩu" required
                                                    onChange={(e) => setPasswordOld(e.target.value)}
                                                    onKeyUp={onKeyUpSubmit}
                                                />
                                                <Button tabIndex={-1} className={styles.formInputIcon} variant="outline-secondary" id="button-addon-2">
                                                    <span onClick={() => setShowPasswordOld(!showPasswordOld)}>
                                                        {!showPasswordOld && (
                                                            <FaEye style={{fill: userTheme().color_bg}} />
                                                        )}
                                                        {showPasswordOld && (
                                                            <FaEyeSlash style={{fill: userTheme().color_bg}}></FaEyeSlash>
                                                        )}
                                                    </span>
                                                </Button>
                                            </InputGroup>
                                            {!passwordOld && (
                                                <Form.Control.Feedback type="invalid">Mật khẩu là bắt buộc</Form.Control.Feedback>
                                            )}
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Nhập mật khẩu mới</Form.Label>
                                            <InputGroup className={styles.formInputGroup}>
                                                <Form.Control
                                                    className={styles.formInput}
                                                    type={`${!showPasswordNew ? 'password' : 'text'}`}
                                                    placeholder="Nhập mật khẩu" required
                                                    onChange={(e) => setPasswordNew(e.target.value)}
                                                    onKeyUp={onKeyUpSubmit}
                                                />
                                                <Button tabIndex={-1} className={styles.formInputIcon} variant="outline-secondary" id="button-addon-2">
                                                    <span onClick={() => setShowPasswordNew(!showPasswordNew)}>
                                                        {!showPasswordNew && (
                                                            <FaEye style={{fill: userTheme().color_bg}} />
                                                        )}
                                                        {showPasswordNew && (
                                                            <FaEyeSlash style={{fill: userTheme().color_bg}}></FaEyeSlash>
                                                        )}
                                                    </span>
                                                </Button>
                                            </InputGroup>
                                            {!passwordNew && (
                                                <Form.Control.Feedback type="invalid">Mật khẩu là bắt buộc</Form.Control.Feedback>
                                            )}
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Nhắc lại mật khẩu mới</Form.Label>
                                            <InputGroup className={styles.formInputGroup}>
                                                <Form.Control
                                                    className={styles.formInput}
                                                    type={`${!showPasswordNewConfirm ? 'password' : 'text'}`}
                                                    placeholder="Nhập mật khẩu" required
                                                    onChange={(e) => setPasswordNewConfirm(e.target.value)}
                                                    onKeyUp={onKeyUpSubmit}
                                                />
                                                <Button tabIndex={-1} className={styles.formInputIcon} variant="outline-secondary" id="button-addon-2">
                                                    <span onClick={() => setShowPasswordNewConfirm(!showPasswordNewConfirm)}>
                                                        {!showPasswordNewConfirm && (
                                                            <FaEye style={{fill: userTheme().color_bg}} />
                                                        )}
                                                        {showPasswordNewConfirm && (
                                                            <FaEyeSlash style={{fill: userTheme().color_bg}}></FaEyeSlash>
                                                        )}
                                                    </span>
                                                </Button>
                                            </InputGroup>
                                            {!passwordNewConfirm && (
                                                <Form.Control.Feedback type="invalid">Mật khẩu là bắt buộc</Form.Control.Feedback>
                                            )}
                                        </Form.Group>
                                    </Form>
                                </div>
                                <div className={styles.formChangPasswordSubmit}>
                                    <Button className={styles.formBtnSubmit} style={{ backgroundColor: userTheme().color_bg, borderColor: userTheme().color_bg }} onClick={handleSubmit}>Đổi mật khẩu</Button>
                                </div>
                            </div>
                        </>
                    </Modal.Body>
                </Modal>
                {/* <ToastContainer /> */}
            </div>
        </>
    )
};
