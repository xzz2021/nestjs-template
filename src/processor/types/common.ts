export interface RequestLog {
  method: string;
  url: string;
  resCode: number;
  username?: string;
  feedbackMsg?: string;
  ip: string;
  userAgent: string;
  duration?: number;
}
