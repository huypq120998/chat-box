import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import styles from "./Answer.module.css";
import like from "../../assets/likeIcon.png"
import ic_like from "../../assets/ic_like.svg"
import ic_dislike from "../../assets/ic_dislike.svg"
import ic_like_active from "../../assets/ic_like_active.svg"
import ic_dislike_active from "../../assets/ic_dislike_active.svg"
import ic_copy from "../../assets/ic_copy.svg"



import { likeUnlikeChatSession } from "../../api";
import { LuCopy, LuCopyCheck } from "react-icons/lu";
import { IconContext } from "react-icons";
import {userTheme} from "../../utils/userTheme";


interface Props {

    messageId: string
    answer: any;
    setOpenFeedback?: any;
    sanitizedAnswerHtml: any;
    answerText: string;
    // isSelected?: boolean;
    // onCitationClicked: (filePath: string) => void;
    // onSupportingContentClicked: () => void;
    // onFollowupQuestionClicked?: (question: string) => void;
    // showFollowupQuestions?: boolean;
}

export const AnswerInteract = ({ messageId, answer, setOpenFeedback, sanitizedAnswerHtml, answerText }: Props) => {
    const [answerDetail, setAnswerDetail] = useState<any>()
    const [copied, setCopied] = useState<boolean>(false)
    const likeMessage = async (action: string) => {
        if(action === 'dislike') {
            setOpenFeedback(true)
        }else {
            setOpenFeedback(false)
        }
        const like = action  === 'like' ? 1 : action === 'dislike' ? 2 : 0
        const request: any = {
            like: like ,
            messageId: messageId,
            reasonDislike: []
        }
        const result = await likeUnlikeChatSession(request)
        setAnswerDetail((prev: any) => ({...prev, like: result.data.like}))
    }
    useEffect(() => {
        setAnswerDetail(answer)
    }, [answer])

    const onCoppy  = () => {
        // console.log('sanitizedAnswerHtml', sanitizedAnswerHtml);
        
        navigator.clipboard.writeText(answerText)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        },  15 * 100)
    }

    return (
        <Stack>
            <Stack.Item>
                <div className={styles.interactContainer}>
                    <div className={`${styles.boxIcon} ${answerDetail?.like === 1 ? styles.boxStyle : ''}`} onClick={() => likeMessage(answerDetail?.like === 1 ? 'default' : 'like')}>
                        <img className={styles.likeIcon} src={answerDetail?.like === 1 ? userTheme().ic_like_active : ic_like}/>
                    </div>
                    <div className={`${styles.boxIcon} ${answerDetail?.like === 2 ? styles.boxStyle : ''}`} onClick={() => likeMessage(answerDetail?.like === 2 ? 'default' : 'dislike')}>
                        <img className={`${styles.likeIcon}`} src={answerDetail?.like === 2 ? userTheme().ic_dislike_active : ic_dislike}/>
                    </div>
                    <div onClick={onCoppy} className={`${styles.boxIcon} ${copied ? styles.boxStyle : ''}`}>
                        {/* <img className={styles.likeIcon} src={copy}/> */}
                        <IconContext.Provider value={{style: {color: '#666'}, className: styles.likeIcon }}>
                            {copied ?
                                <LuCopyCheck />
                                :
                                <img src={ic_copy}/>
                            }
                        </IconContext.Provider>
                    </div>
                </div>
            </Stack.Item>
        </Stack>

    );
};
