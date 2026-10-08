import { extractText } from "unpdf";

export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  try {
    const extracted = await extractText(bytes, { mergePages: true });
    return extracted.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "falha ao extrair texto";
    throw new Error(`Não foi possível extrair texto do PDF. ${message}`, { cause: error });
  }
}
