import { AskRequest, ChatRequestVtcc, AskResponse, ChatRequest, CitationsCompareRequest, PromptRequest, AskResponsePrompt, CitationsRequest, DocumentSupportResponse, DefaultQuestionRequest } from "./models";
import {uuid} from "../utils/string";
import { defaultHeader } from "../utils/localStorage";
import eventBus from "../plugins/EventBus";

export async function askApi(options: AskRequest): Promise<AskResponse> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/ask", {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: options.question,
            approach: options.approach,
            overrides: {
                semantic_ranker: options.overrides?.semanticRanker,
                semantic_captions: options.overrides?.semanticCaptions,
                top: options.overrides?.top,
                temperature: options.overrides?.temperature,
                prompt_template: options.overrides?.promptTemplate,
                prompt_template_prefix: options.overrides?.promptTemplatePrefix,
                prompt_template_suffix: options.overrides?.promptTemplateSuffix,
                exclude_category: options.overrides?.excludeCategory
            }
        })
    });
    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function chatApi(options: ChatRequest): Promise<AskResponse> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/chat", {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            history: options.history,
            approach: options.approach,
            fullname: options.fullname,
            username: options.username,
            overrides: {
                semantic_ranker: options.overrides?.semanticRanker,
                semantic_captions: options.overrides?.semanticCaptions,
                top: options.overrides?.top,
                temperature: options.overrides?.temperature,
                temperature_gen_query: options.overrides?.temperature_gen_query,
                prompt_template: options.overrides?.promptTemplate,
                prompt_template_prefix: options.overrides?.promptTemplatePrefix,
                prompt_template_suffix: options.overrides?.promptTemplateSuffix,
                exclude_category: options.overrides?.excludeCategory,
                suggest_followup_questions: options.overrides?.suggestFollowupQuestions,
                semantic_law_retriever: options.overrides?.semantic_law_retriever,
                fulltext_search_retriever: options.overrides?.fulltext_search_retriever,
                chatgpt_model: options.overrides?.chatgpt_model,
                chatgpt_model_gen_query: options.overrides?.chatgpt_model_gen_query,
                no_prompt: options.overrides?.no_prompt,
                no_search_engine: options.overrides?.no_search_engine,
                rerank_retrieve: options.overrides?.rerank_retrieve,
                no_gen_query: options.overrides?.no_gen_query,
                retrieval_mode: options.overrides?.retrieval_mode,
                prefix_prompt: options.overrides?.prefix_prompt,
                follow_up_prompt: options.overrides?.follow_up_prompt,
                query_prompt: options.overrides?.query_prompt,
                conversation_id: options.overrides?.conversation_id,
                use_whitelist: options.overrides?.use_whitelist,
                google_seo: options.overrides?.google_seo,
                segment_rule_search: options.overrides?.segment_rule_search,
                ner_rule_search: options.overrides?.ner_rule_search,
                semantic_rule_search: options.overrides?.semantic_rule_search,
                enterprise_id: options.overrides?.enterprise_id,
                bot_id: options.overrides?.bot_id,
                app_id: options.overrides?.app_id,
                authen_key: options.overrides?.authen_key,
                bot_name: options.overrides?.bot_name,
            }
        })
    });

    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    if (response.status === 401) {
        eventBus.dispatch('dispatch-unauthorized', {})
    }

    return parsedResponse;
}

export async function chatApiVtccFlow(options: ChatRequest): Promise<AskResponse> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/vtcc_llm_chat", {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: options.query,
        })
    });

    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    if (response.status === 401) {
        eventBus.dispatch('dispatch-unauthorized', {})
    }

    return parsedResponse;
}


export async function citationsApi(options: CitationsRequest): Promise<AskResponse> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/content", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
    content: options.content
    })
    });

    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function citationsCompareApi(options: CitationsCompareRequest): Promise<AskResponse> {
    const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyLnZ0Y2MiLCJleHAiOjE4MDc0NDEzNTMsInNjb3BlIjpbXX0.pXNIDbFBM4YBMsjOHr_WwBBjTBobkE6eG9rCCN-07NIa5NAYc1J_Pdz32hZkh35NlRcemfTzfqMfavHD2upxrg"
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/judgment/compareArticle", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${token}`
    },
    body: JSON.stringify({
    word: options.word,
    textList: options.textList
    })
    });

    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function EditPrompt(options: PromptRequest): Promise<AskResponsePrompt> {
    const response = await fetch(`${import.meta.env.VITE_BASE_DOMAIN}/prompts/${options?.idPrompt}`, {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            bot: options?.bot,
            password: options?.password,
            prefix_prompt: options?.prefixPrompt,
            follow_up_prompt: options?.followUpPrompt,
            query_prompt: options?.queryPrompt,
            is_apply: true
        })
    });

    const parsedResponse: AskResponsePrompt = await response.json();
    if (response.status > 299 || !response.ok) {
        // throw Error(parsedResponse.error || "Unknown error");
        return Promise.reject(parsedResponse.error || "Unknown error")
    }

    return parsedResponse;
}

export async function setDefaultPrompt(options: PromptRequest): Promise<AskResponsePrompt> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/prompts/default", {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: options?.idPrompt,
            password: options?.password
        })
    });

    const parsedResponse: AskResponsePrompt = await response.json();
    if (response.status > 299 || !response.ok) {
        // throw Error(parsedResponse.error || "Unknown error");
        return Promise.reject(parsedResponse.error || "Unknown error")
    }

    return parsedResponse;
}

