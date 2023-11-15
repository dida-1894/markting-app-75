import { Api } from './fetch';

export enum MerchandiseType {
  EXPOSURE = 'EXPOSURE', // 曝光
  CLICK = 'CLICK', // :1 点击
  CLICK_RATIO = 'CLICK_RATIO', // :2 点击率
  CPC = 'CPC', // :3 CPC
  COST = 'COST', // :4 花费
  ORDER_COUNT = 'ORDER_COUNT', // :5 订单量
  GMV = 'GMV', // :6 GMV
  ROI = 'ROI', // :7 ROI
  DATE = 'DATE', // :8 日期
  CPM = 'CPM', // :9 CPM
  SHOP_FAVORITES = 'SHOP_FAVORITES', // :10 店铺收藏
  ITEM_FAVORITES = 'ITEM_FAVORITES', // :11 商品收藏
}
export interface IAllMerchandiseParams {
  pageSize?: number; //		NO	每页行数，默认10
  pageNumber?: number; //		NO	当前页号，默认1
  goodsIds?: string; //		NO	商品id，如果多个id则中间用英文逗号分隔
  startDate?: string; //	NO	报表开始日期 格式：yyyy-MM-dd HH:mm:ss
  endDate?: string; //	NO	报表结束日期 格式：yyyy-MM-dd HH:mm:ss
  orderBy?: MerchandiseType; //		NO	排序字段，默认以花费排序，使用枚举中的orderBy字段
  sort?: 'DESC' | 'ASC'; // DESC :0 ASC :1
}

export interface IUndeclaredParams {
  pageSize?: number; //		NO	每页行数，默认10
  pageNumber?: number; //		NO	当前页号，默认1
  goodsIds?: string; //		NO	商品id，
  current?: number;
}

export interface IUndeclaredItem {
  thumbUrl: string; // url
  goodsName: string; //	商品名称
  goodsId: number; //	integer	商品id
  isOnsale: 0 | 1; //	integer	上下架状态 1：上架；0：下架
  goodsQuantity: number; // 商品库存
  roiStatus?: string;
  maxCostStatus?: number;
  maxCost?: number;
  optimizationBid?: number;
  targetRoi?: number;
}

export interface IMerchandiseItem {
  adName: string; //	单元名称
  adStatus: number; //	integer	广告状态
  dataOperateStatus: 1 | 2; // 计划状态
  thumbUrl: string; // url
  goodsId: number; // id
  minGroupPrice: number; // 最小团购价
  optimizationBid: number; // 成交出价
  targetRoi: number; //	integer	目标ROI
  maxCost: number;
  reportInfo: {
    avgPayAmount: number;
    avgSpendAmount: number;
    avgDirectPayAmount: number;
    avgIndirectPayAmount: number;
    click: number;
    impression: number;
    ctr: number; // | 广告点击率 |
    cvr: number; // | 点击转化率 |
    cpc: number; // |  | CPC |
    spend: number; // |  | 广告消耗 |
    gmv: number; // gmv
    orderNum: number; // 广告转化支付订单量
    roi: number; // | 广告投入产出比 |
    globalTakeRate: number; // | 全站费比 spend / globalGmv |
    directGmv: number; //| 直接成交交易额 |
    indirectGmv: number; //| 间接成交交易额 |
    directOrderNum: number; // integer | 直接成交笔数 |
    indirectOrderNum: number; // integer | 间接成交笔数 |
    cpm: number; // | 千次展现成本 |
  };
}

export interface ISuggestItem {
  defaultBidType: string; //	默认推荐出价方式 TARGET_ROI :1 OPTIMIZATION_BID :2
  goodsId: number; //	integer	商品id
  suggestOptimizationBid: number; //	推荐成交金额 如果没有出价权限，值为0
  suggestTargetRoi: number; //	integer	推荐目标ROI，如果没有出价权限，值为0
}

interface ResponseApi<T> {
  code: number;
  data: T;
}
export interface IMerchandiseRes {
  total: number;
  list: IMerchandiseItem[];
}
export const getAllMerchandise = async (params: IAllMerchandiseParams) => {
  return Api.get<ResponseApi<IMerchandiseRes>>(
    'pdd/tr/list',
    params as Record<string, string>,
  ).then(({ code, data }) => {
    if (code === 200) return data;
  });
};

export const updateTargetRoi = async (goodsId: number, targetRoi: number) => {
  return Api.post<ResponseApi<null>>('pdd/tr/modify/target-roi', { goodsId, targetRoi });
};

export const updateOptimizationBid = async (goodsId: number, optimizationBid: number) => {
  return Api.post<ResponseApi<null>>('pdd/tr/modify/optimization-bid', {
    goodsId,
    optimizationBid,
  });
};

export const updateMaxCost = async (goodsId: number, maxCost: number) => {
  return Api.post<ResponseApi<null>>('pdd/tr/modify/max-cost', { goodsId, maxCost });
};

export const updateGoodsStatus = async (goodsIds: string, status: 'ON' | 'OFF') => {
  return Api.post<ResponseApi<null>>('pdd/tr/modify/status', { goodsIds, status });
};

export const getUndeclared = async (params: IUndeclaredParams) => {
  return Api.get<ResponseApi<{ total: number; list: IUndeclaredItem[]; pageNumber: number }>>(
    'pdd/tr/goods',
    params as Record<string, string>,
  ).then(({ code, data }) => {
    if (code === 200) return data;
  });
};

export const getSuggests = async (goodsId: string) => {
  return Api.get<ResponseApi<ISuggestItem[]>>('pdd/tr/bid/suggest', { goodsId });
};

export const createMerchandise = async (data: any) => {
  return Api.post<ResponseApi<{ goodsId: number; success: boolean }[]>>('pdd/tr/create', data);
};
