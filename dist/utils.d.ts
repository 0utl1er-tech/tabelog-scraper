import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { ScrapingResult, ScrapingError } from './types';
/**
 * 文字列を安全に取得する関数
 * 要素が存在しない場合は空文字列を返す
 */
export declare const safeGetText: (element: Element | null) => string;
/**
 * セレクターから要素を安全に取得する関数
 */
export declare const safeQuerySelector: (parent: Element | Document, selector: string) => O.Option<Element>;
/**
 * セレクターから複数の要素を安全に取得する関数
 */
export declare const safeQuerySelectorAll: (parent: Element | Document, selector: string) => Element[];
/**
 * テーブルの行からキーと値を抽出する関数
 */
export declare const extractTableRow: (row: Element) => [string, string];
/**
 * テーブルからデータを抽出する関数
 */
export declare const extractTableData: (table: Element) => Record<string, string>;
/**
 * エラーをEitherに変換する関数
 */
export declare const toEither: <T>(value: T | null, errorMessage: string) => E.Either<string, T>;
/**
 * 非同期エラーをTaskEitherに変換する関数
 */
export declare const toTaskEither: <T>(promise: Promise<T>, errorMessage: string) => TE.TaskEither<string, T>;
/**
 * 成功した結果のみをフィルタリングする関数
 */
export declare const filterSuccessfulResults: (results: ScrapingResult[]) => any[];
/**
 * 失敗した結果のみをフィルタリングする関数
 */
export declare const filterFailedResults: (results: ScrapingResult[]) => ScrapingError[];
/**
 * デバウンス機能付きの遅延関数
 */
export declare const delay: (ms: number) => Promise<void>;
/**
 * リトライ機能付きの関数実行
 */
export declare const withRetry: <T>(fn: () => Promise<T>, maxRetries?: number, delayMs?: number) => TE.TaskEither<string, T>;
//# sourceMappingURL=utils.d.ts.map