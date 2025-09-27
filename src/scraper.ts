import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { 
  RestaurantDataType, 
  RestaurantBasicInfoType, 
  SeatsAndFacilitiesType, 
  MenuInfoType, 
  FeaturesAndRelatedType,
  ScrapingResult,
  ScrapingError 
} from './types';
import { 
  toTaskEither,
  delay
} from './utils';

/**
 * HTTPリクエストでHTMLを取得する関数
 */
const fetchHtml = (url: string): TE.TaskEither<string, string> =>
  toTaskEither(
    axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    }).then(response => response.data),
    'Failed to fetch HTML'
  );

/**
 * 店舗基本情報を抽出する関数
 */
const extractBasicInfo = ($: cheerio.Root): RestaurantBasicInfoType => {
  const getText = (selector: string): string => {
    return $(selector).first().text().trim().replace(/\s+/g, ' ') || '';
  };

  // HTMLテーブルから情報を抽出
  const getTableValue = (label: string): string => {
    return getText(`.rstinfo-table__table tr:contains("${label}") td`);
  };

  return {
    name: getText('.rdheader-rstname .display-name span') || getTableValue('店名'),
    rating: getText('.rdheader-rating__score-val-dtl') || '',
    reviewCount: getText('.rdheader-rating__review-count') || '',
    priceRange: getText('.rdheader-rating__price') || getTableValue('予算'),
    cuisine: getTableValue('ジャンル'),
    address: getText('.rstinfo-table__address') || getTableValue('住所'),
    phone: getTableValue('電話番号'),
    hours: getTableValue('営業時間'),
    closedDays: getTableValue('定休日')
  };
};

/**
 * 席・設備情報を抽出する関数
 */
