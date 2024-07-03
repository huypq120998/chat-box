import { Stack, PrimaryButton } from "@fluentui/react";
import { ErrorCircle24Regular } from "@fluentui/react-icons";
import { useStore } from "../../hooks/useStore";
import { ERROR_COUNT_MAX, ERROR_NETWORK } from "../../utils/errorChatResult";

import styles from "./Answer.module.css";

interface Props {
    error: string;
    onRetry: () => void;
}

export const AnswerError = ({ error, onRetry }: Props) => {

    const {
        rootStore: { sessionChatsStore },
      } = useStore();
    const checkRetry = () => {
        const isErrorNetwork = error === ERROR_NETWORK
        return isErrorNetwork
    }
    const handleRetry = () => {
        onRetry()
        if(sessionChatsStore.errorCountNetwork < ERROR_COUNT_MAX && error === ERROR_NETWORK) {
            sessionChatsStore.updateErrorCountNetwork(sessionChatsStore.errorCountNetwork + 1)
        }
    }
    return (
        <Stack className={styles.answerContainer} verticalAlign="space-between">
            <ErrorCircle24Regular aria-hidden="true" aria-label="Error icon" primaryFill="red" />

            <Stack.Item grow>
                <p className={styles.answerText}>
                    {error}
                </p>
            </Stack.Item>
            {
                checkRetry() && sessionChatsStore.errorCountNetwork < ERROR_COUNT_MAX ? <PrimaryButton className={styles.retryButton} onClick={handleRetry} text="Thử lại" /> : null
            }
        </Stack>
    );
};
