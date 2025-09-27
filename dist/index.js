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
exports.run = exports.main = void 0;
const TE = __importStar(require("fp-ts/TaskEither"));
const function_1 = require("fp-ts/function");
const path = __importStar(require("path"));
const scraper_1 = require("./scraper");
const csvHandler_1 = require("./csvHandler");
const utils_1 = require("./utils");
/**
 * メイン実行関数
 */
const main = () => {
    const inputCsvPath = path.join(process.cwd(), 'import.csv');
    const outputDir = path.join(process.cwd(), 'output');
    return (0, function_1.pipe)(
    // 1. CSVファイルからURLを読み込み
    (0, csvHandler_1.readUrlsFromCsv)(inputCsvPath), TE.chain(urls => {
        console.log(`📋 読み込んだURL数: ${urls.length}`);
        console.log('🔗 対象URL:');
        urls.forEach((url, index) => {
            console.log(`  ${index + 1}. ${url}`);
        });
        if (urls.length === 0) {
            return TE.left('URLが見つかりませんでした。import.csvファイルを確認してください。');
        }
        return TE.right(urls);
    }), 
    // 2. スクレイピング実行
    TE.chain(urls => {
        console.log('\n🚀 スクレイピングを開始します...');
        return (0, scraper_1.scrapeMultipleRestaurants)(urls);
    }), 
    // 3. 結果の処理
    TE.chain(results => {
        const successfulResults = (0, utils_1.filterSuccessfulResults)(results);
        const failedResults = (0, utils_1.filterFailedResults)(results);
        console.log(`\n📊 スクレイピング結果:`);
        console.log(`  ✅ 成功: ${successfulResults.length}件`);
        console.log(`  ❌ 失敗: ${failedResults.length}件`);
        if (failedResults.length > 0) {
            console.log('\n❌ 失敗したURL:');
            failedResults.forEach(error => {
                console.log(`  - ${error.url}: ${error.error}`);
            });
        }
        return TE.right({ successfulResults, failedResults });
    }), 
    // 4. 出力ディレクトリの作成
    TE.chain(({ successfulResults, failedResults }) => (0, function_1.pipe)((0, csvHandler_1.ensureOutputDirectory)(outputDir), TE.map(() => ({ successfulResults, failedResults })))), 
    // 5. 成功したデータをCSVに出力
    TE.chain(({ successfulResults, failedResults }) => {
        if (successfulResults.length === 0) {
            console.log('\n⚠️  成功したデータがないため、CSVファイルは作成されません。');
            return TE.right({ successfulResults, failedResults });
        }
        const outputCsvPath = path.join(outputDir, (0, csvHandler_1.generateTimestampedFilename)('tabelog_data', '.csv'));
        console.log(`\n💾 データをCSVに出力中: ${outputCsvPath}`);
        return (0, function_1.pipe)((0, csvHandler_1.writeRestaurantDataToCsv)(successfulResults, outputCsvPath), TE.map(() => {
            console.log(`✅ CSVファイルが作成されました: ${outputCsvPath}`);
            return { successfulResults, failedResults };
        }));
    }), 
    // 6. エラーログをCSVに出力
    TE.chain(({ successfulResults, failedResults }) => {
        if (failedResults.length === 0) {
            return TE.right({ successfulResults, failedResults });
        }
        const errorLogPath = path.join(outputDir, (0, csvHandler_1.generateTimestampedFilename)('error_log', '.csv'));
        console.log(`\n📝 エラーログをCSVに出力中: ${errorLogPath}`);
        return (0, function_1.pipe)((0, csvHandler_1.writeErrorLogToCsv)(failedResults, errorLogPath), TE.map(() => {
            console.log(`✅ エラーログファイルが作成されました: ${errorLogPath}`);
            return { successfulResults, failedResults };
        }));
    }), 
    // 7. ブラウザを閉じる
    TE.chain(() => {
        console.log('\n🔒 ブラウザを閉じています...');
        return (0, scraper_1.closeBrowser)();
    }), 
    // 8. 完了メッセージ
    TE.map(() => {
        console.log('\n🎉 スクレイピングが完了しました！');
    }));
};
exports.main = main;
/**
 * エラーハンドリング付きの実行
 */
const run = async () => {
    try {
        const result = await main()();
        if (result._tag === 'Left') {
            console.error(`\n❌ エラーが発生しました: ${result.left}`);
            process.exit(1);
        }
        console.log('\n✨ すべての処理が正常に完了しました。');
    }
    catch (error) {
        console.error(`\n💥 予期しないエラーが発生しました: ${error}`);
        process.exit(1);
    }
};
exports.run = run;
// スクリプトが直接実行された場合のみmain関数を実行
if (require.main === module) {
    run();
}
//# sourceMappingURL=index.js.map