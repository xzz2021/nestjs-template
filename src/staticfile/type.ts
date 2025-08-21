export type Staticfile = {
  filename: string;
  filepath: string;
  uploaderId: number | null;
  uploader: string | null;
  extension: string | null;
  name: string;
  remark: string;
  sha256: string;
  size: number;
  url: string;
};

export enum AttachmentStoragePath {
  MATERIAL_IMG = 'static/material/img',
  CART_IMG = 'static/cart/img',
  CART_ATTACHMENT = 'static/cart/attachment',
}
