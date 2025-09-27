import * as TE from 'fp-ts/TaskEither';
import { RestaurantDataType, ScrapingResult } from './types';
/**
 * リトライ機能付きで店舗情報を抽出する関数
 */
export declare const scrapeRestaurantWithRetry: (url: string) => TE.TaskEither<string, RestaurantDataType>;
/**
 * 複数のURLから店舗情報を抽出する関数
 */
export declare const scrapeMultipleRestaurants: (urls: string[]) => TE.TaskEither<string, ScrapingResult[]>;
/**
 * ブラウザを閉じる関数（cheerioでは不要だが、互換性のため残す）
 */
export declare const closeBrowser: () => TE.TaskEither<string, void>;
//# sourceMappingURL=scraper.d.ts.map