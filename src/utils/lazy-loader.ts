// src/common/utils/lazy-loader.ts
import { ModuleRef } from '@nestjs/core';

/**
 * 通用懒加载 + 单例缓存封装器
 */
export class LazyServiceLoader<T> {
  private instance: T | null = null;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly serviceType: new (...args: any[]) => T,
  ) {}

  /**
   * 获取服务实例（仅第一次创建）
   */
  async getInstance(): Promise<T> {
    if (!this.instance) {
      this.instance = await this.moduleRef.create(this.serviceType);
    }
    return this.instance;
  }

  /**
   * 手动释放（重置）实例缓存
   */
  clear(): void {
    this.instance = null;
  }

  /**
   * 是否已创建过实例
   */
  isInitialized(): boolean {
    return this.instance !== null;
  }
}

/**
 * 工厂方法：更方便创建懒加载服务封装器
 */
export function createLazyLoader<T>(moduleRef: ModuleRef, service: new (...args: any[]) => T): LazyServiceLoader<T> {
  return new LazyServiceLoader<T>(moduleRef, service);
}

/*

@Injectable()
export class UserService {
  private mailLoader: LazySingletonLoader<MailService>;

  constructor(private readonly moduleRef: ModuleRef) {
    this.mailLoader = createLazyLoader(this.moduleRef, MailService);
  }

  async register(email: string) {
    const mail = await this.mailLoader.get();
    mail.send(email, 'Welcome to the platform!');
  }
}

*/
