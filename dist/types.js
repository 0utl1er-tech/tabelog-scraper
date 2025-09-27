"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantData = exports.FeaturesAndRelated = exports.MenuInfo = exports.SeatsAndFacilities = exports.RestaurantBasicInfo = void 0;
const t = __importStar(require("io-ts"));
// 店舗基本情報の型定義
exports.RestaurantBasicInfo = t.type({
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
exports.SeatsAndFacilities = t.type({
    totalSeats: t.string,
    privateRooms: t.string,
    smoking: t.string,
    parking: t.string,
    creditCards: t.string,
    wifi: t.string,
    otherFacilities: t.string,
});
// メニューの型定義
exports.MenuInfo = t.type({
    lunchMenu: t.string,
    dinnerMenu: t.string,
    specialMenu: t.string,
    drinks: t.string,
    otherMenu: t.string,
});
// 特徴・関連情報の型定義
exports.FeaturesAndRelated = t.type({
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
exports.RestaurantData = t.type({
    url: t.string,
    basicInfo: exports.RestaurantBasicInfo,
    seatsAndFacilities: exports.SeatsAndFacilities,
    menuInfo: exports.MenuInfo,
    featuresAndRelated: exports.FeaturesAndRelated,
});
//# sourceMappingURL=types.js.map