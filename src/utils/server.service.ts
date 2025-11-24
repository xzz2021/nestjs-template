import { Injectable } from '@nestjs/common';
import * as systeminformation from 'systeminformation';
@Injectable()
export class ServerService {
  /* 获取cpu信息 */
  async getCpu() {
    const cup = await systeminformation.cpuCurrentSpeed();
    const currentLoad = await systeminformation.currentLoad();
    const { currentLoadUser, currentLoadSystem } = currentLoad;
    return {
      cpuNum: cup.cores.length,
      used: currentLoadUser.toFixed(2),
      sys: currentLoadSystem.toFixed(2),
      free: (100 - Number(currentLoadUser) - Number(currentLoadSystem)).toFixed(2),
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
    const { hostname, platform, arch } = osInfo;
    const ip = await systeminformation.networkGatewayDefault();
    return {
      computerName: hostname,
      osName: platform,
      computerIp: ip,
      osArch: arch,
    };
  }

  /* 获取node信息 */
  getNode() {
    const { title, version, execPath, argv, uptime, cwd } = process as any;
    return {
      title,
      version,
      execPath,
      argv: argv.slice(2).join(','),
      cwd: cwd(),
      uptime: uptime().toFixed(0),
    };
  }

  /* 获取磁盘状态 */
  async getSysFiles() {
    const disk = await systeminformation.fsSize();
    const sysFilesArr = disk.map(item => {
      const dirName = item.fs;
      const sysTypeName = item.type;
      const typeName = item.mount;
      const total = (item.size / (1024 * 1024 * 1024)).toFixed(2);
      const used = (item.used / (1024 * 1024 * 1024)).toFixed(2);
      const free = (Number(total) - Number(used)).toFixed(2); // 注意精度

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
    const [cpu, mem, sys, node, sysFiles] = await Promise.all([
      this.getCpu(),
      this.getMem(),
      this.getSys(),
      Promise.resolve(this.getNode()),
      this.getSysFiles(),
    ]);

    return { cpu, mem, sys, node, sysFiles, message: '获取服务器信息成功' };
  }
}
