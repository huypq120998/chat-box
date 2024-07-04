import _, { filter } from "lodash";
import { forEach } from "lodash";
import { renderToStaticMarkup } from "react-dom/server";
import { getCitationFilePath } from "../../api";
import {userTheme} from "../../utils/userTheme";

type HtmlParsedAnswer = {
    answerText: string;
    answerHtml: string;
    citations: string[];
    followupQuestions: string[];
    linkcitations: any[];
    reference_citations?: any[]
};

const UNDEFINED = 'không có nguồn'
const SROUCE = 'source'
const HISTORY = 'history'

const checkUndefinedCitation = (citation?: string) => {
    if (citation?.length) {
        return citation.toLowerCase().includes(UNDEFINED) || citation.toLowerCase().includes(SROUCE) || citation.toLowerCase().includes(HISTORY) || citation.toLowerCase().includes('nguồn')
    }
    return false
}

export function parseAnswerToHtml(answer: string = '', onCitationClicked: (citationFilePath: string) => void, data_points: string[], reference_urls: string[], reference_citations: any[]): HtmlParsedAnswer {
    const citations: string[] = [];
    const followupQuestions: string[] = [];

    // Extract any follow-up questions that might be in the answer
    let parsedAnswer = ''
    if (answer) {
        parsedAnswer = answer.replace(/<<([^>>]+)>>/g, (match, content) => {
            followupQuestions.push(content);
            return "";
        });
    }

    // trim any whitespace from the end of the answer after removing follow-up questions
    parsedAnswer = parsedAnswer.trim();

    const parts = parsedAnswer.split(/\[([^\]]+)\]/g);
    // console.log(parts)
    let answerText = ''


    const parsedCitation = (ref_citation: any) => {
        let citationIndex: number;
        if (citations.indexOf(ref_citation) !== -1) {
            if (citations && citations.length < citations.indexOf(ref_citation) + 2) return
            citationIndex = citations.indexOf(ref_citation) + 1;
        } else {
            citations.push(ref_citation);
            citationIndex = citations.length;
        }
        return renderToStaticMarkup(
            <a className="supContainer" title={ref_citation.display_source} onClick={() => onCitationClicked(ref_citation.source)}>
                <sup style={{ backgroundColor: userTheme().color_citation_bg, color: userTheme().color_citation_text }}>{citationIndex}</sup>
            </a>
        );
    }

    const fragments: (string | undefined)[] = parts.map((part, index) => {
        if (index % 2 === 0) {
            answerText += part
            return part;
        } else if (reference_urls?.length) {
            return ''
        } else if (checkUndefinedCitation(part)) {
            return ''
        } else {
            const indexSource = part
            const strSource = `[${part}]`
            let ref_citation = reference_citations?.find((item) => {
                return item.id == strSource
            })
            // console.log(part)
            // console.log(tempart)
            return reference_citations && reference_citations.length && ref_citation ? parsedCitation(ref_citation) : ''
        }
    });

    answerText.trim()
    return {
        answerText,
        answerHtml: fragments.join(""),
        citations,
        followupQuestions,
        linkcitations: []
    };
}

export function stripHtml(html: any) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
