import { Text } from "@fluentui/react";
import { Delete24Regular } from "@fluentui/react-icons";
import closeIcon from "../../assets/ic_close.png"
import { AnalysisPanelTabs } from "../AnalysisPanel";

import styles from "./CloseDebug.module.css";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
    activeAnalysisPanelTab?: AnalysisPanelTabs
}

export const CloseDebug = ({ className, disabled, onClick, activeAnalysisPanelTab }: Props) => {
    // const panelTab = activeAnalysisPanelTab === 'thoughtProcess' ? 'Thought process'
    //     : activeAnalysisPanelTab === 'supportingContent' ? 'Supporting content'
    //         : activeAnalysisPanelTab === 'citation' ? 'Citation' : ""
    return (
        <div className={`${styles.container} ${className ?? ""} ${disabled && styles.disabled}`} onClick={onClick}>
            <img className={styles.closeIcon} src={closeIcon} />
            <Text>{`Đóng`}</Text>
        </div>
    );
};
