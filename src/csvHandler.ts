import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { RestaurantDataType, ScrapingError } from './types';

/**
 * CSVファイルからURLを読み込む関数
 */
export const readUrlsFromCsv = (filePath: string): TE.TaskEither<string, string[]> =>
  TE.tryCatch(
    () => new Promise<string[]>((resolve, reject) => {
      const urls: string[] = [];
      
      if (!fs.existsSync(filePath)) {
        reject(new Error(`File not found: ${filePath}`));
        return;
      }
      
      fs.createReadStream(filePath)
        .pipe(csv())
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
    }),
    (error) => `Failed to read CSV file: ${error}`
  );

/**
 * 店舗データをCSVに出力する関数
 */
export const writeRestaurantDataToCsv = (
  data: RestaurantDataType[],
  outputPath: string
): TE.TaskEither<string, void> =>
  TE.tryCatch(
    () => {
      const csvWriter = createObjectCsvWriter({
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
    },
    (error) => `Failed to write CSV file: ${error}`
  );

/**
 * エラーログをCSVに出力する関数
 */
export const writeErrorLogToCsv = (
  errors: ScrapingError[],
  outputPath: string
): TE.TaskEither<string, void> =>
  TE.tryCatch(
    () => {
      if (errors.length === 0) {
        return Promise.resolve(undefined);
      }

      const csvWriter = createObjectCsvWriter({
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
    },
    (error) => `Failed to write error log CSV: ${error}`
  );

/**
 * 出力ディレクトリを作成する関数
 */
export const ensureOutputDirectory = (outputPath: string): TE.TaskEither<string, void> =>
  TE.tryCatch(
    async () => {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    },
    (error) => `Failed to create output directory: ${error}`
  );

/**
 * タイムスタンプ付きのファイル名を生成する関数
 */
export const generateTimestampedFilename = (baseName: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}${extension}`;
};
