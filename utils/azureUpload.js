import path from "path";
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";
import { AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME } from "../config.js";

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

// Mapping extensions → MIME types
const mimeTypes = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".txt": "text/plain",
};

export const uploadToAzure = async (filename, buffer, blobName = filename) => {
  await containerClient.createIfNotExists(); // private container

  // Detect MIME type from file extension
  const ext = path.extname(filename).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  // Generate SAS token (1 hour read-only)
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER_NAME,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + 3600 * 1000), // 1 hour
    },
    blobServiceClient.credential
  ).toString();

  return {
    url: `${blockBlobClient.url}?${sasToken}`,
    blobName,
  };
};

export const downloadFromAzure = async (filename) => {
  const blockBlobClient = containerClient.getBlockBlobClient(filename);

  const downloadResponse = await blockBlobClient.download();
  const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);

  return downloaded;
};

export const deleteFromAzure = async (filename) => {
  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  await blockBlobClient.deleteIfExists();
  return true;
};

export const copyBlob = async (oldName, newName) => {
  const sourceBlobClient = containerClient.getBlobClient(oldName);
  const destBlobClient = containerClient.getBlockBlobClient(newName);

  // Start copy
  const copyPoller = await destBlobClient.beginCopyFromURL(sourceBlobClient.url);
  await copyPoller.pollUntilDone();
};

export const deleteBlob = async (blobName) => {
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.deleteIfExists();
};

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => chunks.push(data));
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
};
