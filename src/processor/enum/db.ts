export enum WalletRecordType {
  RECHARGE, // 充值
  WITHDRAW, // 提现
  CONSUME, // 消费
  REFUND, // 退款
}

export enum BOMCategory {
  NUT, // 螺母
  PAINT, // 喷漆
  BRACES, // 牙套
  MATERIAL, // 材料
  OTHER, // 其他
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // 待支付
  PAID = 'PAID', // 已支付
  PRODUCING = 'PRODUCING', // 生产中
  SHIPPED = 'SHIPPED', // 已发货
  RECEIVED = 'RECEIVED', // 已收货  // 已完成
  CANCELLED = 'CANCELLED', // 已取消
  REFUNDED = 'REFUNDED', // 已退款
  PRICE_CHANGED = 'PRICE_CHANGED', // 已改价
  DELETED = 'DELETED', // 已删除
  // EXPIRED = 'EXPIRED', // 已过期
  // INVALID = 'INVALID', // 已失效
}

export enum ShipmentType {
  TOGETHER = 'together',
  SEPARATELY = 'separately',
}

export enum ReceiptType {
  PAPER = 'paper',
  ELECTRONIC = 'electronic',
}

export enum OrderType {
  MODEL = 'MODEL', // 模型
  PRINT = 'PRINT', // 打印
  SCAN = 'SCAN', // 扫描
  DESIGN = 'DESIGN', // 设计
  CNC_MACHINING = 'CNC', // 数控加工
  HAND_MODEL = 'HAND', // 手板复模
}

export enum MaterialType {
  //  光敏树脂 高分子粉末  金属粉末  线材  陶瓷   尼龙
  RESIN = 'RESIN', // 光敏树脂
  POLYMER_POWDER = 'POLYMER_POWDER', // 高分子粉末
  METAL_POWDER = 'METAL_POWDER', // 金属粉末
  WIRE = 'WIRE', // 线材
  CERAMIC = 'CERAMIC', // 陶瓷
  NYLON = 'NYLON', // 尼龙
  OTHER = 'OTHER', // 其他
}

export enum MaterialProcess {
  LIGHT_CURE = 'LIGHT_CURE', // 光固化
  CUT = 'CUT', // 切割
  DRILL = 'DRILL', // 钻孔
  OTHER = 'OTHER', // 其他
}

//  上传    历史     购物车    订单
export enum File3DType {
  STL, // stl
  OBJ, // obj
  STP, // stp
  IGS, // igs
}

export enum PayMethod {
  WECHAT, // 微信
  ALIPAY, // 支付宝
  WALLET, // 钱包
  BANK, // 银行卡
  CREDIT, // 信用额度
}

export enum PayOrderStatus {
  SUCCESS, // 成功
  FAILED, // 失败
  PROCESSING, // 处理中
  CANCELLED, // 已取消
}
