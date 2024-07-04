import { type } from "os";

export const enum Approaches {
    RetrieveThenRead = "rtr",
    ReadRetrieveRead = "rrr",
    ReadDecomposeAsk = "rda"
}

export type AskRequestOverrides = {
    semanticRanker?: boolean;
    semanticCaptions?: boolean;
    excludeCategory?: string;
    top?: number;
    temperature?: number;
    temperature_gen_query?: number;
    promptTemplate?: string;
    promptTemplatePrefix?: string;
    promptTemplateSuffix?: string;
    suggestFollowupQuestions?: boolean;
    semantic_law_retriever?: boolean;
    fulltext_search_retriever?: boolean;
    no_prompt?: boolean;
    no_search_engine?: boolean;
    rerank_retrieve?: boolean;
    no_gen_query?: boolean;
    chatgpt_model?: string;
    chatgpt_model_gen_query?: string;
    retrievalMode?: string;
    prefix_prompt: string;
    follow_up_prompt: string;
    query_prompt: string;
    conversation_id: string;
};

export type AskRequest = {
    question: string;
    approach: Approaches;
    overrides?: any;
};

export type ButtonFollowupAnswer = {
    type: string
    text: string;
    text_display: string;
};

export type AskResponse = {
    gen_query: any;
    is_legal: boolean
    documents: string[];
    buttons: ButtonFollowupAnswer[]
    rerank_scores: string[];
    reference_urls: string[];
    answer: string;
    thoughts: string | null;
    data_points: string[];
    semantic_scores: string[],
    error?: string;
    citation?:any,
    reference_citations?:any,
    data?:any,
    overrides?: any
    id: string
};

export type AskResponsePrompt = {
    // follow_up_prompt: string;
    prefix_prompt: string;
    query_prompt: string,
    enterprise_id: string,
    is_apply: "",
    id: "",  
    error?: string;
};

export type AskResponseDefaultQuestion = {
    
}

export type ChatTurn = {
    user: string;
    bot?: string;
    gen_query?: string
};

export type ChatRequest = {
    history?: ChatTurn[];
    approach?: Approaches;
    overrides?: any;
    query?: string;
    fullname?: string;
    username?: string
};

export type ChatRequestVtcc = {
    query?: string
};

export type CitationsRequest = {
    content: string
};

export type CitationsCompareRequest = {
    word: string;
    textList?: string[]
};

export type PromptRequest = {
    bot: string;
    password: string;
    prefixPrompt: string;
    followUpPrompt: string;
    queryPrompt: string;
    idPrompt: string;
    is_apply: boolean
}
export type DefaultQuestionRequest = {
    type: string;
    data: string[];
    id: string
}
export type DocumentSupportResponse = {
    id?: string;
    name?: string;
    totalLaw?: number;
    lawDocuments?: any;
    error?:any,
    data?:any
};