import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';

interface SshConnectionInfo {
  ssh: NodeSSH;
  timer: NodeJS.Timeout;
}

@Injectable()
export class SshService implements OnModuleDestroy {
  // 理论上在这里应该建立map缓存每个连接  定时断开  或者 程序退出时断开所有
  // 静态缓存所有连接
  private static sshMap = new Map<string, SshConnectionInfo>();
  private ssh!: NodeSSH;
  constructor() {}

  async create({ host, username, password }: { host: string; username: string; password: string }) {
    const existing = SshService.sshMap.get(host);

    if (existing) {
      console.log('✅ 已存在连接，重置定时器');
      clearTimeout(existing.timer);
      // 重置销毁定时器
      existing.timer = this.setAutoDisposeTimer(host);
      this.ssh = existing.ssh;
      return;
    }

    console.log('🚀 创建新的 SSH 连接:', host);
    const ssh = new NodeSSH();
    await ssh.connect({ host, username, password });

    const timer = this.setAutoDisposeTimer(host);

    SshService.sshMap.set(host, { ssh, timer });
    this.ssh = ssh;
  }

  private setAutoDisposeTimer(host: string): NodeJS.Timeout {
    return setTimeout(
      () => {
        const entry = SshService.sshMap.get(host);
        if (entry) {
          console.log(`⏰ 自动断开 SSH 连接: ${host}`);
          entry.ssh.dispose();
          SshService.sshMap.delete(host);
        }
      },
      10 * 60 * 1000,
    ); // 10 分钟
  }

  // 可选：提供执行命令方法
  async execCommand(cmd: string) {
    if (!this.ssh) throw new Error('SSH 尚未连接');
    return await this.ssh.execCommand(cmd);
  }

  // 应用退出时清理所有连接
  static cleanupAll() {
    for (const [host, { ssh, timer }] of SshService.sshMap.entries()) {
      clearTimeout(timer);
      ssh.dispose();
      console.log(`🧹 清理 SSH 连接: ${host}`);
    }
    SshService.sshMap.clear();
  }
  async connect({ host, username, password }: { host: string; username: string; password: string }) {
    await this.ssh.connect({
      host,
      username,
      password,
      // 如果使用私钥连接：
      // privateKey: '/path/to/private/key'
    });
  }

  async runCommand(command: string): Promise<string> {
    const result = await this.ssh.execCommand(command);
    return result.stderr || result.stdout;
  }

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    await this.ssh.putFile(localPath, remotePath);
  }

  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    await this.ssh.getFile(localPath, remotePath);
  }

  dispose() {
    this.ssh.dispose();
  }
  // Nest 生命周期钩子，应用关闭时自动调用
  onModuleDestroy() {
    for (const { ssh, timer } of SshService.sshMap.values()) {
      clearTimeout(timer);
      ssh.dispose();
    }
    SshService.sshMap.clear();
  }
}
