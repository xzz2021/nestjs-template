import { Injectable } from '@nestjs/common';
import * as systeminformation from 'systeminformation';
@Injectable()
export class ServerService {
  /* 获取cpu信息 */
  async getCpu() {
    const cup = await systeminformation.cpu();
    const currentLoad = await systeminformation.currentLoad();
    return {
      cpuNum: cup.cores,
      used: currentLoad.currentLoadUser.toFixed(2),
      sys: currentLoad.currentLoadSystem.toFixed(2),
      free: (100 - currentLoad.currentLoadUser - currentLoad.currentLoadSystem).toFixed(2),
    };
  }

  /* 获取内存信息 */
  async getMem() {
    const mem = await systeminformation.mem();
    const total = (mem.total / (1024 * 1024 * 1024)).toFixed(2);
    const used = (mem.active / (1024 * 1024 * 1024)).toFixed(2);
    const free = (mem.available / (1024 * 1024 * 1024)).toFixed(2);
    const usage = ((mem.active * 100) / mem.total).toFixed(2);
    return {
      total,
      used,
      free,
      usage,
    };
  }

  /* 服务器信息 */
  async getSys() {
    const osInfo = await systeminformation.osInfo();
    const networkInterfaces = systeminformation.networkInterfaces;
    const net = await networkInterfaces();
    return {
      computerName: osInfo.hostname,
      osName: osInfo.platform,
      computerIp: net[0].ip4,
      osArch: osInfo.arch,
    };
  }

  /* 获取node信息 */
  getNode() {
    const { title, version, execPath, argv, uptime, cwd } = process as any;
    // console.log('process--------', process);
    return {
      title,
      version,
      execPath,
      argv: argv.slice(2).join(','),
      cwd: cwd(),
      uptime: uptime().toFixed(0), // 转换为时间
    };
  }

  /* 获取磁盘状态 */
  async getSysFiles() {
    const fsSize = systeminformation.fsSize;
    const disk = await fsSize();
    const sysFilesArr = disk.map(item => {
      const dirName = item.fs;
      const sysTypeName = item.type;
      const typeName = item.mount;
      const total = (item.size / (1024 * 1024 * 1024)).toFixed(2);
      const free = (item.size / (1024 * 1024 * 1024) - item.used / (1024 * 1024 * 1024)).toFixed(2);
      const used = (item.used / (1024 * 1024 * 1024)).toFixed(2);
      const usage = item.use.toFixed(2) + '%';
      return {
        dirName,
        sysTypeName,
        typeName,
        total,
        free,
        used,
        usage,
      };
    });
    return sysFilesArr;
  }

  async getServerInfo() {
    const cpu = await this.getCpu();
    const mem = await this.getMem();
    const sys = await this.getSys();
    const node = this.getNode();
    const sysFiles = await this.getSysFiles();
    return { cpu, mem, sys, node, sysFiles };
  }
}