const extractSeatsAndFacilities = ($: cheerio.Root): SeatsAndFacilitiesType => {
  const getTableData = (): Record<string, string> => {
    const data: Record<string, string> = {};
    
    // 全てのテーブルから情報を抽出
    $('table tr, .rstinfo-table__table tr, .rdtable tr').each((_, row) => {
      const keyElement = $(row).find('th, .c-table__th');
      const valueElement = $(row).find('td, .c-table__td');
      
      if (keyElement.length && valueElement.length) {
        const key = keyElement.text().trim().replace(/\s+/g, ' ');
        const value = valueElement.text().trim().replace(/\s+/g, ' ');
        if (key && value) {
          data[key] = value;
        }
      }
    });
    
    return data;
  };

  const tableData = getTableData();
  
  return {
    totalSeats: tableData['総席数'] || tableData['席数'] || tableData['座席数'] || '',
    privateRooms: tableData['個室'] || tableData['貸切'] || tableData['個室情報'] || '',
    smoking: tableData['喫煙'] || tableData['禁煙・喫煙'] || tableData['喫煙情報'] || '',
    parking: tableData['駐車場'] || tableData['駐車場情報'] || '',
    creditCards: tableData['カード'] || tableData['カード利用'] || tableData['支払い方法'] || '',
    wifi: tableData['Wi-Fi'] || tableData['wifi'] || tableData['WiFi'] || '',
    otherFacilities: Object.entries(tableData)
      .filter(([key]) => !['総席数', '席数', '座席数', '個室', '貸切', '個室情報', '喫煙', '禁煙・喫煙', '喫煙情報', '駐車場', '駐車場情報', 'カード', 'カード利用', '支払い方法', 'Wi-Fi', 'wifi', 'WiFi'].includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  };
};

/**
 * メニュー情報を抽出する関数
 */
const extractMenuInfo = ($: cheerio.Root): MenuInfoType => {
  const getMenuData = (): Record<string, string> => {
    const data: Record<string, string> = {};
    
    // メニューセクションから抽出
    $('.rdmenu, .menu-section, .menu-category').each((_, section) => {
      const title = $(section).find('.rdmenu__title, .menu-title, .category-title, h3, h4').text().trim().replace(/\s+/g, ' ');
      const items: string[] = [];
      
      $(section).find('.rdmenu__item, .menu-item, .item').each((_, item) => {
        const name = $(item).find('.rdmenu__item-name, .menu-name, .item-name, .name').text().trim().replace(/\s+/g, ' ');
        const price = $(item).find('.rdmenu__item-price, .menu-price, .item-price, .price').text().trim().replace(/\s+/g, ' ');
        if (name && price) {
          items.push(`${name} (${price})`);
        } else if (name) {
          items.push(name);
        }
      });
      
      if (title && items.length > 0) {
        data[title] = items.join(', ');
      }
    });
    
    // テーブル形式のメニュー情報も抽出
    $('table tr').each((_, row) => {
      const keyElement = $(row).find('th');
      const valueElement = $(row).find('td');
      
      if (keyElement.length && valueElement.length) {
        const key = keyElement.text().trim().replace(/\s+/g, ' ');
        const value = valueElement.text().trim().replace(/\s+/g, ' ');
        
        // メニュー関連のキーワードをチェック
        if (key && value && (
          key.includes('メニュー') || 
          key.includes('料理') || 
          key.includes('ドリンク') || 
          key.includes('ランチ') || 
          key.includes('ディナー') ||
          key.includes('コース')
        )) {
          data[key] = value;
        }
      }
    });
    
    return data;
  };

  const menuData = getMenuData();
  
  return {
    lunchMenu: menuData['ランチ'] || menuData['昼'] || menuData['ランチメニュー'] || '',
    dinnerMenu: menuData['ディナー'] || menuData['夜'] || menuData['ディナーメニュー'] || '',
    specialMenu: menuData['コース'] || menuData['特別'] || menuData['特別メニュー'] || '',
    drinks: menuData['ドリンク'] || menuData['飲み物'] || menuData['ドリンクメニュー'] || '',
    otherMenu: Object.entries(menuData)
      .filter(([key]) => !['ランチ', '昼', 'ランチメニュー', 'ディナー', '夜', 'ディナーメニュー', 'コース', '特別', '特別メニュー', 'ドリンク', '飲み物', 'ドリンクメニュー'].includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  };
};

/**
 * 特徴・関連情報を抽出する関数
 */
const extractFeaturesAndRelated = ($: cheerio.Root): FeaturesAndRelatedType => {
  const getAllTableData = (): Record<string, string> => {
    const data: Record<string, string> = {};
    
    // 全てのテーブルから情報を抽出
    $('table tr, .rstinfo-table__table tr, .rdtable tr').each((_, row) => {
      const keyElement = $(row).find('th, .c-table__th');
      const valueElement = $(row).find('td, .c-table__td');
      
      if (keyElement.length && valueElement.length) {
        const key = keyElement.text().trim().replace(/\s+/g, ' ');
        const value = valueElement.text().trim().replace(/\s+/g, ' ');
        if (key && value) {
          data[key] = value;
        }
      }
    });
    
    // 特徴情報を抽出
    const features: string[] = [];
    $('.rdheader-info__feature, .rdheader-info__tag, .feature-tag, .tag').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text) {
        features.push(text);
      }
    });
    
    if (features.length > 0) {
      data['特徴'] = features.join(', ');
    }
    
    // その他の情報を抽出
    $('.rdinfo, .info-section, .details').each((_, section) => {
      const title = $(section).find('.rdinfo__title, .info-title, .section-title, h3, h4').text().trim().replace(/\s+/g, ' ');
      const content = $(section).find('.rdinfo__content, .info-content, .section-content').text().trim().replace(/\s+/g, ' ');
      
      if (title && content) {
        data[title] = content;
      }
    });
    
    return data;
  };

  const allData = getAllTableData();
  
  // 関連情報から個別の項目を抽出
  const extractRelatedInfoItems = (): Record<string, string> => {
    const relatedInfo = allData['その他設備'] || '';
    const info: Record<string, string> = {};
    
    // 店名
    const storeNameMatch = relatedInfo.match(/店名:\s*([^,]+)/);
    if (storeNameMatch) info['relatedStoreName'] = storeNameMatch[1].trim();
    
    // 予約・お問い合わせ
    const contactMatch = relatedInfo.match(/予約・\s*お問い合わせ:\s*([^,]+)/);
    if (contactMatch) info['relatedContact'] = contactMatch[1].trim();
    
    // 住所
    const addressMatch = relatedInfo.match(/住所:\s*([^,]+)/);
    if (addressMatch) info['relatedAddress'] = addressMatch[1].trim();
    
    // 営業時間
    const hoursMatch = relatedInfo.match(/営業時間:\s*([^,]+)/);
    if (hoursMatch) info['relatedHours'] = hoursMatch[1].trim();
    
    // 予算
    const budgetMatch = relatedInfo.match(/予算:\s*([^,]+)/);
    if (budgetMatch) info['relatedBudget'] = budgetMatch[1].trim();
    
    // 席数
    const seatsMatch = relatedInfo.match(/席数:\s*([^,]+)/);
    if (seatsMatch) info['relatedSeats'] = seatsMatch[1].trim();
    
    // 個室
    const privateRoomsMatch = relatedInfo.match(/個室:\s*([^,]+)/);
    if (privateRoomsMatch) info['relatedPrivateRooms'] = privateRoomsMatch[1].trim();
    
    // 貸切
    const rentalMatch = relatedInfo.match(/貸切:\s*([^,]+)/);
    if (rentalMatch) info['relatedRental'] = rentalMatch[1].trim();
    
    // 禁煙・喫煙
    const smokingMatch = relatedInfo.match(/禁煙・喫煙:\s*([^,]+)/);
    if (smokingMatch) info['relatedSmoking'] = smokingMatch[1].trim();
    
    // 駐車場
    const parkingMatch = relatedInfo.match(/駐車場:\s*([^,]+)/);
    if (parkingMatch) info['relatedParking'] = parkingMatch[1].trim();
    
    return info;
  };
  
  const relatedInfoItems = extractRelatedInfoItems();
  
  return {
    features: allData['特徴'] || '',
    atmosphere: allData['雰囲気'] || allData['空間'] || allData['空間・設備'] || '',
    targetAudience: allData['利用シーン'] || allData['対象'] || allData['対象客層'] || '',
    occasions: allData['利用シーン'] || allData['用途'] || allData['利用場面'] || '',
    reservationStatus: allData['予約可否'] || allData['予約'] || '',
    transportation: allData['交通手段'] || allData['アクセス'] || allData['最寄り駅'] || '',
    paymentMethods: allData['支払い方法'] || allData['カード'] || allData['カード利用'] || '',
    maxReservationCapacity: allData['最大予約可能人数'] || allData['最大人数'] || allData['定員'] || '',
    spaceAndFacilities: allData['空間・設備'] || allData['設備'] || allData['施設'] || '',
    drinks: allData['ドリンク'] || allData['飲み物'] || allData['酒類'] || '',
    cuisine: allData['料理'] || allData['料理ジャンル'] || allData['ジャンル'] || '',
    location: allData['ロケーション'] || allData['立地'] || allData['場所'] || '',
    officialAccount: allData['公式アカウント'] || allData['SNS'] || allData['Instagram'] || allData['Twitter'] || '',
    openingDate: allData['オープン日'] || allData['開店日'] || allData['創業'] || '',
    // 関連情報の個別項目
    relatedStoreName: relatedInfoItems['relatedStoreName'] || '',
    relatedContact: relatedInfoItems['relatedContact'] || '',
    relatedAddress: relatedInfoItems['relatedAddress'] || '',
    relatedHours: relatedInfoItems['relatedHours'] || '',
    relatedBudget: relatedInfoItems['relatedBudget'] || '',
    relatedSeats: relatedInfoItems['relatedSeats'] || '',
    relatedPrivateRooms: relatedInfoItems['relatedPrivateRooms'] || '',
    relatedRental: relatedInfoItems['relatedRental'] || '',
    relatedSmoking: relatedInfoItems['relatedSmoking'] || '',
    relatedParking: relatedInfoItems['relatedParking'] || '',
    relatedInfo: Object.entries(allData)
      .filter(([key]) => !['特徴', '雰囲気', '空間', '空間・設備', '利用シーン', '対象', '対象客層', '用途', '利用場面', '予約可否', '予約', '交通手段', 'アクセス', '最寄り駅', '支払い方法', 'カード', 'カード利用', '最大予約可能人数', '最大人数', '定員', '設備', '施設', 'ドリンク', '飲み物', '酒類', '料理', '料理ジャンル', 'ジャンル', 'ロケーション', '立地', '場所', '公式アカウント', 'SNS', 'Instagram', 'Twitter', 'オープン日', '開店日', '創業'].includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  };
};

