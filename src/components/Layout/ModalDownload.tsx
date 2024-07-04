import { Modal } from 'react-bootstrap';
import styles from "./Layout.module.css";
import btnAnroid from "../../assets/download/btnAndroid.png"
import btnIos from "../../assets/download/btniOs.png"
import androidqrcode from "../../assets/download/qrcode_android.png"
import iosqrcode from "../../assets/download/qrcode_ios.png"
import { makeDownloadApp } from "../../utils/urlDownloadApp";



interface Props {
    className?: string;
    closeDownloadModal: () => void;
    openDowloadModal?: boolean
}

export const ModelDownload = ({ openDowloadModal, closeDownloadModal }: Props) => {
    const downloadApp = async (e: any, type: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (type) {
            makeDownloadApp(type)
        }
    }
    return (
        <>
            <div className={styles.boxModelDownload}>
                <Modal
                    show={openDowloadModal}
                    onHide={closeDownloadModal}
                    dialogClassName={styles.modalSize}
                    size={'lg'}
                    centered
                    aria-labelledby="contained-modal-title-center"
                >
                    <Modal.Body>
                        <>
                            <div className={styles.boxdowload}>
                                <div className="flex-1 p-5">
                                    <a onClick={() => downloadApp(event, 'android')}>
                                        <img className={styles.imgLabel} src={btnAnroid} alt="" />
                                    </a>
                                    <a onClick={() => downloadApp(event, 'android')}>
                                        <img className={styles.Qr} src={androidqrcode} alt="" />
                                    </a>
                                </div>
                                <div className="flex-1 p-5">
                                    <a onClick={() => downloadApp(event, 'ios')}>
                                        <img className={styles.imgLabel} src={btnIos} alt="" />
                                    </a>
                                    <a onClick={() => downloadApp(event, 'ios')}>
                                        <img className={styles.Qr} src={iosqrcode} alt="" />
                                    </a>
                                </div>
                            </div>
                        </>
                    </Modal.Body>
                </Modal>
            </div >
        </>
    )
};
