import { isPlatform, IonLabel } from '@ionic/react';
import { unzipSync, strFromU8 } from 'fflate';
import parse from 'csv-parse/lib/sync';
import { FreeWifiItem } from './models/FreeWifiItem';
import { FreeChargingItem } from './models/FreeChargingItem';

const baseUrl = import.meta.env.BASE_URL || '';
const pwaUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
const bugReportApiUrl = 'https://vh6ud1o56g.execute-api.ap-northeast-1.amazonaws.com/bugReportMailer';
let freeChargingUrl = `https://d23fxcqevt3np7.cloudfront.net/charge_station_list.zip`;
let freeWifiUrl = `https://d23fxcqevt3np7.cloudfront.net/hotspotlist.zip`;

const tfwcDb = 'tfwcDb';
const freeChargingDataKey = 'freeCharging';
const freeWifiDataKey = 'freeWifi';
let log = '';

async function downloadCsvZipData(url: string, progressCallback: Function) {
  const dataBuffer = await downloadData(url, progressCallback);
  const files = unzipSync(dataBuffer);
  const firstFileName = Object.keys(files)[0];
  if (!firstFileName) {
    throw new Error('Zip file is empty.');
  }
  const dataStr = strFromU8(files[firstFileName]);
  return parse(dataStr, {
    columns: true,
    bom: dataStr.charCodeAt(0) === 0xFEFF,
  });
}

async function downloadData(url: string, progressCallback: Function) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const contentLengthHeader = response.headers.get('content-length');
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
  let progressUpdateEnable = true;

  if (!response.body) {
    const data = new Uint8Array(await response.arrayBuffer());
    progressCallback(100);
    return data;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      chunks.push(value);
      receivedBytes += value.length;
      if (totalBytes > 0 && progressUpdateEnable) {
        progressCallback((receivedBytes / totalBytes) * 100);
        progressUpdateEnable = false;
        setTimeout(() => {
          progressUpdateEnable = true;
        }, 100);
      }
    }
  }

  const data = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }

  progressCallback(100);
  return data;
}

async function getFileFromIndexedDB(fileName: string) {
  const dbOpenReq = indexedDB.open(tfwcDb);

  return new Promise(function (ok, fail) {
    dbOpenReq.onsuccess = async function (ev) {
      const db = dbOpenReq.result;

      try {
        const trans = db.transaction(["store"], 'readwrite');
        let req = trans.objectStore('store').get(fileName);
        req.onsuccess = async function (_ev) {
          const data = req.result;
          if (!data) {
            console.error(`${fileName} loading failed!`);
            console.error(new Error().stack);
            return fail();
          }
          return ok(data);
        };
      } catch (err) {
        console.error(err);
      }
    };
  });
}

async function saveFileToIndexedDB(fileName: string, data: any) {
  const dbOpenReq = indexedDB.open(tfwcDb);
  return new Promise<void>((ok, fail) => {
    dbOpenReq.onsuccess = async (ev: Event) => {
      const db = dbOpenReq.result;

      const transWrite = db.transaction(["store"], 'readwrite')
      const reqWrite = transWrite.objectStore('store').put(data, fileName);
      reqWrite.onsuccess = (_ev: any) => ok();
      reqWrite.onerror = (_ev: any) => fail();
    };
  });
}

async function removeFileFromIndexedDB(fileName: string) {
  const dbOpenReq = indexedDB.open(tfwcDb);
  return new Promise<void>((ok, fail) => {
    try {
      dbOpenReq.onsuccess = (ev: Event) => {
        const db = dbOpenReq.result;

        const transWrite = db.transaction(["store"], 'readwrite')
        try {
          const reqWrite = transWrite.objectStore('store').delete(fileName);
          reqWrite.onsuccess = (_ev: any) => ok();
          reqWrite.onerror = (_ev: any) => fail();
        } catch (err) {
          console.error(err);
        }
      };
    } catch (err) {
      fail(err);
    }
  });
}

async function clearIndexedDB() {
  const dbOpenReq = indexedDB.open(tfwcDb);
  return new Promise<void>((ok, fail) => {
    dbOpenReq.onsuccess = async (ev: Event) => {
      const db = dbOpenReq.result;

      const transWrite = db.transaction(["store"], 'readwrite')
      const reqWrite = transWrite.objectStore('store').clear();
      reqWrite.onsuccess = (_ev: any) => ok();
      reqWrite.onerror = (_ev: any) => fail();
    };
  });
}

async function clearAppData() {
  localStorage.clear();
  await clearIndexedDB();
}

async function getCurrentPosition() {
  return new Promise<GeolocationPosition>((ok, fail) => {
    if (!navigator.geolocation) {
      fail('No geolocation object!');
    } else {
      navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
        ok(position);
      }, (error: GeolocationPositionError) => {
        fail(`${error.code}: ${error.message}`);
      });
    }
  });
}

function distance(item: FreeChargingItem | FreeWifiItem, coords: GeolocationCoordinates) {
  return Math.sqrt((item.經度 - coords.longitude) ** 2 + (item.緯度 - coords.latitude) ** 2)
}