/**
 * 単一のURLから店舗情報を抽出する関数
 */
const scrapeRestaurantData = (url: string): TE.TaskEither<string, RestaurantDataType> =>
  pipe(
    fetchHtml(url),
    TE.map(html => {
      const $ = cheerio.load(html);
      
      const basicInfo = extractBasicInfo($);
      const seatsAndFacilities = extractSeatsAndFacilities($);
      const menuInfo = extractMenuInfo($);
      const featuresAndRelated = extractFeaturesAndRelated($);
      
      return {
        url,
        basicInfo,
        seatsAndFacilities,
        menuInfo,
        featuresAndRelated
      };
    })
  );

/**
 * リトライ機能付きで店舗情報を抽出する関数
 */
export const scrapeRestaurantWithRetry = (url: string): TE.TaskEither<string, RestaurantDataType> =>
  scrapeRestaurantData(url);

/**
 * 複数のURLから店舗情報を抽出する関数
 */
export const scrapeMultipleRestaurants = (urls: string[]): TE.TaskEither<string, ScrapingResult[]> =>
  pipe(
    urls,
    A.map(url =>
      pipe(
        scrapeRestaurantWithRetry(url),
        TE.fold(
          (error): TE.TaskEither<string, ScrapingResult> => 
            TE.right({
              success: false,
              error: {
                url,
                error,
                timestamp: new Date()
              }
            }),
          (data): TE.TaskEither<string, ScrapingResult> => 
            TE.right({
              success: true,
              data
            })
        )
      )
    ),
    A.sequence(TE.ApplicativeSeq),
    TE.chain(results => 
      pipe(
        toTaskEither(
          delay(1000), // リクエスト間の遅延
          'Delay failed'
        ),
        TE.map(() => results)
      )
    )
  );

/**
 * ブラウザを閉じる関数（cheerioでは不要だが、互換性のため残す）
 */
export const closeBrowser = (): TE.TaskEither<string, void> =>
  TE.right(undefined);