import {useCallback, useMemo, useRef, useState} from "react";
import { Stack, IconButton } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./Answer.module.css";
import { useEffect } from "react";

import { AskResponse, citationsApi, citationsCompareApi, CitationsRequest, getCitationFilePath } from "../../api";
import { parseAnswerToHtml, stripHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";
import { AnswerInteract } from "./AnswerInteract";
import { AnswerFeedback } from "./AnswerFeedback";
import close from "../../assets/close.png"

import SpeechPlayer from "./SpeechPlayer";
import { PopoverAnswer } from "../Common";
import { forEach } from "lodash";
import { substringUrl } from "../../utils/substringUrl";
import {isShowConfiguration, isShowSupContent} from "../../utils/isShowConfiguration";
import { observer } from "mobx-react-lite";
import { useStore } from "../../hooks/useStore";
import React from "react";
import { parseSupportingContentItem } from "../SupportingContent/SupportingContentParser";
import { multiIncludes, NOT_FOUND } from "../../utils/multiIncludes";
import { AnswerFollowup } from "./AnswerFollowup";
import {userTheme} from "../../utils/userTheme";



interface Props {
    answer: AskResponse;
    isSelected?: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    onSend?: (q: string) => void
    showFollowupQuestions?: boolean;
    isPlayVoive?: any;
}

export const Answer = React.memo(observer(({
    answer,
    isSelected,
    onCitationClicked,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions,
    isPlayVoive,
    onSend
}: Props) => {
    const {
        rootStore: { citationsStore },
      } = useStore();
    const [openFeedback, setOpenFeedback] = useState<boolean>( false)
    const [openThankFeedback, setOpenThankFeedback] = useState<boolean>( false)
    const [isExperience, setIsExperience] = useState<boolean>( false)
    const [citationLinks, setCitationLinks] = useState<any>(citationsStore.getCitationLink)
    const dataCitition = useRef<any>(null);

    // const makeApiCitationRequest = async (content: string) => {
    //     var dataResult = null
    //     const request: CitationsRequest = { content: content };
    //     const result = await citationsApi(request);
    //     if(result && result.data) {
    //         dataResult = result.data
    //     }else {
    //         if(answer && answer['data_points']) {
    //             const textList = answer['data_points']
    //             const requestCompare: any = { word: content, textList: textList };
    //             const resultCompare = await citationsCompareApi(requestCompare);
    //             if(resultCompare && resultCompare.data) {
    //                 const request: CitationsRequest = { content: resultCompare.data };
    //                 const result = await citationsApi(request);
    //                 dataResult = result && result.data ? result.data : null
    //             }
    //         }
    //     }
    //     dataCitition.current = dataResult
    //     return dataResult
    // }

    const parsedAnswer = useMemo(() => {
        const result = parseAnswerToHtml(answer.answer, onCitationClicked, answer.data_points, answer?.reference_urls, answer.reference_citations)
        if (result.answerText) {
            result.answerText = stripHtml(result.answerText)
        }

        // console.log(result)

        // let myArray: any[] = [];
        // forEach(result.citations, async(v, idx) => {
        //
        //     const _result =  await makeApiCitationRequest(v)
        //     myArray[idx]=_result
        //     setTimeout(() => {
        //         // if(citationsStore.getCitationLink?.length > myArray.length - 1) return
        //         setCitationLinks(myArray)
        //         // citationsStore.addCitationLinks(myArray)
        //     }, 1000)
        // })

        result.reference_citations = answer?.reference_citations
        return  result
    },[answer]);

    useEffect(() => {
        setCitationLinks(citationsStore.getCitationLink)
    }, [citationsStore.getCitationLink])

    const sanitizedAnswerHtml = DOMPurify.sanitize(( parsedAnswer).answerHtml);
    const closeThankFeedback = () => {
        setOpenThankFeedback(false)
    }

    const firstUpdate = useRef(false);
    useEffect(() => {
        if (firstUpdate.current) {
            return;
        }
        const url = window.location.href;
        if (url && url.endsWith('experience/chat')) {
            setIsExperience(true)
        } else {
            setIsExperience(false)
        }

        firstUpdate.current = true;
        return () => {};
    }, []);


    const getTopDataPoints = (datapoints: any, scores: any[]) => {

        if (datapoints?.length > 0) {
            let topDatapoins: any = [];
            for (let i = 0; i < scores.length; i++) {
                if (scores[i] >= 0.8) { 
                    if (topDatapoins.length === 3) {
                        break;
                    }
                    topDatapoins.push(datapoints[i]);
                }
            }  
            if(topDatapoins.length === 0) {
                for (let i = 0; i < scores.length; i++) {
                    if (scores[i] >= 0.75) {
                        if (topDatapoins.length === 2) {
                            break;
                        }
                        topDatapoins.push(datapoints[i]);
                    }
                }  
            }
            if (topDatapoins.length === 0) {
                topDatapoins = [datapoints[0]];
            }                      
            return topDatapoins;
        }
    }

    const referenceUrls = useCallback(() => {
        let referencesDatapoints: any[] = []
        const isCheckReference = parsedAnswer.citations?.length === 0 && answer.reference_urls?.length === 0 && answer?.is_legal && !multiIncludes(answer?.answer, NOT_FOUND)
        if(isCheckReference) {
            referencesDatapoints = getTopDataPoints(answer.data_points, answer.semantic_scores)
        }
        return referencesDatapoints
    }, [parsedAnswer.citations])

    return (
        <>
            <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
                <Stack.Item>
                    <Stack horizontal horizontalAlign="space-between">
                        {/* <div className="" style={{backgroundColor: "#dbeefa", borderRadius: '50%', padding: '2px'}}>
                            <AnswerIcon />
                        </div> */}
                        <div className="" style={{ padding: '2px'}}>
                            <AnswerIcon />
                        </div>
                        <div>
                            {isShowConfiguration() ? (
                                <>
                                    <IconButton
                                        style={{ color: "black" }}
                                        iconProps={{ iconName: "Lightbulb" }}
                                        title="Show thought process"
                                        ariaLabel="Show thought process"
                                        onClick={() => onThoughtProcessClicked()}
                                        disabled={!answer?.thoughts}
                                    />
                                </>
                            ) : null}
                            {isShowSupContent() ? (
                                <>
                                    <IconButton
                                        style={{ color: "black" }}
                                        iconProps={{ iconName: "ClipboardList" }}
                                        title="Show supporting content"
                                        ariaLabel="Show supporting content"
                                        onClick={() => onSupportingContentClicked()}
                                        disabled={!answer?.data_points?.length}
                                    />
                                </>
                            ) : null}
                            <SpeechPlayer text={parsedAnswer.answerText} isPlayVoive={isPlayVoive}/>
                        </div>
                    </Stack>
                </Stack.Item>

                <Stack.Item grow>
                    <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml }}></div>
                </Stack.Item>

                {!!parsedAnswer.citations.length && parsedAnswer?.reference_citations?.length ? (
                    <Stack.Item>
                        <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                            <>
                                <span className={styles.citationLearnMore}>Trích dẫn:</span>
                                {parsedAnswer.citations.map( (x:any, i) => {
                                    return (
                                        <div key={i} className={styles.quoteContainer}>                                            
                                            <a className={styles.citation} style={{ backgroundColor: userTheme().color_citation_bg, color: userTheme().color_citation_text }} title={x.display_source} onClick={() => onCitationClicked(x.source)}>
                                                {`${i + 1}. ${x.display_source}`}
                                            </a>
                                        </div>
                                    );
                                })}
                            </>
                        </Stack>
                    </Stack.Item>
                ) : null}
                {referenceUrls()?.length > 0 ? (
                    <Stack.Item>
                        <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                            <span className={styles.citationLearnMore}>Tham khảo:</span>
                            {referenceUrls().map((x, i) => {
                                const path = parseSupportingContentItem(x);
                                return (
                                    <a key={i} className={styles.citation} style={{ backgroundColor: userTheme().color_citation_bg, color: userTheme().color_citation_text }} title={path.title} onClick={() => onCitationClicked(path.title)}>
                                        {`${i + 1}. ${path.title}`}
                                    </a>
                                );
                            })}
                        </Stack>
                    </Stack.Item>
                ) : null}

                {answer?.reference_urls && answer.reference_urls.length ? (
                    <Stack.Item>
                        <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                            <span className={styles.citationLearnMore}>Tham khảo:</span>
                            {answer.reference_urls.map((x, i) => {
                                const path = x;
                                return (
                                    <a key={i} className={styles.citation} style={{ backgroundColor: userTheme().color_citation_bg, color: userTheme().color_citation_text }} title={x} onClick={() => window.open(path)}>
                                        {`${++i}. ${substringUrl(x)}`}
                                    </a>
                                );
                            })}
                        </Stack>
                    </Stack.Item>
                ) : null}

                {!!parsedAnswer.followupQuestions.length && showFollowupQuestions && onFollowupQuestionClicked ? (
                    <Stack.Item>
                        <Stack horizontal wrap className={`${!!parsedAnswer.citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
                            <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
                            {parsedAnswer.followupQuestions.map((x, i) => {
                                return (
                                    <a key={i} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
                                        {`${x}`}
                                    </a>
                                );
                            })}
                        </Stack>
                    </Stack.Item>
                ) : null}

                { !isExperience ? (
                    <div>
                        <Stack.Item>
                            <AnswerInteract
                                answerText={parsedAnswer.answerText}
                                messageId={answer.id}
                                answer={answer}
                                setOpenFeedback={setOpenFeedback}
                                sanitizedAnswerHtml={sanitizedAnswerHtml}
                            />
                        </Stack.Item>
                        {openFeedback &&
                        <Stack.Item>
                        <AnswerFeedback messageId={answer.id} setOpenThankFeedback={setOpenThankFeedback} setOpenFeedback={setOpenFeedback}/>
                        </Stack.Item>
                        }
                        {openThankFeedback &&
                        <div className={styles.feedbackContainer}>
                        <div className={styles.boxFeedHeader}>
                            <span className={`${styles.textFeedTitleThank}`}>Cảm ơn bạn đã phản hồi</span>
                            <div className={styles.closeIconBox} onClick={closeThankFeedback}>
                            <img className={styles.closeIcon} src={close}/>
                            </div>
                        </div>
                        </div>
                        }
                    </div>
                ) : null}
            </Stack>
            {
                answer && answer?.buttons?.length ? 
                <Stack>
                    <AnswerFollowup answerFollowup = {answer?.buttons} onSendFollowupAnswer={question => onSend?.(question)}
                    />
                </Stack> : null
            }
        </>
    );
}));
