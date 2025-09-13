import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";
import { AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME } from "../config.js";

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

export const uploadToAzure = async (filename, buffer) => {

  await containerClient.createIfNotExists(); // private container

  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/octet-stream" },
  });

  // Generate SAS token (1 hour read-only)
  const sasToken = generateBlobSASQueryParameters({
    containerName: CONTAINER_NAME,
    blobName: filename,
    permissions: BlobSASPermissions.parse("r"),
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
  }, blobServiceClient.credential).toString();

  return `${blockBlobClient.url}?${sasToken}`;
};

export const downloadFromAzure = async (filename) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
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

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => chunks.push(data));
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
};