async function getCurrentPositionAndSortData(dispatch: Function, freeChargingItems: Array<FreeChargingItem>, freeWifiItems: Array<FreeWifiItem>) {
  const postiion = await getCurrentPosition();
  const userCoords = postiion.coords;
  dispatch({
    type: "TMP_SET_KEY_VAL",
    key: 'currPosition',
    val: { ...postiion },
  });
  dispatch({
    type: "TMP_SET_KEY_VAL",
    key: 'freeChargingItems',
    val: freeChargingItems.sort((a, b) => distance(a, userCoords) - distance(b, userCoords)),
  });
  dispatch({
    type: "TMP_SET_KEY_VAL",
    key: 'freeWifiItems',
    val: freeWifiItems.sort((a, b) => distance(a, userCoords) - distance(b, userCoords)),
  });
}

//const electronBackendApi: any = (window as any).electronBackendApi;

function removeElementsByClassName(doc: Document, className: string) {
  let elements = doc.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode?.removeChild(elements[0]);
  }
}

const consoleLog = console.log.bind(console);
const consoleError = console.error.bind(console);

function getLog() {
  return log;
}

function enableAppLog() {
  console.log = function () {
    log += '----- Info ----\n';
    log += (Array.from(arguments)) + '\n';
    consoleLog.apply(console, arguments as any);
  };

  console.error = function () {
    log += '----- Error ----\n';
    log += (Array.from(arguments)) + '\n';
    consoleError.apply(console, arguments as any);
  };
}

function disableAppLog() {
  log = '';
  console.log = consoleLog;
  console.error = consoleError;
}

function disableAndroidChromeCallout(event: any) {
  event.preventDefault();
  event.stopPropagation();
  return false;
}

// Workable but imperfect.
function disableIosSafariCallout(this: Window, event: any) {
  const s = this.getSelection();
  if ((s?.rangeCount || 0) > 0) {
    const r = s?.getRangeAt(0);
    s?.removeAllRanges();
    setTimeout(() => {
      s?.addRange(r!);
    }, 50);
  }
}

//const webkit = (window as any).webkit;
function copyToClipboard(text: string) {
  try {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'clipboard-read' } as any).then(() => {
        navigator.clipboard.writeText(text);
      });
    } else {
      navigator.clipboard && navigator.clipboard.writeText(text);
    }
  } catch (error) {
    console.error(error);
  }
}

function shareByLink(dispatch: Function, url: string = window.location.href) {
  copyToClipboard(url);
  dispatch({
    type: 'TMP_SET_KEY_VAL',
    key: 'shareTextModal',
    val: {
      show: true,
      text: decodeURIComponent(url),
    },
  });
}

function isMacCatalyst() {
  return isPlatform('ios') && navigator.platform === 'MacIntel';
}

const Globals = {
  pwaUrl,
  bugReportApiUrl,
  storeFile: 'tfwcSettings.json',
  downloadCsvZipData,
  getCurrentPosition,
  getCurrentPositionAndSortData,
  getLog,
  enableAppLog,
  disableAppLog,
  tfwcDb,
  freeResources: [
    { item: "離線免費充電資料", dataKey: freeChargingDataKey, url: freeChargingUrl },
    { item: "離線免費 WiFi 資料", dataKey: freeWifiDataKey, url: freeWifiUrl },
  ],
  appSettings: {
    'theme': '佈景主題',
    'uiFontSize': 'UI 字型大小',
  } as Record<string, string>,
  fetchErrorContent: (
    <div className='contentCenter'>
      <IonLabel>
        <div>
          <div>連線失敗!</div>
          <div style={{ fontSize: 'var(--ui-font-size)', paddingTop: 24 }}>如果問題持續發生，請執行<a href={`${pwaUrl}/settings`} target="_self">設定頁</a>的 app 異常回報功能。</div>
        </div>
      </IonLabel>
    </div>
  ),
  updateApp: () => {
    return new Promise(async resolve => {
      navigator.serviceWorker.getRegistrations().then(async regs => {
        const hasUpdates = await Promise.all(regs.map(reg => (reg.update() as any).then((newReg: ServiceWorkerRegistration) => {
          return newReg.installing !== null || newReg.waiting !== null;
        })));
        resolve(hasUpdates.reduce((prev, curr) => prev || curr, false));
      });
    });
  },
  updateCssVars: (settings: any) => {
    document.documentElement.style.cssText = `--ui-font-size: ${settings.uiFontSize}px;`
  },
  isMacCatalyst,
  isTouchDevice: () => {
    return (isPlatform('ios') && !isMacCatalyst()) || isPlatform('android');
  },
  isStoreApps: () => {
    return isPlatform('pwa') || isPlatform('electron');
  },
  getFileFromIndexedDB,
  saveFileToIndexedDB,
  removeFileFromIndexedDB,
  clearAppData,
  removeElementsByClassName,
  disableAndroidChromeCallout,
  disableIosSafariCallout,
  copyToClipboard,
  shareByLink,
};

export default Globals;
