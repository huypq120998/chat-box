import { Stack } from "@fluentui/react";
import { ButtonFollowupAnswer } from "../../api/models";
import { useStore } from "../../hooks/useStore";

import styles from "./Answer.module.css";

interface Props {
    answerFollowup: ButtonFollowupAnswer[]
    onSendFollowupAnswer: (q: string) => void;
}

export const AnswerFollowup = ({ answerFollowup, onSendFollowupAnswer }: Props) => {
    const {
        rootStore: { sessionChatsStore },
    } = useStore();

    const handleSendFollowupAnswer = async (v: ButtonFollowupAnswer) => {
        await sessionChatsStore.changeQuestionFollowup(v.text)
        onSendFollowupAnswer(v.text_display)
    }
    return (
        <Stack>
            <div className={styles.followupAnswerContainer}>
                {
                    answerFollowup?.map((v: ButtonFollowupAnswer, i: number) => {
                        return (
                            v.type === 'text' ?
                                <div key={i} className={styles.followupAnswer} onClick={() => handleSendFollowupAnswer(v)}>
                                    <span>{v.text_display}</span>
                                </div> 
                            : null
                        )
                    })
                }
            </div>
        </Stack>
    );
};
