export interface VocabularyType {
  id: string;
  text: string;
  sound: string;
  class: string;
  definitions: string[] | [];
  phonetic: string;
  meaning: string;
  number: number;
}

export type StoryTypes = "top" | "new" | "show" | "ask" | "job";
