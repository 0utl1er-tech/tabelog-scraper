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
exports.withRetry = exports.delay = exports.filterFailedResults = exports.filterSuccessfulResults = exports.toTaskEither = exports.toEither = exports.extractTableData = exports.extractTableRow = exports.safeQuerySelectorAll = exports.safeQuerySelector = exports.safeGetText = void 0;
const E = __importStar(require("fp-ts/Either"));
const TE = __importStar(require("fp-ts/TaskEither"));
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/function");
/**
 * 文字列を安全に取得する関数
 * 要素が存在しない場合は空文字列を返す
 */
const safeGetText = (element) => (0, function_1.pipe)(O.fromNullable(element), O.map(el => el.textContent?.trim() || ''), O.getOrElse(() => ''));
exports.safeGetText = safeGetText;
/**
 * セレクターから要素を安全に取得する関数
 */
const safeQuerySelector = (parent, selector) => O.fromNullable(parent.querySelector(selector));
exports.safeQuerySelector = safeQuerySelector;
/**
 * セレクターから複数の要素を安全に取得する関数
 */
const safeQuerySelectorAll = (parent, selector) => Array.from(parent.querySelectorAll(selector));
exports.safeQuerySelectorAll = safeQuerySelectorAll;
/**
 * テーブルの行からキーと値を抽出する関数
 */
const extractTableRow = (row) => {
    const keyElement = row.querySelector('th, .c-table__th');
    const valueElement = row.querySelector('td, .c-table__td');
    const key = (0, exports.safeGetText)(keyElement);
    const value = (0, exports.safeGetText)(valueElement);
    return [key, value];
};
exports.extractTableRow = extractTableRow;
/**
 * テーブルからデータを抽出する関数
 */
const extractTableData = (table) => {
    const rows = (0, exports.safeQuerySelectorAll)(table, 'tr');
    return rows.reduce((acc, row) => {
        const [key, value] = (0, exports.extractTableRow)(row);
        if (key && value) {
            acc[key] = value;
        }
        return acc;
    }, {});
};
exports.extractTableData = extractTableData;
/**
 * エラーをEitherに変換する関数
 */
const toEither = (value, errorMessage) => value === null ? E.left(errorMessage) : E.right(value);
exports.toEither = toEither;
/**
 * 非同期エラーをTaskEitherに変換する関数
 */
const toTaskEither = (promise, errorMessage) => TE.tryCatch(() => promise, (error) => `${errorMessage}: ${error}`);
exports.toTaskEither = toTaskEither;
/**
 * 成功した結果のみをフィルタリングする関数
 */
const filterSuccessfulResults = (results) => (0, function_1.pipe)(results, A.filter((result) => result.success), A.map(result => result.data));
exports.filterSuccessfulResults = filterSuccessfulResults;
/**
 * 失敗した結果のみをフィルタリングする関数
 */
const filterFailedResults = (results) => (0, function_1.pipe)(results, A.filter((result) => !result.success), A.map(result => result.error));
exports.filterFailedResults = filterFailedResults;
/**
 * デバウンス機能付きの遅延関数
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
/**
 * リトライ機能付きの関数実行
 */
const withRetry = (fn, maxRetries = 3, delayMs = 1000) => {
    const attempt = (retryCount) => (0, function_1.pipe)((0, exports.toTaskEither)(fn(), `Attempt ${retryCount} failed`), TE.orElse((error) => retryCount >= maxRetries
        ? TE.left(`Max retries (${maxRetries}) exceeded. Last error: ${error}`)
        : (0, function_1.pipe)((0, exports.toTaskEither)((0, exports.delay)(delayMs), 'Delay failed'), TE.chain(() => attempt(retryCount + 1)))));
    return attempt(1);
};
exports.withRetry = withRetry;
//# sourceMappingURL=utils.js.map