export async function getPrompt(enterprise_id: string): Promise<AskResponsePrompt[]> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/prompts-by-enterprise", {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            enterprise_id
        })
    });

    const parsedResponse: AskResponsePrompt[] = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error("Unknown error");
    }

    return parsedResponse;
}

export async function getConfiguration(enterprise_id: string): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/configuration", {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            enterprise_id
        })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error("Unknown error");
    }

    return parsedResponse;
}

export async function getDefaultQuestion(): Promise<any> {
    // const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/list-chat-sample", {
    //     method: "POST",
    //     headers: {
    //         ...defaultHeader(),
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         type: import.meta.env.VITE_TYPE_QUESTION_SAMPLE
    //     })
    // });
    //
    // const parsedResponse: any = await response.json();
    // if (response.status > 299 || !response.ok) {
    //     throw Error("Unknown error");
    // }
    //
    // return parsedResponse;
}

export async function EditDefaultQuestion(options: DefaultQuestionRequest): Promise<AskResponsePrompt> {
    const response = await fetch(`${import.meta.env.VITE_BASE_DOMAIN}/chat-sample/${options?.id}`, {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: options?.type,
            data: options?.data,
        })
    });

    const parsedResponse: AskResponsePrompt = await response.json();
    if (response.status > 299 || !response.ok) {
        // throw Error(parsedResponse.error || "Unknown error");
        return Promise.reject(parsedResponse.error || "Unknown error")
    }

    return parsedResponse;
}
export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
/*todo change domain*/
export async function getLawDocumentsApi(): Promise<DocumentSupportResponse> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/judgment/getLawDocumentByTypes", {
        headers: {
            ...defaultHeader()
        },
    });

    const parsedResponse: DocumentSupportResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}
/*todo change domain*/
export async function listAllChatSession(requestGet: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/listAllChatSession", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        userId: requestGet.userId
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}
/**/
export async function addChatMessages(requestAdd: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/addChatMessage", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        question: requestAdd?.question,
        senderId: requestAdd?.senderId,
        sessionId: requestAdd?.sessionId,
        data_points: requestAdd?.data_points,
        semantic_scores: requestAdd?.semantic_scores,
        rerank_scores: requestAdd?.rerank_scores,
        thoughts: requestAdd?.thoughts,
        answer: requestAdd?.answer,
        reference_urls: requestAdd?.reference_urls,
        gen_query: requestAdd?.gen_query,
        is_legal: requestAdd?.is_legal,
        buttons: requestAdd?.buttons,
        reference_citations: requestAdd?.reference_citations,
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function createChatSession(requestCreate: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/createChatSession", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        sessionName: requestCreate?.sessionName,
        userId: requestCreate?.userId,
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

// export async function initDefaultChat(requestCreate: any): Promise<any> {
//     const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/initDefaultChat", {
//     method: "POST",
//     headers: {
//         ...defaultHeader(),
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//         userId: requestCreate?.userId,
//     })
//     });

//     const parsedResponse: any = await response.json();
//     if (response.status > 299 || !response.ok) {
//     throw Error(parsedResponse.error || "Unknown error");
//     }

//     return parsedResponse;
// }
export async function initDefaultChat(requestCreate: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/initDefaultChat", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        userId: requestCreate?.userId,
        question: requestCreate?.question
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function editChatSession(request: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/editChatSession", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        sessionName: request?.sessionName,
        sessionId: request?.sessionId
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function pinChatSession(request: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/pinChatSession", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        pinned: request?.pinned,
        sessionId: request?.sessionId
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function chatSessionById(request: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/listMessagesBySessionId", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        sessionId: request?.sessionId
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function deleteChatSession(request: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/deleteChatSession", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        sessionId: request?.sessionId
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}
export async function deleteAllChatSession(request: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/deleteAllChatSession", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        userId: request?.userId
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}
export async function likeUnlikeChatSession(request: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/likeMessage", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        like: request?.like,
        messageId: request?.messageId,
        reasonDislike: request?.reasonDislike,
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}
export async function clearMessagesInChatSession(request: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/api/chatSession/clearMessagesInChatSession", {
    method: "POST",
    headers: {
        ...defaultHeader(),
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        sessionId: request?.sessionId
    })
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}
export async function uploadFileApi(data: any): Promise<any> {
    const formData = new FormData()

    formData.append("file", data.file);
    formData.append("user_id", data.userId);

    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/create-temp-conversation", {
        method: "POST",
        headers: {
            ...defaultHeader()
        },
        body: formData
    });

    const parsedResponse: any = await response.json();
    if (response.status > 299 || !response.ok) {
        // throw Error(parsedResponse.error || "Unknown error");
        return Promise.reject(parsedResponse.error || "Unknown error")
    }

    return parsedResponse;
}

export async function getFileDocument(options: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/download-reference-document?document_id="+options.id, {
        method: "GET",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        }
    });

    const headers = response.headers;

    const parsedResponse = await response.arrayBuffer();
    // if (response.status > 299 || !response.ok) {
    //     throw Error(parsedResponse.error || "Unknown error");
    // }

    return {headers, parsedResponse};
}

export async function downloadAttachFile(options: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_BASE_DOMAIN + "/download-attached-file", {
        method: "POST",
        headers: {
            ...defaultHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    });

    const parsedResponse = await response.arrayBuffer();
    // if (response.status > 299 || !response.ok) {
    //     throw Error(parsedResponse.error || "Unknown error");
    // }

    return parsedResponse;
}