import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";

const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

export async function extractTextFromAzureBlob(blobUrl, ext) {
  try {
    if (["txt", "csv", "md"].includes(ext)) {
      // For simple text files, just download buffer
      const res = await fetch(blobUrl);
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString("utf-8");
    } else {
      // For PDF/DOCX use Form Recognizer
      const poller = await client.beginAnalyzeDocument("prebuilt-read", blobUrl);
      const result = await poller.pollUntilDone();

      let fullText = "";
      for (const page of result.pages || []) {
        fullText += page.lines.map(line => line.content).join("\n") + "\n";
      }
      return fullText.trim();
    }
  } catch (err) {
    console.error("Text extraction failed:", err);
    return "";
  }
}
