import { Injectable } from '@nestjs/common';
import { request } from 'undici';
import { URLSearchParams } from 'url';
import { Readable } from 'stream';

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  responseType?: 'json' | 'text' | 'stream' | 'buffer';
}

type resultType = string | number | boolean | null | Buffer | object | Array<any> | Readable;

export interface resultDataType<T> {
  code: number;
  message: string;
  data: T;
}
@Injectable()
export class UndiciHttpService {
  async request<T = any>(path: string, options: HttpRequestOptions = {}): Promise<resultDataType<T>> {
    const { method = 'GET', headers = {}, body, query, responseType = 'json' } = options;

    let url = path;

    // 拼接 query 参数
    if (query && Object.keys(query).length > 0) {
      const searchParams = new URLSearchParams(query).toString();
      url += url.includes('?') ? '&' + searchParams : '?' + searchParams;
    }

    // 判断是否需要序列化 body
    let serializedBody: string | undefined;
    const contentType = headers['content-type'] || headers['Content-Type'];

    if (body) {
      if (!contentType || contentType.includes('application/json')) {
        serializedBody = JSON.stringify(body);
        headers['content-type'] = 'application/json';
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        serializedBody = new URLSearchParams(body as Record<string, any>).toString();
      } else {
        serializedBody = body; // 原样传入，如 formData、stream
      }
    }

    try {
      const res = await request(url, {
        method,
        headers,
        body: serializedBody,
      });

      const { statusCode, body: resBody } = res;

      if (statusCode >= 400) {
        return {
          code: statusCode,
          message: `请求失败（HTTP ${statusCode}）`,
        } as any;
      }

      let result: resultType = 'no data';
      switch (responseType) {
        case 'text':
          result = await resBody.text();
          break;
        case 'buffer':
          result = Buffer.from(await resBody.arrayBuffer()) as any;
          break;
        case 'stream':
          result = resBody as Readable;
          break;
        default:
          result = resBody.json() as resultType;
      }
      return {
        code: 200,
        message: '请求成功',
        data: result as T,
      };
    } catch (error: any) {
      console.error('[UndiciHttpService] 请求异常:', error?.cause ?? error);
      return {
        code: 400,
        message: '请求异常：' + (error?.cause?.message || error.message || '未知错误'),
        data: null,
      } as any;
    }
  }

  get<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, options: Omit<HttpRequestOptions, 'method'> & { body: any }) {
    return this.request<T>(path, { ...options, method: 'POST' });
  }

  put<T>(path: string, options: Omit<HttpRequestOptions, 'method'> & { body: any }) {
    return this.request<T>(path, { ...options, method: 'PUT' });
  }

  delete<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
