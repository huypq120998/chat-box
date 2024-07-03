import { DEFAULT_MODEL_VERSION, SEMANTIC_SEARCH } from "./constants"

export const defaultConfiguration = (): any => {
  const defaultConfig = {
    retrieval_mode: "text",

    //
    fulltext_search: SEMANTIC_SEARCH,
    fulltext_rule_search: {
      ner_rule_search: true,
      segment_rule_search: true,
      semantic_rule_search: true,
    },
    chatgpt_model_gen_query: DEFAULT_MODEL_VERSION,
    large_language_model: DEFAULT_MODEL_VERSION,
    top: 5,
    no_gen_query: false,
    auto_clear_chat: false,
    attach_history_count: 1,
    temperature: 0,
    temperature_gen_query: 0,
    play_voice: false,
    use_whitelist: true,
    google_seo: true,
    is_streaming: true,
  }
  return defaultConfig
}
