import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";

const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

const client = endpoint && apiKey
  ? new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey))
  : null;

export async function extractTextFromBuffer(buffer, ext, mimeType) {
  try {
    if (["txt", "csv", "md"].includes(ext)) {
      return buffer.toString("utf-8");
    }

    if (!client) throw new Error("Azure Document Intelligence is not configured");

    // Analyze the uploaded bytes directly. Passing the in-memory buffer avoids
    // exposing a temporary blob URL before the file has been saved.
    const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer, {
      contentType: mimeType || "application/octet-stream",
    });
    const result = await poller.pollUntilDone();

    return (result.pages || [])
      .flatMap(page => (page.lines || []).map(line => line.content))
      .join("\n")
      .trim();
  } catch (err) {
    console.error("Text extraction failed:", err);
    return "";
  }
}
