// import retry from 'async-retry';

// export interface PrismaRetryOptions {
//   retries?: number;
//   minTimeout?: number;
//   maxTimeout?: number;
//   shouldRetry?: (err: any) => boolean;
// }

// export function PrismaRetry(options: PrismaRetryOptions = {}) {
//   const {
//     retries = 3,
//     minTimeout = 100,
//     maxTimeout = 1000,
//     shouldRetry = err => {
//       // 默认仅重试连接类错误
//       return (
//         err.code === 'P1001' || // Prisma: database timeout
//         err.code === 'ECONNRESET' ||
//         err.code === 'ETIMEDOUT' ||
//         err.code === 'ECONNREFUSED'
//       );
//     },
//   } = options;

//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     const originalMethod = descriptor.value;

//     descriptor.value = async function (...args: any[]) {
//       return retry(
//         async () => {
//           return await originalMethod.apply(this, args);
//         },
//         {
//           retries,
//           minTimeout,
//           maxTimeout,
//           factor: 2,
//           onRetry: (err, attempt) => {
//             console.warn(`[PrismaRetry] Attempt ${attempt} failed: ${err.message}`);
//           },
//           retry: err => shouldRetry(err),
//         },
//       );
//     };

//     return descriptor;
//   };
// }
