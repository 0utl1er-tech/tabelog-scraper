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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTimestampedFilename = exports.ensureOutputDirectory = exports.writeErrorLogToCsv = exports.writeRestaurantDataToCsv = exports.readUrlsFromCsv = void 0;
const TE = __importStar(require("fp-ts/TaskEither"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_writer_1 = require("csv-writer");
/**
 * CSVファイルからURLを読み込む関数
 */
const readUrlsFromCsv = (filePath) => TE.tryCatch(() => new Promise((resolve, reject) => {
    const urls = [];
    if (!fs.existsSync(filePath)) {
        reject(new Error(`File not found: ${filePath}`));
        return;
    }
    fs.createReadStream(filePath)
        .pipe((0, csv_parser_1.default)())
        .on('data', (row) => {
        if (row.urls && typeof row.urls === 'string') {
            urls.push(row.urls.trim());
        }
    })
        .on('end', () => {
        resolve(urls);
    })
        .on('error', (error) => {
        reject(error);
    });
}), (error) => `Failed to read CSV file: ${error}`);
exports.readUrlsFromCsv = readUrlsFromCsv;
/**
 * 店舗データをCSVに出力する関数
 */
const writeRestaurantDataToCsv = (data, outputPath) => TE.tryCatch(() => {
    const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: outputPath,
        header: [
            { id: 'url', title: 'URL' },
            { id: 'name', title: '店舗名' },
            { id: 'rating', title: '評価' },
            { id: 'reviewCount', title: 'レビュー数' },
            { id: 'priceRange', title: '価格帯' },
            { id: 'cuisine', title: '料理ジャンル' },
            { id: 'address', title: '住所' },
            { id: 'phone', title: '電話番号' },
            { id: 'hours', title: '営業時間' },
            { id: 'closedDays', title: '定休日' },
            { id: 'totalSeats', title: '総席数' },
            { id: 'privateRooms', title: '個室' },
            { id: 'smoking', title: '喫煙' },
            { id: 'parking', title: '駐車場' },
            { id: 'creditCards', title: 'カード利用' },
            { id: 'wifi', title: 'Wi-Fi' },
            { id: 'otherFacilities', title: 'その他設備' },
            { id: 'lunchMenu', title: 'ランチメニュー' },
            { id: 'dinnerMenu', title: 'ディナーメニュー' },
            { id: 'specialMenu', title: '特別メニュー' },
            { id: 'drinks', title: 'ドリンク' },
            { id: 'otherMenu', title: 'その他メニュー' },
            { id: 'features', title: '特徴' },
            { id: 'atmosphere', title: '雰囲気' },
            { id: 'targetAudience', title: '対象客層' },
            { id: 'occasions', title: '利用シーン' },
            { id: 'reservationStatus', title: '予約可否' },
            { id: 'transportation', title: '交通手段' },
            { id: 'paymentMethods', title: '支払い方法' },
            { id: 'maxReservationCapacity', title: '最大予約可能人数' },
            { id: 'spaceAndFacilities', title: '空間・設備' },
            { id: 'relatedDrinks', title: '関連ドリンク' },
            { id: 'relatedCuisine', title: '関連料理' },
            { id: 'location', title: 'ロケーション' },
            { id: 'officialAccount', title: '公式アカウント' },
            { id: 'openingDate', title: 'オープン日' },
            { id: 'relatedStoreName', title: '関連店名' },
            { id: 'relatedContact', title: '関連連絡先' },
            { id: 'relatedAddress', title: '関連住所' },
            { id: 'relatedHours', title: '関連営業時間' },
            { id: 'relatedBudget', title: '関連予算' },
            { id: 'relatedSeats', title: '関連席数' },
            { id: 'relatedPrivateRooms', title: '関連個室' },
            { id: 'relatedRental', title: '関連貸切' },
            { id: 'relatedSmoking', title: '関連喫煙' },
            { id: 'relatedParking', title: '関連駐車場' },
            { id: 'relatedInfo', title: '関連情報' }
        ],
        encoding: 'utf8'
    });
    const csvData = data.map(restaurant => ({
        url: restaurant.url,
        name: restaurant.basicInfo.name,
        rating: restaurant.basicInfo.rating,
        reviewCount: restaurant.basicInfo.reviewCount,
        priceRange: restaurant.basicInfo.priceRange,
        cuisine: restaurant.basicInfo.cuisine,
        address: restaurant.basicInfo.address,
        phone: restaurant.basicInfo.phone,
        hours: restaurant.basicInfo.hours,
        closedDays: restaurant.basicInfo.closedDays,
        totalSeats: restaurant.seatsAndFacilities.totalSeats,
        privateRooms: restaurant.seatsAndFacilities.privateRooms,
        smoking: restaurant.seatsAndFacilities.smoking,
        parking: restaurant.seatsAndFacilities.parking,
        creditCards: restaurant.seatsAndFacilities.creditCards,
        wifi: restaurant.seatsAndFacilities.wifi,
        otherFacilities: restaurant.seatsAndFacilities.otherFacilities,
        lunchMenu: restaurant.menuInfo.lunchMenu,
        dinnerMenu: restaurant.menuInfo.dinnerMenu,
        specialMenu: restaurant.menuInfo.specialMenu,
        drinks: restaurant.menuInfo.drinks,
        otherMenu: restaurant.menuInfo.otherMenu,
        features: restaurant.featuresAndRelated.features,
        atmosphere: restaurant.featuresAndRelated.atmosphere,
        targetAudience: restaurant.featuresAndRelated.targetAudience,
        occasions: restaurant.featuresAndRelated.occasions,
        reservationStatus: restaurant.featuresAndRelated.reservationStatus,
        transportation: restaurant.featuresAndRelated.transportation,
        paymentMethods: restaurant.featuresAndRelated.paymentMethods,
        maxReservationCapacity: restaurant.featuresAndRelated.maxReservationCapacity,
        spaceAndFacilities: restaurant.featuresAndRelated.spaceAndFacilities,
        relatedDrinks: restaurant.featuresAndRelated.drinks,
        relatedCuisine: restaurant.featuresAndRelated.cuisine,
        location: restaurant.featuresAndRelated.location,
        officialAccount: restaurant.featuresAndRelated.officialAccount,
        openingDate: restaurant.featuresAndRelated.openingDate,
        relatedStoreName: restaurant.featuresAndRelated.relatedStoreName,
        relatedContact: restaurant.featuresAndRelated.relatedContact,
        relatedAddress: restaurant.featuresAndRelated.relatedAddress,
        relatedHours: restaurant.featuresAndRelated.relatedHours,
        relatedBudget: restaurant.featuresAndRelated.relatedBudget,
        relatedSeats: restaurant.featuresAndRelated.relatedSeats,
        relatedPrivateRooms: restaurant.featuresAndRelated.relatedPrivateRooms,
        relatedRental: restaurant.featuresAndRelated.relatedRental,
        relatedSmoking: restaurant.featuresAndRelated.relatedSmoking,
        relatedParking: restaurant.featuresAndRelated.relatedParking,
        relatedInfo: restaurant.featuresAndRelated.relatedInfo
    }));
    return csvWriter.writeRecords(csvData);
}, (error) => `Failed to write CSV file: ${error}`);
exports.writeRestaurantDataToCsv = writeRestaurantDataToCsv;
/**
 * エラーログをCSVに出力する関数
 */
