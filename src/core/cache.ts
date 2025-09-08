import { ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
// ---- 小工具函数 ----
function toBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const s = String(v ?? '')
    .trim()
    .toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

async function pingWithTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Redis ping 超时（>${ms}ms）`)), ms);
  });
  try {
    return await Promise.race([fn(), timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// 粗略判断 keyv 是否可用：一次 get 不抛错就当可用
async function isKeyvUsable(store: any): Promise<boolean> {
  try {
    await store.get('healthcheck_' + Date.now());
    return true;
  } catch {
    return false;
  }
}

async function chooseCache(config: ConfigService) {
  // 把字符串环境变量解析成布尔
  const useRedis = toBoolean(config.get('USE_REDIS'));

  // 统一 TTL（毫秒）
  const ttl = 1000;

  if (!useRedis) {
    // 内置内存缓存：什么都不配就是内存
    return { ttl };
  }

  const REDIS_URL = config.get<string>('REDIS_URL') ?? '';
  if (!REDIS_URL) {
    return { ttl };
  }
  // --- Redis 分支 ---
  const redisUrl = REDIS_URL.startsWith('redis://') ? REDIS_URL : `redis://${REDIS_URL}`;
  const store = new KeyvRedis(redisUrl);

  // 启动前做一次“可用性探测”，并设置超时，避免挂起
  await pingWithTimeout(() => store.get('test_connection'), 2000).catch(err => {
    // 两种策略任选其一：
    // 1) 直接失败，阻止应用启动（更安全）
    // throw new Error('Redis 初始化失败：' + err.message);

    // 2) 优雅降级到内存缓存（更韧性）
    console.warn('[Cache] Redis 不可用，降级为内存缓存：', err.message);
  });

  // 如果探测失败且你选择了“降级”，这里直接返回内存配置
  if (!(await isKeyvUsable(store))) {
    return { ttl }; // 内存
  }

  // 正常返回 Redis 存储
  return {
    name: 'redis',
    ttl,
    // cache-manager v5 支持多 store；你当前用法保持不变
    stores: [store],
  };
}

export const CACHE_MODULE = CacheModule.registerAsync({
  inject: [ConfigService],
  useFactory: chooseCache,
  isGlobal: true,
});

//  版本二   官方doc
// CacheModule.registerAsync({
//   useFactory: async () => {
//     return {
//       stores: [
//         new Keyv({
//           store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
//         }),
//         createKeyv('redis://localhost:6379'),
//       ],
//     };
//   },
// }),
