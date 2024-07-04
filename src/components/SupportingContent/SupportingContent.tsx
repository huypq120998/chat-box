import { parseSupportingContentItem } from "./SupportingContentParser";

import styles from "./SupportingContent.module.css";

interface Props {
    supportingContent: string[];
    supportingScore: string[];
    rerankScore: string[]
}

export const SupportingContent = ({ supportingContent, supportingScore, rerankScore }: Props) => {
    return (
        <ul className={styles.supportingContentNavList}>
            {supportingContent.map((x, i) => {
                const parsed = parseSupportingContentItem(x);

                return (
                    <li key={i} className={styles.supportingContentItem}>
                        <h4 className={styles.supportingContentItemHeader}>
                            {`${parsed.title}________Score: ${supportingScore[i]}${rerankScore && rerankScore.length ? `________Rerank Score: ${rerankScore[i]}` : ''}`}
                        </h4>
                        <p className={styles.supportingContentItemText}>{parsed.content}</p>
                    </li>
                );
            })}
        </ul>
    );
};
