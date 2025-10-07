// async-context.provider.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { Provider } from '@nestjs/common';

export type RequestContext = {
  reqId: string;
  userId?: string;
  tenantId?: string;
  txManager?: unknown; // 事务管理器 (TypeORM EntityManager / Prisma transaction client)
};

export const ALS = 'ALS_TOKEN';

export const AsyncContextProvider: Provider = {
  provide: ALS,
  useValue: new AsyncLocalStorage<RequestContext>(),
};
