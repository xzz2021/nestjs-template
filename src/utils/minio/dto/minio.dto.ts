export interface MultipartUploadSession {
  uploadId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  totalChunks: number;
  uploadedChunks: number[];
  createdAt: Date;
  lastModified: Date;
  status: 'uploading' | 'completed' | 'failed';
  chunkETags: Map<number, string>; // 存储每个分片的 ETag
}

export interface UploadChunkDto {
  stream: NodeJS.ReadableStream;
  stat: any;
  objectName: string;
  size: number;
  mimeType: string;
}

export interface FileInfoDto {
  objectName: string;
  size: number;
  lastModified: Date;
  etag: string;
  mimeType: string;
  metaData: Record<string, any>;
}
export interface SearchFilesResDto {
  list: any[];
  total: number;
  message: string;
}