const writeErrorLogToCsv = (errors, outputPath) => TE.tryCatch(() => {
    if (errors.length === 0) {
        return Promise.resolve(undefined);
    }
    const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: outputPath,
        header: [
            { id: 'url', title: 'URL' },
            { id: 'error', title: 'エラー内容' },
            { id: 'timestamp', title: 'エラー発生時刻' }
        ],
        encoding: 'utf8'
    });
    const csvData = errors.map(error => ({
        url: error.url,
        error: error.error,
        timestamp: error.timestamp.toISOString()
    }));
    return csvWriter.writeRecords(csvData);
}, (error) => `Failed to write error log CSV: ${error}`);
exports.writeErrorLogToCsv = writeErrorLogToCsv;
/**
 * 出力ディレクトリを作成する関数
 */
const ensureOutputDirectory = (outputPath) => TE.tryCatch(async () => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}, (error) => `Failed to create output directory: ${error}`);
exports.ensureOutputDirectory = ensureOutputDirectory;
/**
 * タイムスタンプ付きのファイル名を生成する関数
 */
const generateTimestampedFilename = (baseName, extension) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${baseName}_${timestamp}${extension}`;
};
exports.generateTimestampedFilename = generateTimestampedFilename;
//# sourceMappingURL=csvHandler.js.map