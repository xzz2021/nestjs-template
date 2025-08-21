// import { Prisma } from '@prisma/client';
// import { BadRequestException } from '@nestjs/common';
// export const safePrisma = (fn: (...args: any[]) => Promise<any>) => {
//   return async (...args: any[]) => {
//     try {
//       return await fn(...args);
//     } catch (error) {
//       if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         throw new BadRequestException(error);
//       }
//       throw error;
//     }
//   };
// };
