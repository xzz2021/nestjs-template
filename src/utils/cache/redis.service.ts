import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { ClientContext, RedisOptions, Result } from 'ioredis';
//  使用单个实例  这样有局限性 需要重写方法
type ObjectType = Record<string, any>;
const isObject = (obj: any) => {
  return Object.is(toString.call(obj), '[object Object]');
};
@Injectable()
export class RedisService {
  constructor(private readonly configService: ConfigService) {}
  public redisClient!: Redis;

  onModuleInit() {
    if (!this.redisClient) {
      this.getClient();
    }
  }

  private getClient() {
    const redis = this.configService.get('redis') as RedisOptions;
    this.redisClient = new Redis(redis);
  }

  public async set(key: string, value: unknown): Promise<Result<'OK', ClientContext>>;
  public async set(key: string, value: unknown, second: number): Promise<Result<'OK', ClientContext>>;
  public async set(key: string, value: any, second?: number): Promise<Result<'OK', ClientContext>> {
    const newValue: string = isObject(value) ? JSON.stringify(value) : value;
    if (!second) {
      return await this.redisClient.set(key, newValue);
    } else {
      return await this.redisClient.set(key, newValue, 'EX', second);
    }
  }

  public async incr(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.incr(key);
  }

  public async get(key: string): Promise<Result<string | null, ClientContext>> {
    try {
      const data = await this.redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      } else {
        return null;
      }
    } catch (e) {
      return await this.redisClient.get(key);
    }
  }

  public async del(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.del(key);
  }

  async hset(key: string, field: ObjectType): Promise<Result<number, ClientContext>> {
    return await this.redisClient.hset(key, field);
  }

  async hget(key: string, field: string): Promise<Result<string | null, ClientContext>> {
    return await this.redisClient.hget(key, field);
  }

  async hgetall(key: string): Promise<Result<Record<string, string>, ClientContext>> {
    return await this.redisClient.hgetall(key);
  }

  public async flushall(): Promise<Result<'OK', ClientContext>> {
    return await this.redisClient.flushall();
  }
}
