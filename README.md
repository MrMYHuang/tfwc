# 台灣免費 WiFi & 充電 (Taiwan Free WiFi & Charging)

## <a id='feature'>特色</a>

定位免費充電或 WiFi 列表、離線瀏覽、佈景主題切換、字型調整、跨平台、無廣告、開放原始碼。

## 說明

台灣免費 WiFi & 充電 (Taiwan Free WiFi & Charging)，簡寫tfwc，使用台灣政府免費充電站或 WiFi 熱點開放資料，支援以下功能

* 定位免費充電站或 WiFi 熱點
  1. 授權您的裝置位置給此 app 後，app 會列出與您位置最近的免費充電站或 WiFi (iTaiwan) 熱點。
  2. 可開啟地圖作導航。

* 離線瀏覽
* 佈景主題切換
* 字型調整
  1. 考量視力不佳的使用者，提供最大64 px的字型設定。若有需要更大字型，請 E-mail 或 GitHub 聯絡開發者新增。
* <a id='shortcuts'>App 捷徑</a>
  1. Windows, Android 的 Chrome (建議最新版)使用者，滑鼠右鍵或長按 app 圖示，可存取app功能捷徑，目前有：免費充電、免費 WiFi。

* <a id='report'>App異常回報</a>

  App設定頁的異常回報鈕使用方法為：執行會造成app異常的步驟後，再至設定頁按下異常回報鈕，即會自動產生一封E-mail，包含異常的記錄，發送此E-mail給我們即可。

程式碼為開放(MIT License)，可自由下載修改、重新發佈。

## 支援平台
已在這些環境作過安裝、測試:
* Windows 10 +  Chrome
* Android 9 + Chrome
* macOS 11 + Chrome
* iPad 7 + Safari
* iPhone 8 + Safari
* Debian Linux 10 + Chrome

非上述環境仍可嘗試使用此app。若有<a href='#knownIssues'>已知問題</a>未描述的問題，可用<a href='#report'>異常回報</a>功能。

建議OS與Chrome、Safari保持在最新版，以取得最佳app體驗。

## <a id='install'>安裝</a>

此 app 目前有2種取得、安裝方式：

  1. Chrome、Safari 網頁瀏覽器。
  2. App 商店。

### <a id='web-app'>從瀏覽器開啟/安裝</a>
請用Chrome (Windows, macOS, Linux, Android作業系統使用者)、Safari (iOS (iPhone, iPad)使用者)瀏覽器開啟以下網址：

https://myhpwa.github.io/tfwc

或：

<a href='https://myhpwa.github.io/tfwc' target='_blank'>
<img width="auto" height='60px' src='https://user-images.githubusercontent.com/9122190/28998409-c5bf7362-7a00-11e7-9b63-db56694522e7.png'/>
</a>

此 progressive web app (PWA)，可不安裝直接在網頁瀏覽器執行，或安裝至手機、平板、筆電、桌機。建議安裝，以避免瀏覽器定期清除快取，導致 app 設定不見！

#### Windows, macOS, Linux, Android - 使用Chrome安裝
使用Chrome瀏覧器（建議最新版）開啟上述PWA網址後，網址列會出現一個加號，如圖所示：

<img src='https://github.com/MrMYHuang/tfwc/raw/master/docs/images/ChromeInstall.png' width='50%' />

點擊它，以完成安裝。安裝完後會在桌面出現"免費WiFi與充電" app 圖示。

#### iOS - 使用Safari安裝
1. 使用Safari開啟web app網址，再點擊下方中間的"分享"圖示：

<img src='https://github.com/MrMYHuang/tfwc/raw/master/docs/images/Safari/OpenAppUrl.png' width='50%' />

2. 滑動頁面至下方，點選"加入主畫面"(Add to Home Screen)：

<img src='https://github.com/MrMYHuang/tfwc/raw/master/docs/images/Safari/AddToHomeScreen.png' width='50%' />

3. App安裝完，出現在主畫面的圖示：

