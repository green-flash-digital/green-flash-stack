/**
 * Decodes a base64 string into human readable content
 */
export function decodeBlobContent(encodedContent: string) {
  const decoded = Buffer.from(encodedContent, "base64").toString("utf-8");
  return decoded;
}
