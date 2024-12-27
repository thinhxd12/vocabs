import { DrizzleError, eq } from "drizzle-orm";
import { db } from "../index";
import { bookmarkTable, SelectVocab, vocabTable } from "../schema";

export const deleteVocabById = async (id: SelectVocab["id"]) => {
  try {
    await db.delete(vocabTable).where(eq(vocabTable.id, id));
    return {
      status: true,
      data: { message: "Action was successful!" } as DrizzleError,
    };
  } catch (error) {
    return {
      status: false,
      data: error as DrizzleError,
    };
  }
};

export const deleteBookmarkById = async (id: SelectVocab["id"]) => {
  try {
    await db.delete(bookmarkTable).where(eq(bookmarkTable.id, id));
  } catch (error) {
    console.log(error);
  }
};