<img src='https://github.com/MrMYHuang/tfwc/raw/master/docs/images/Safari/AppIcon.png' width='50%' />

### <a id='storeApp'>從 App 商店安裝</a>
#### Android - 使用 Google Play Store
<a href='https://play.google.com/store/apps/details?id=tfwc.droid' target='_blank'>
<img width="auto" height='60px' alt='Google Play立即下載' src='https://github.com/MrMYHuang/tfwc/raw/master/docs/images/zh-tw_badge_web_generic.png'/>
</a>

#### iOS 14.0+ (iPhone), iPadOS 14.0+ (iPad) - 使用 Apple App Store
<a href='https://apps.apple.com/app/id1580564553' target='_blank'>
<img width="auto" height='60px' src='https://github.com/MrMYHuang/tfwc/raw/master/docs/images/Download_on_the_App_Store_Badge_CNTC_RGB_blk_100217.svg'/>
</a>

#### Windows 10 - 使用 Microsoft Store
<a href='https://www.microsoft.com/store/apps/9MXQZV0TK6X7' target='_blank'>
<img width="auto" height='60px' src='https://developer.microsoft.com/store/badges/images/Chinese-Traditional_get-it-from-MS.png' alt='Chinese Traditional badge'/>
</a>

## <a id='knownIssues'>已知問題</a>
1. iOS Safari 13.4 以上才支援"分享此頁"功能。

## <a id='history'>版本歷史</a>
* PWA 2.5.0:
  * [新增] 離線資料更新通知設定。

* PWA 2.4.2:
  * [修正] Chrome 瀏覽器開啟自動中翻英後，app 功能異常的 bug。

* PWA 2.4.1:
  * [修正] UI 字型調整。

* PWA 2.4.0:
  * [優化] 升級套件。

* PWA 2.3.2:
  * [修正] 網址分享在新電腦開啟異常。
  * [修正] setState, dispatch 相關狀態更新 bugs。

* 2.3.0:
  * 錯誤回報功能作 E-mail 檢查。
  * 錯誤回報功能支援填寫問題發生步驟。

* 2.2.0:
  * 修正錯誤回報功能異常的問題。

* 2.1.4:
  * 降低最大 UI 字型至32 px 。
  
* 2.1.3:
  * 移除分享按鈕。

* 2.1.2:
  * 移除 app 內一些連結，以上架 app 商店。
  
* 2.1.0:
  * 新增重新定位鈕。

* 2.0.0:
  * 改寫成 PWA。

* 1.0.4：
  * [Android] 修正Android 6.0以上定位問題。

* 1.0.3：
  * [UWP] 解決地圖無法顯示的問題。
  * [UWP] 解決"列表/選擇站台/地圖"來回切換，地圖標示未更新的問題。

* 1.0.2：
  * [Android] 調整地圖設定，試圖解決耗電問題。

* 1.0.1：
  * 更新logo。
  * 移除地圖頁Slider。

* 1.0.0：
  * 第一版。

## <a href='https://github.com/MrMYHuang/tfwc/blob/master/PrivacyPolicy.md'>隱私政策</a>

## 第三方軟體版權聲明

1. 中央行政機關室內公共區域免費手機充電站查詢服務 ( https://data.gov.tw/dataset/28592 )
2. iTaiwan中央行政機關室內公共區域免費無線上網熱點查詢服務 ( https://data.gov.tw/dataset/5962 )

    此 app 使用《中央行政機關室內公共區域免費手機充電站查詢服務》與《iTaiwan中央行政機關室內公共區域免費無線上網熱點查詢服務》。此開放資料依政府資料開放授權條款 (Open Government Data License) 進行公眾釋出，使用者於遵守本條款各項規定之前提下，得利用之。政府資料開放授權條款：https://data.gov.tw/license
3. App 圖示台灣輪廓圖來源
  https://freevectormaps.com/taiwan/TW-EPS-01-0003?ref=atr

## Notices

  1. Android Package ID: tfwc.droid