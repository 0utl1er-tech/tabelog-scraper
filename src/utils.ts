import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { ScrapingResult, ScrapingError } from './types';

/**
 * 文字列を安全に取得する関数
 * 要素が存在しない場合は空文字列を返す
 */
export const safeGetText = (element: Element | null): string =>
  pipe(
    O.fromNullable(element),
    O.map(el => el.textContent?.trim() || ''),
    O.getOrElse(() => '')
  );

/**
 * セレクターから要素を安全に取得する関数
 */
export const safeQuerySelector = (parent: Element | Document, selector: string): O.Option<Element> =>
  O.fromNullable(parent.querySelector(selector));

/**
 * セレクターから複数の要素を安全に取得する関数
 */
export const safeQuerySelectorAll = (parent: Element | Document, selector: string): Element[] =>
  Array.from(parent.querySelectorAll(selector));

/**
 * テーブルの行からキーと値を抽出する関数
 */
export const extractTableRow = (row: Element): [string, string] => {
  const keyElement = row.querySelector('th, .c-table__th');
  const valueElement = row.querySelector('td, .c-table__td');
  
  const key = safeGetText(keyElement);
  const value = safeGetText(valueElement);
  
  return [key, value];
};

/**
 * テーブルからデータを抽出する関数
 */
export const extractTableData = (table: Element): Record<string, string> => {
  const rows = safeQuerySelectorAll(table, 'tr');
  
  return rows.reduce((acc, row) => {
    const [key, value] = extractTableRow(row);
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
};

/**
 * エラーをEitherに変換する関数
 */
export const toEither = <T>(value: T | null, errorMessage: string): E.Either<string, T> =>
  value === null ? E.left(errorMessage) : E.right(value);

/**
 * 非同期エラーをTaskEitherに変換する関数
 */
export const toTaskEither = <T>(
  promise: Promise<T>,
  errorMessage: string
): TE.TaskEither<string, T> =>
  TE.tryCatch(
    () => promise,
    (error) => `${errorMessage}: ${error}`
  );

/**
 * 成功した結果のみをフィルタリングする関数
 */
export const filterSuccessfulResults = (results: ScrapingResult[]): any[] =>
  pipe(
    results,
    A.filter((result): result is { success: true; data: any } => result.success),
    A.map(result => result.data)
  );

/**
 * 失敗した結果のみをフィルタリングする関数
 */
export const filterFailedResults = (results: ScrapingResult[]): ScrapingError[] =>
  pipe(
    results,
    A.filter((result): result is { success: false; error: ScrapingError } => !result.success),
    A.map(result => result.error)
  );

/**
 * デバウンス機能付きの遅延関数
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * リトライ機能付きの関数実行
 */
export const withRetry = <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): TE.TaskEither<string, T> => {
  const attempt = (retryCount: number): TE.TaskEither<string, T> =>
    pipe(
      toTaskEither(fn(), `Attempt ${retryCount} failed`),
      TE.orElse((error) =>
        retryCount >= maxRetries
          ? TE.left(`Max retries (${maxRetries}) exceeded. Last error: ${error}`)
          : pipe(
              toTaskEither(delay(delayMs), 'Delay failed'),
              TE.chain(() => attempt(retryCount + 1))
            )
      )
    );
  
  return attempt(1);
};
