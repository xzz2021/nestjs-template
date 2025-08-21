enum ContactType {
  SENDER = 1,
  RECEIVER = 2,
}

enum ExpressTypeId {
  顺丰特快 = 1,
  顺丰标快 = 2,
  顺丰即日 = 6,
}

export interface ContactInfo {
  contactType: ContactType; // 地址类型： 1，寄件方信息 2，到件方信息
  contact: string;
  mobile: string;
  address: string;
  country: string; // 内地件CN 香港852
  company?: string;
}
// 1:寄方付 2:收方付 3:第三方付
enum PayMethod {
  SENDER = 1,
  RECEIVER = 2,
  THIRD = 3,
}
interface CargoDetail {
  name: string;
}
export interface CreateOrderData {
  language: string;
  orderId: string;
  cargoDetails: CargoDetail[];
  contactInfoList: ContactInfo[];
  payMethod: PayMethod;
  totalWeight: number; //  单位千克， 精确到小数点后3位，如果提供此值， 必须>0
  isReturnRoutelabel: number; // 0:不返回 1:返回  默认要传1
  monthlyCard?: string; // 月结卡号  月结支付时传值，现结不需传值；
  expressTypeId?: ExpressTypeId; // 快递类型  1为特快
}

export interface InputOrderData {
  orderId: string;
  contactInfo: ContactInfo;
  payMethod: PayMethod;
  totalWeight: number;
  cargoDetails: CargoDetail[];
  isMonthlyCard: boolean; // 是否月结
  expressTypeId?: ExpressTypeId;
}
