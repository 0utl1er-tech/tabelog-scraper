import * as t from 'io-ts';

// 店舗基本情報の型定義
export const RestaurantBasicInfo = t.type({
  name: t.string,
  rating: t.string,
  reviewCount: t.string,
  priceRange: t.string,
  cuisine: t.string,
  address: t.string,
  phone: t.string,
  hours: t.string,
  closedDays: t.string,
});

// 席・設備の型定義
export const SeatsAndFacilities = t.type({
  totalSeats: t.string,
  privateRooms: t.string,
  smoking: t.string,
  parking: t.string,
  creditCards: t.string,
  wifi: t.string,
  otherFacilities: t.string,
});

// メニューの型定義
export const MenuInfo = t.type({
  lunchMenu: t.string,
  dinnerMenu: t.string,
  specialMenu: t.string,
  drinks: t.string,
  otherMenu: t.string,
});

// 特徴・関連情報の型定義
export const FeaturesAndRelated = t.type({
  features: t.string,
  atmosphere: t.string,
  targetAudience: t.string,
  occasions: t.string,
  reservationStatus: t.string,
  transportation: t.string,
  paymentMethods: t.string,
  maxReservationCapacity: t.string,
  spaceAndFacilities: t.string,
  drinks: t.string,
  cuisine: t.string,
  location: t.string,
  officialAccount: t.string,
  openingDate: t.string,
  // 関連情報の個別項目
  relatedStoreName: t.string,
  relatedContact: t.string,
  relatedAddress: t.string,
  relatedHours: t.string,
  relatedBudget: t.string,
  relatedSeats: t.string,
  relatedPrivateRooms: t.string,
  relatedRental: t.string,
  relatedSmoking: t.string,
  relatedParking: t.string,
  relatedInfo: t.string,
});

// 統合された店舗情報の型定義
export const RestaurantData = t.type({
  url: t.string,
  basicInfo: RestaurantBasicInfo,
  seatsAndFacilities: SeatsAndFacilities,
  menuInfo: MenuInfo,
  featuresAndRelated: FeaturesAndRelated,
});

// 型のエクスポート
export type RestaurantBasicInfoType = t.TypeOf<typeof RestaurantBasicInfo>;
export type SeatsAndFacilitiesType = t.TypeOf<typeof SeatsAndFacilities>;
export type MenuInfoType = t.TypeOf<typeof MenuInfo>;
export type FeaturesAndRelatedType = t.TypeOf<typeof FeaturesAndRelated>;
export type RestaurantDataType = t.TypeOf<typeof RestaurantData>;

// エラーハンドリング用の型
export interface ScrapingError {
  url: string;
  error: string;
  timestamp: Date;
}

// 結果の型（成功または失敗）
export type ScrapingResult = 
  | { success: true; data: RestaurantDataType }
  | { success: false; error: ScrapingError };
