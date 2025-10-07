import { Module } from '@nestjs/common';
import { AsyncContextProvider } from './async-context.provider';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ContextInitInterceptor } from './context-init.interceptor';
@Module({
  providers: [AsyncContextProvider, { provide: APP_INTERCEPTOR, useClass: ContextInitInterceptor }],
  exports: [AsyncContextProvider],
})
export class AlsModule {}
