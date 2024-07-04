import { useEffect, useRef, useState } from "react";
import eventBus from "../../plugins/EventBus"
import BackArrow from "../../assets/arrow_back.svg"
import Home from "../../assets/Home.svg"
import IcLogout from "../../assets/ic_logout.svg"
import { useNavigate } from "react-router-dom";
import styles from "./ChatHistory.module.css";
import { Link } from "react-router-dom";
import { ChangePassword } from "../Password";
import changPassMobile from "../../assets/ic_change_pass_mobile.svg"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import downloadIcon from "../../assets/ic_downloadWhite.svg"
import axios from "axios";
import { getMobileOperatingSystem, makeDownloadApp, urlDownloadApp } from "../../utils/urlDownloadApp";
import {userTheme} from "../../utils/userTheme";

interface Props {
    className?: string;
    onCloseNavbar: () => void;
    disabled?: boolean;
}

export const NavbarChatHeader = ({ onCloseNavbar }: Props) => {
    const firstUpdate = useRef(false);
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(localStorage.getItem('_user'))
    const [show, setShow] = useState<boolean>(false)

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
    const logOut = () => {
        eventBus.dispatch('logOutNavbar', {});
    }
    const closeNavbar = () => {
        onCloseNavbar()
    }
    const redirectHomePage = () => {
        navigate("/");
        eventBus.dispatch('redirectHomePageNavbar', {});
        onCloseNavbar()
    }
    const openChangPassModel = () => {
        setShow(true)
    }
    const notify = (e: any) => toast.success(`${e}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        rtl: false
    });

    const makeApiDownloadApp = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        const type = getMobileOperatingSystem()

        if (type) {
            makeDownloadApp(type)
        }
    }
    return (
        <>
            <div className={styles.headerNavContainer} style={{ backgroundImage: `url(${userTheme().header_main})`}}>
                <div className={styles.boxIconHeader}>
                    <img src={BackArrow} onClick={closeNavbar} />
                    <img src={Home} onClick={redirectHomePage} />
                </div>
                <div className={styles.headerContentContainer}>
                    <div className={styles.headerInfor}>
                        {user && user.avatar && (
                            <img className={styles.inforAvatarHeader} src={user.avatar} alt="" />
                        )}
                        {/* <img className={styles.inforAvatarHeader} src={logo} alt="" /> */}

                        {user && user.fullname && (
                            <div className={styles.boxRightInfor} onClick={openChangPassModel}>
                                <span className={styles.inforFullnameHeader}>{user.fullname}</span>
                                <div className={styles.changePasswordBox}>
                                    <img src={changPassMobile} />
                                    <span className={styles.textChangePass} style={{ color: userTheme().color_text_no_header }}>Đổi mật khẩu</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.headerDownApp} onClick={logOut}>
                        <img src={IcLogout} />
                        {/* <span className={styles.textheaderLogout}>Đăng xuất</span> */}
                    </div>
                    {/*<div className={styles.headerLogout} onClick={() => makeApiDownloadApp(event)}>*/}
                    {/*    <img src={downloadIcon} />*/}
                    {/*    <span className={styles.textheaderLogout}>Tải app</span>*/}
                    {/*</div>*/}
                </div>
            </div>
            {show && <ChangePassword show={show} setShow={setShow} notify={notify} />}
            <ToastContainer />
        </>
    )
};
