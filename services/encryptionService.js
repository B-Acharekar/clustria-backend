import crypto from "crypto";

export const encryptFile = async (buffer, type, key) => {
  if (type === "AES") {
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), Buffer.alloc(16, 0));
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return encrypted;
  } else if (type === "ZKE") {
    // Client-side encryption logic
    // Buffer already encrypted in front-end
    return buffer;
  }
};
