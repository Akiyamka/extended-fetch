export type ExtendedFetchPreferences = {
  /** From client to server */
  onUploadProgress?: (e: { progress: number, bytes: number }) => void;
  /** From server to client */
  onDownloadProgress?: (e: { progress: number, bytes: number }) => void;
}