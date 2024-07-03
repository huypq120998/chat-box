import { Pivot, PivotItem, DocumentCard, getDocument, safeSetTimeout } from "@fluentui/react";
import { forEach, uniqBy } from 'lodash'
import DOMPurify from "dompurify";

import styles from "./AnalysisPanel.module.css";

import { SupportingContent } from "../SupportingContent";
import {AskResponse, downloadAttachFile, getFileDocument} from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";
import { createLogger } from "vite";
import React, { useEffect, useState } from "react";
import { PopoverAnswer } from "../Common";
import { openWindowToUrl } from "../../utils/openWindowUrl";
import {isShowConfiguration, isShowSupContent} from "../../utils/isShowConfiguration";
import { Modal, Button, Accordion, Card, Row, Col } from 'react-bootstrap'
import uploadSvg from "../../assets/upload.svg";



interface Props {
    className: string;
    activeTab: AnalysisPanelTabs;
    onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
    activeCitation: string | undefined;
    citationHeight: string;
    answer: AskResponse;
    loadingCitation: boolean
}

const pivotItemDisabledStyle = { disabled: true, style: { color: "grey" } };

export const AnalysisPanel = ({ loadingCitation, answer, activeTab, activeCitation, citationHeight, className, onActiveTabChanged }: Props) => {
    const isDisabledThoughtProcessTab: boolean = !answer.thoughts;
    const isDisabledSupportingContentTab: boolean = !answer.data_points?.length;
    const isDisabledCitationTab: boolean = !activeCitation;

    const sanitizedThoughts = DOMPurify.sanitize(answer.thoughts!);

    const [urlPreviewPdf, setUrlPreviewPdf] = useState<string>('');
    const [lawName, setLawName] = useState<string>('');
    const [lawPointName, setLawPointName] = useState<string>('');

    const [showHighlightCitation, setShowHighlightCitation] = useState<boolean>(false);
    const [noteMetadatasHighlight, setNoteMetadatasHighlight] = useState<any>(null);

    const handleCloseHighlightCitation = () => {
        setShowHighlightCitation(false)
    };
    const handleShowHighlightCitation = () => {
        setShowHighlightCitation(true)
    };

    const onClickHighlightCitation = (keyNote: any, keyMetadata: any) => {
        if (answer && answer.citation && answer.citation.noteChildContents && answer.citation.noteChildContents[keyNote]) {
            handleShowHighlightCitation()
            if (answer.citation.noteChildContents[keyNote].noteMetadatas && answer.citation.noteChildContents[keyNote].noteMetadatas.length) {
                setNoteMetadatasHighlight(answer.citation.noteChildContents[keyNote].noteMetadatas);
            }
        }
    };

    const navigateLaw = (url: string) => {
        if (url && typeof url === 'string') {
            openWindowToUrl(url);
        }
    }

    const getFileDocumentPreview = async () => {
        const {headers, parsedResponse} = await getFileDocument({
            'id': answer.citation.lawId
        })

        if(headers.get('content-type') != "text/html; charset=utf-8"){
            // @ts-ignore
            const urlBlob = URL.createObjectURL(
                new Blob([parsedResponse as BlobPart], {
                    type: 'application/pdf'
                })
            )
            setUrlPreviewPdf(urlBlob)
        }
    }

    const downloadFile = async (file_id:any, file_name: any) => {
        const res = await downloadAttachFile({
            'file_id': file_id,
            'document_id': answer.citation.lawId
        })

        const a = document.createElement('a')
        a.href = URL.createObjectURL(
            new Blob([res as BlobPart], { type: 'application/octet-stream' })
        )
        a.download = file_name
        a.click()
    }

    useEffect(() => {

        if (answer && answer.citation && answer.citation.nameDisplay) {
            const namePiece = answer.citation.nameDisplay.split("\n");
            if (namePiece && namePiece.length) {
                if (namePiece[0]) {
                    setLawName(namePiece[0])
                }
                if (namePiece[1]) {
                    setLawPointName(namePiece[1])
                }
            }
        }

        if (answer && answer.citation && answer.citation.noteChildContents && answer.citation.noteChildContents.length) {
            // forEach(answer.citation.noteChildContents, function (note, keyNote) {
            //     const word = answer.citation.noteChildContents[keyNote].word
            //     let wordHtml = word
            //     if (note.noteMetadatas && note.noteMetadatas.length) {
            //         const noteMetadatas = uniqBy(note.noteMetadatas, 'to')
            //         forEach(noteMetadatas, function (metadata, keyMetadata) {
            //             if (metadata.to) {
            //                 const wordHighlight = word.substring(metadata.from, metadata.to);
            //                 if (wordHighlight) {
            //                     const wordHighlightHtml = `<span class="is-highlight citation-highlight" data-key-note="${keyNote}" data-key-metadata="${keyMetadata}">${wordHighlight}</span>`;
            //                     wordHtml = wordHtml.replace(wordHighlight, wordHighlightHtml)
            //                 }
            //             }
            //         })
            //     }
            //     answer.citation.noteChildContents[keyNote].wordHtml = wordHtml
            // })

            // handleAnswerCitation(answer)

            setTimeout(() => {
                const highlightCitations = document.getElementsByClassName("citation-highlight")
                if (highlightCitations && highlightCitations.length) {
                    for (let i = 0; i < highlightCitations.length; i++) {
                        highlightCitations[i].removeEventListener('click', function () { }, false)
                        highlightCitations[i].addEventListener('click', function (e: any) {
                            if (e && e.target && e.target.dataset && e.target.dataset.hasOwnProperty('keyMetadata')) {
                                const keyMetadata = e.target.dataset['keyMetadata']
                                const keyNote = e.target.dataset['keyNote']
                                onClickHighlightCitation(keyNote, keyMetadata)
                            }
                        });
                    }
                }
            });
        }

        getFileDocumentPreview()
    }, [answer, loadingCitation]);

    return (
        <Pivot
            className={className}
            selectedKey={activeTab}
            onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
        >
            {isShowConfiguration() &&
                <PivotItem
                    itemKey={AnalysisPanelTabs.ThoughtProcessTab}
                    headerText="Thought process"
                    headerButtonProps={isDisabledThoughtProcessTab ? pivotItemDisabledStyle : undefined}
                >
                    <div className={styles.thoughtProcess} dangerouslySetInnerHTML={{ __html: sanitizedThoughts }}></div>
                </PivotItem>
            }
            {isShowSupContent() &&
                <PivotItem
                    itemKey={AnalysisPanelTabs.SupportingContentTab}
                    headerText="Supporting content"
                    headerButtonProps={isDisabledSupportingContentTab ? pivotItemDisabledStyle : undefined}
                >
                    <SupportingContent
                        supportingContent={answer.data_points}
                        supportingScore={answer.semantic_scores}
                        rerankScore={answer.hasOwnProperty('rerank_scores') ? answer.rerank_scores : []}
                    />
                </PivotItem>
            }
            <PivotItem
                itemKey={AnalysisPanelTabs.CitationTab}
                headerText="Trích dẫn"
                headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
            >
                {/*<div>{answer}</div>*/}
                {/*{answer && answer.citation && answer.citation.noteChildContents && (*/}
                    {answer && answer.citation && (
                    <div className={styles.card}>
                        <div className={styles.cardBody}>
                            {/*{lawName && (*/}
                                <div className={styles.quoteContainer}>
                                    <div
                                        className={`${styles.textBold} ${styles.textBoldLink}`}
                                        style={{ textTransform: "uppercase", whiteSpace: "pre-line" }}
                                        // onClick={() => answer.citation && answer.citation.url ? navigateLaw(answer.citation.url) : null}
                                    >
                                        {/*{lawName}*/}
                                        {answer.citation.name}
                                    </div>

                                    {/* {
                                        answer.citation.url ?
                                        <PopoverAnswer noteContents={answer.citation.url}/>
                                        : null
                                    } */}
                                </div>
                            {/*)}*/}
                            {/*<div>*/}
                            {/*    <div*/}
                            {/*        className={`${styles.textBold}`}>*/}
                            {/*        {answer.citation.nameTitle}*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            <div>
                                <div
                                    className={`${styles.textBold}`} style={{whiteSpace: "pre"}}>
                                    {answer.citation.nameDisplay}
                                </div>
                            </div>
                            {/*<div dangerouslySetInnerHTML={{ __html: answer.citation.content }}></div>*/}

                            {/*<div className={styles.quoteContainer}>*/}
                            {/*    <div className={`${styles.textBold}`} style={{ textTransform: "uppercase", whiteSpace: "pre-line" }}>{answer.citation.chapterName}</div>*/}
                            {/*</div>*/}
                            {/*<div className={`${styles.textBold}`} style={{ marginBottom: '0.25rem', textDecoration: "underline" }}>Vị trí điều:</div>*/}

                            {/*{lawPointName && (*/}
                            {/*    <div style={{ marginBottom: '0.5rem' }}>*/}
                            {/*        <div className={`${styles.textLight} ${styles.text}`} style={{display: 'inline'}}>{lawPointName}</div>*/}
                            {/*        {*/}
                            {/*            answer.citation.noteContents && answer.citation.noteContents.length ?*/}
                            {/*                <div style={{display: 'inline-block', marginLeft: '5px'}}>*/}
                            {/*                    <PopoverAnswer noteContents={answer.citation.noteContents} />*/}
                            {/*                </div>*/}
                            {/*                : null*/}
                            {/*        }*/}
                            {/*    </div>*/}

                            {/*)}*/}
                            <div style={{ marginBottom: '1rem' }}>
                                {answer.citation.noteChildContents.map((note: any, index: any) => (
                                    (
                                        <>
                                            <div key={index} style={{ marginBottom: '0.25rem' }}><span style={{ backgroundColor: (note.highlight) ? '#BEFFE1' : 'none' }} dangerouslySetInnerHTML={{ __html: note.wordHtml ? note.wordHtml : note.word }}></span></div>
                                            {/*<div key={index} style={{ marginBottom: '0.25rem', cursor: (note.highlight) ? 'pointer' : 'initial' }}><span style={{ backgroundColor: (note.highlight) ? '#fce93a' : 'none' }}>{note.wordHtml ? note.wordHtml : note.word}</span></div>*/}
                                        </>
                                    )
                                ))}
                            </div>

                            <div className={styles.tag}>
                                {answer.citation.documentCode && (
                                    <span className={styles.tagItem}>Mã văn bản: {answer.citation.documentCode}</span>
                                )}
                                {answer.citation.validityStatus && (
                                    <span className={styles.tagItem}>Hiệu lực: {answer.citation.validityStatus}</span>
                                )}
                                {answer.citation.dateIssued && answer.citation.dateIssued != 'Invalid date' && (
                                    <span className={styles.tagItem}>Ngày ban hành: {answer.citation.dateIssued}</span>
                                )}
                                {answer.citation.applyDate && answer.citation.applyDate != 'Invalid date' && (
                                    <span className={styles.tagItem}>Ngày áp dụng: {answer.citation.applyDate}</span>
                                )}
                                {answer.citation.expirationDate && answer.citation.expirationDate != 'Invalid date' && (
                                    <span className={styles.tagItem}>Ngày hết hiệu lực: {answer.citation.expirationDate}</span>
                                )}
                                {answer.citation.type && answer.citation.type != 'Khác' && (
                                    <span className={styles.tagItem}>{answer.citation.type}</span>
                                )}
                                {answer.citation.field && answer.citation.field != 'Khác' && (
                                    <span className={styles.tagItem}>Lĩnh vực: {answer.citation.field}</span>
                                )}
                                {answer.citation.courtType && answer.citation.courtType != 'Khác' && (
                                    <span className={styles.tagItem}>{answer.citation.courtType}</span>
                                )}
                                {answer.citation.level && answer.citation.level != 'Khác' && (
                                    <span className={styles.tagItem}>{answer.citation.level}</span>
                                )}
                                {answer.citation.agencyIssued && answer.citation.agencyIssued != 'Khác' && (
                                    <span className={styles.tagItem}>Cơ quan ban hành: {answer.citation.agencyIssued}</span>
                                )}
                                {answer.citation.signedBy && answer.citation.signedBy != 'Khác' && (
                                    <span className={styles.tagItem}>Người ký: {answer.citation.signedBy}</span>
                                )}
                                {answer.citation.legalRelation && answer.citation.legalRelation != 'Khác' && (
                                    <span className={styles.tagItem}>{answer.citation.legalRelation}</span>
                                )}
                                {answer.citation.publicStatus && answer.citation.publicStatus != 'Khác' && (
                                    <span className={styles.tagItem}>{answer.citation.publicStatus}</span>
                                )}
                                {answer.citation.applyPrecedent && answer.citation.applyPrecedent != 'Khác' && (
                                    <span className={styles.tagItem}>{answer.citation.applyPrecedent}</span>
                                )}
                                {answer.citation.delict && answer.citation.delict != 'Khác' && (
                                    <span className={styles.tagItem}>{answer.citation.delict}</span>
                                )}
                                {answer.citation.judgmentDate && answer.citation.judgmentDate != 'Invalid date' && (
                                    <span className={styles.tagItem}>Ngày công bố: {answer.citation.judgmentDate}</span>
                                )}
                            </div>
                        </div>
                        <Modal show={showHighlightCitation} onHide={handleCloseHighlightCitation} size="xl" centered dialogClassName="modal-highlight-citation" scrollable>
                            <Modal.Header closeButton style={{ background: '#e5e7eb' }}>
                                <Modal.Title>Các nội dung sửa đổi, hướng dẫn</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Accordion defaultActiveKey="0">
                                    {noteMetadatasHighlight && noteMetadatasHighlight.map((meta: any, index: any) => (
                                        (
                                            <>
                                                {meta.guide && (
                                                    <Accordion.Item eventKey={index} key={index}>
                                                        <Accordion.Header>{meta.guide}</Accordion.Header>
                                                        <Accordion.Body>
                                                            <Row>
                                                                <Col>
                                                                    <Card>
                                                                        <Card.Header className={styles.cardHeader}>Nội dung gốc</Card.Header>
                                                                        <Card.Body>
                                                                            <Card.Text className={styles.cardContent}>
                                                                                {meta.originalContent}
                                                                            </Card.Text>
                                                                        </Card.Body>
                                                                    </Card>
                                                                </Col>
                                                                <Col>
                                                                    <Card>
                                                                        <Card.Header className={styles.cardHeader}>Nội dung sửa đổi, hướng dẫn</Card.Header>
                                                                        <Card.Body>
                                                                            <Card.Text className={styles.cardContent}>
                                                                                {meta.editContent}
                                                                            </Card.Text>
                                                                        </Card.Body>
                                                                    </Card>
                                                                </Col>
                                                            </Row>
                                                        </Accordion.Body>
                                                    </Accordion.Item>
                                                )}
                                            </>
                                        )
                                    ))}
                                    {/*<Accordion.Item eventKey="0">*/}
                                    {/*    <Accordion.Header>Accordion Item #1</Accordion.Header>*/}
                                    {/*    <Accordion.Body>*/}
                                    {/*        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do*/}
                                    {/*        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad*/}
                                    {/*        minim veniam, quis nostrud exercitation ullamco laboris nisi ut*/}
                                    {/*        aliquip ex ea commodo consequat. Duis aute irure dolor in*/}
                                    {/*        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla*/}
                                    {/*        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in*/}
                                    {/*        culpa qui officia deserunt mollit anim id est laborum.*/}
                                    {/*    </Accordion.Body>*/}
                                    {/*</Accordion.Item>*/}
                                    {/*<Accordion.Item eventKey="1">*/}
                                    {/*    <Accordion.Header>Accordion Item #2</Accordion.Header>*/}
                                    {/*    <Accordion.Body>*/}
                                    {/*        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do*/}
                                    {/*        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad*/}
                                    {/*        minim veniam, quis nostrud exercitation ullamco laboris nisi ut*/}
                                    {/*        aliquip ex ea commodo consequat. Duis aute irure dolor in*/}
                                    {/*        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla*/}
                                    {/*        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in*/}
                                    {/*        culpa qui officia deserunt mollit anim id est laborum.*/}
                                    {/*    </Accordion.Body>*/}
                                    {/*</Accordion.Item>*/}
                                </Accordion>
                            </Modal.Body>
                            {/*<Modal.Footer>*/}
                            {/*    <Button variant="secondary" onClick={handleCloseHighlightCitation}>*/}
                            {/*        Close*/}
                            {/*    </Button>*/}
                            {/*    <Button variant="primary" onClick={handleCloseHighlightCitation}>*/}
                            {/*        Save Changes*/}
                            {/*    </Button>*/}
                            {/*</Modal.Footer>*/}
                        </Modal>
                    </div>
                )}
                {answer && answer.citation && answer.citation.attached_files && (
                    <div>
                        <br/>
                        <div>
                            <b>Danh sách tài liệu đính kèm:</b>
                        </div>
                        {
                            answer.citation.attached_files.map((file: any, index: any) => (
                                <div key={file.file_id}>
                                    <a href="javascript:;" className={styles.fileAttach} onClick={() => downloadFile(file.file_id, file.file_name)}>
                                        <img src={uploadSvg} className={styles.iconDownload} alt=""/>
                                        {file.file_name}
                                    </a>
                                </div>
                            ))
                        }
                    </div>
                )}
                {/*<iframe title="Citation" src={activeCitation} width="100%" height={citationHeight} />*/}
            </PivotItem>
            <PivotItem
                itemKey={AnalysisPanelTabs.PreviewTab}
                headerText="Văn bản"
                headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
            >
                <iframe src={urlPreviewPdf} width="100%" height="100%" style={{minHeight: '700px'}}/>
            </PivotItem>
        </Pivot>
    );
};
