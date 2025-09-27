import * as TE from 'fp-ts/TaskEither';
import { RestaurantDataType, ScrapingError } from './types';
/**
 * CSVファイルからURLを読み込む関数
 */
export declare const readUrlsFromCsv: (filePath: string) => TE.TaskEither<string, string[]>;
/**
 * 店舗データをCSVに出力する関数
 */
export declare const writeRestaurantDataToCsv: (data: RestaurantDataType[], outputPath: string) => TE.TaskEither<string, void>;
/**
 * エラーログをCSVに出力する関数
 */
export declare const writeErrorLogToCsv: (errors: ScrapingError[], outputPath: string) => TE.TaskEither<string, void>;
/**
 * 出力ディレクトリを作成する関数
 */
export declare const ensureOutputDirectory: (outputPath: string) => TE.TaskEither<string, void>;
/**
 * タイムスタンプ付きのファイル名を生成する関数
 */
export declare const generateTimestampedFilename: (baseName: string, extension: string) => string;
//# sourceMappingURL=csvHandler.d.ts.map