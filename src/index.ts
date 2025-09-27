import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as path from 'path';
import { 
  scrapeMultipleRestaurants, 
  closeBrowser 
} from './scraper';
import { 
  readUrlsFromCsv, 
  writeRestaurantDataToCsv, 
  writeErrorLogToCsv,
  ensureOutputDirectory,
  generateTimestampedFilename
} from './csvHandler';
import { filterSuccessfulResults, filterFailedResults } from './utils';

/**
 * メイン実行関数
 */
const main = (): TE.TaskEither<string, void> => {
  const inputCsvPath = path.join(process.cwd(), 'import.csv');
  const outputDir = path.join(process.cwd(), 'output');
  
  return pipe(
    // 1. CSVファイルからURLを読み込み
    readUrlsFromCsv(inputCsvPath),
    TE.chain(urls => {
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
      return scrapeMultipleRestaurants(urls);
    }),
    
    // 3. 結果の処理
    TE.chain(results => {
      const successfulResults = filterSuccessfulResults(results);
      const failedResults = filterFailedResults(results);
      
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
    TE.chain(({ successfulResults, failedResults }) => 
      pipe(
        ensureOutputDirectory(outputDir),
        TE.map(() => ({ successfulResults, failedResults }))
      )
    ),
    
    // 5. 成功したデータをCSVに出力
    TE.chain(({ successfulResults, failedResults }) => {
      if (successfulResults.length === 0) {
        console.log('\n⚠️  成功したデータがないため、CSVファイルは作成されません。');
        return TE.right({ successfulResults, failedResults });
      }
      
      const outputCsvPath = path.join(
        outputDir, 
        generateTimestampedFilename('tabelog_data', '.csv')
      );
      
      console.log(`\n💾 データをCSVに出力中: ${outputCsvPath}`);
      
      return pipe(
        writeRestaurantDataToCsv(successfulResults, outputCsvPath),
        TE.map(() => {
          console.log(`✅ CSVファイルが作成されました: ${outputCsvPath}`);
          return { successfulResults, failedResults };
        })
      );
    }),
    
    // 6. エラーログをCSVに出力
    TE.chain(({ successfulResults, failedResults }) => {
      if (failedResults.length === 0) {
        return TE.right({ successfulResults, failedResults });
      }
      
      const errorLogPath = path.join(
        outputDir, 
        generateTimestampedFilename('error_log', '.csv')
      );
      
      console.log(`\n📝 エラーログをCSVに出力中: ${errorLogPath}`);
      
      return pipe(
        writeErrorLogToCsv(failedResults, errorLogPath),
        TE.map(() => {
          console.log(`✅ エラーログファイルが作成されました: ${errorLogPath}`);
          return { successfulResults, failedResults };
        })
      );
    }),
    
    // 7. ブラウザを閉じる
    TE.chain(() => {
      console.log('\n🔒 ブラウザを閉じています...');
      return closeBrowser();
    }),
    
    // 8. 完了メッセージ
    TE.map(() => {
      console.log('\n🎉 スクレイピングが完了しました！');
    })
  );
};

/**
 * エラーハンドリング付きの実行
 */
const run = async (): Promise<void> => {
  try {
    const result = await main()();
    
    if (result._tag === 'Left') {
      console.error(`\n❌ エラーが発生しました: ${result.left}`);
      process.exit(1);
    }
    
    console.log('\n✨ すべての処理が正常に完了しました。');
  } catch (error) {
    console.error(`\n💥 予期しないエラーが発生しました: ${error}`);
    process.exit(1);
  }
};

// スクリプトが直接実行された場合のみmain関数を実行
if (require.main === module) {
  run();
}

export { main, run };
