import React from 'react';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  setupConfig,
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonAlert,
  isPlatform,
  IonToast,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { connect, Provider } from 'react-redux';
import queryString from 'query-string';
import getSavedStore from './redux/store';
import { settings, batteryCharging, wifi } from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import SettingsPage from './pages/SettingsPage';
import Globals from './Globals';
import ListPage from './pages/ListPage';
import ShareTextModal from './components/ShareTextModal';
import { FreeChargingItem } from './models/FreeChargingItem';
import { FreeWifiItem } from './models/FreeWifiItem';
import { Settings } from './models/Settings';
import { TmpSettings } from './models/TmpSettings';

const electronBackendApi: any = (window as any).electronBackendApi;

let store = getSavedStore();
/*
class DebugRouter extends IonReactRouter {
  constructor(props: any) {
    super(props);
    console.log('initial history is: ', JSON.stringify(this.history, null, 2))
    this.history.listen((location, action) => {
      console.log(
        `The current URL is ${location.pathname}${location.search}${location.hash}`
      )
      console.log(`The last navigation action was ${action}`, JSON.stringify(this.history, null, 2));
    });
  }
}
*/

setupConfig({
  mode: 'md', // Use a consistent UI style across Android and iOS.
  swipeBackEnabled: false,
});

export var serviceWorkCallbacks = {
  onSuccess: function (registration: ServiceWorkerRegistration) { },
  onUpdate: function (registration: ServiceWorkerRegistration) { },
};

interface Props {
  dispatch: Function;
  shareTextModal: any;
  settings: Settings;
  tmpSettings: TmpSettings;
}

interface PageProps extends RouteComponentProps<{
  tab: string;
  path: string;
}> { }

interface AppOrigProps extends Props, RouteComponentProps<{
  tab: string;
  path: string;
}> { }

interface State {
  showToast: boolean;
  toastMessage: string;
  showUpdateAlert: boolean;
  showGetPositionAlert: boolean;
  showRestoreAppSettingsToast: boolean;
}

class _App extends React.Component<PageProps> {
  render() {
    return (
      <Provider store={store}>
        <AppOrig {...this.props} />
      </Provider>
    );
  }
}

class _AppOrig extends React.Component<AppOrigProps, State> {
  registrationNew: ServiceWorkerRegistration | null;
  originalAppSettingsStr: string | null | undefined;

  constructor(props: any) {
    super(props);
    if (!this.props.settings.hasAppLog) {
      Globals.disableAppLog();
    }

    electronBackendApi?.receive("fromMain", (data: any) => {
      switch (data.event) {
        case 'version':
          store.dispatch({
            type: "TMP_SET_KEY_VAL",
            key: 'mainVersion',
            val: data.version,
          });
          break;
      }
    });
    electronBackendApi?.send("toMain", { event: 'ready' });

    this.registrationNew = null;
    // Disable browser callout.
    if (isPlatform('android')) {
      window.oncontextmenu = Globals.disableAndroidChromeCallout;
    } else if (isPlatform('ios')) {
      document.ontouchend = Globals.disableIosSafariCallout.bind(window);
    }

    // ----- Initializing UI settings -----
    // Apply the theme setting.
    while (document.body.classList.length > 0) {
      document.body.classList.remove(document.body.classList.item(0)!);
    }
    document.body.classList.toggle(`theme${this.props.settings.theme}`, true);

    // Modify UI settings from query string.
    const queryParams = queryString.parse(this.props.location.search) as any;
    if (queryParams.settings) {
      this.originalAppSettingsStr = localStorage.getItem(Globals.storeFile);
      (queryParams.settings as string).split(',').forEach(setting => {
        const keyVal = setting.split('=');
        this.props.dispatch({
          type: "SET_KEY_VAL",
          key: keyVal[0],
          val: +keyVal[1],
        });
      });
    }
    Globals.updateCssVars(this.props.settings);

    this.state = {
      showUpdateAlert: false,
      showRestoreAppSettingsToast: (queryParams.settings != null && this.originalAppSettingsStr != null) || false,
      showToast: false,
      showGetPositionAlert: false,
      toastMessage: '',
    };

    serviceWorkCallbacks.onUpdate = (registration: ServiceWorkerRegistration) => {
      this.registrationNew = registration;
      this.setState({ showUpdateAlert: true });
    };

    serviceWorkCallbacks.onSuccess = (registration: ServiceWorkerRegistration) => {
    };

    // Preload speechSynthesis.
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.getVoices();
      speechSynthesis.cancel();
    }

    // Enable screen wake lock.
    if ((navigator as any).wakeLock) {
      this.wakeLockScreen();
      document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === 'visible') {
          this.wakeLockScreen();
        } else {
          this.wakeLockScreenRelease()
        }
      });
    }

    const dbOpenReq = indexedDB.open(Globals.tfwcDb);
    // Init store in indexedDB if necessary.
    dbOpenReq.onupgradeneeded = function (event: IDBVersionChangeEvent) {
      var db = (event.target as any).result;
      db.createObjectStore('store');
      console.log(`DB store created.`);
    };
    this.loadTwdData();
  }

  restoreAppSettings() {
    localStorage.setItem(Globals.storeFile, this.originalAppSettingsStr!);
    this.props.dispatch({ type: 'LOAD_SETTINGS' });
    while (document.body.classList.length > 0) {
      document.body.classList.remove(document.body.classList.item(0)!);
    }
    document.body.classList.toggle(`theme${this.props.settings.theme}`, true);
    Globals.updateCssVars(this.props.settings);
  }

  async loadTwdData() {
    store.dispatch({
      type: "TMP_SET_KEY_VAL",
      key: 'isLoadingData',
      val: true,
    });
    let data: any[];
    for (let i = 0; i < Globals.freeResources.length; i++) {
      let item = Globals.freeResources[i];
      try {
        data = await Globals.getFileFromIndexedDB(item.dataKey) as any[];
      } catch (err) {
        data = await Globals.downloadCsvZipData(item.url, (progress: number) => {
        });
        Globals.saveFileToIndexedDB(item.dataKey, data);
      }

      if (i === 0) {
        store.dispatch({
          type: "TMP_SET_KEY_VAL",
          key: 'freeChargingItems',
          val: data.map(d => new FreeChargingItem(d)),
        });
      } else {
        store.dispatch({
          type: "TMP_SET_KEY_VAL",
          key: 'freeWifiItems',
          val: data.map(d => new FreeWifiItem(d)),
        });
      }
    }

    if (!this.props.settings.isInitialized) {
      this.setState({ showGetPositionAlert: true });
    } else {
      this.getCurrentPositionAndSortData();
    }
  }

  // Prevent device from sleeping.
  wakeLock: any;
  async wakeLockScreen() {
    try {
      const wakeLock = (navigator as any).wakeLock;
      if (wakeLock != null) {
        this.wakeLock = await wakeLock.request('screen');
        console.log('Screen wake lock is requested.');
      } else {
        console.error('navigator.wakeLock is undefined.');
      }
    } catch (err) {
      // the wake lock request fails - usually system related, such low as battery
      console.log(`${err.name}, ${err.message}`);
      console.log(new Error().stack);
    }
  }

  async wakeLockScreenRelease() {
    if (this.wakeLock != null) {
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('Screen wake lock is released.');
    }
  }

  routeByQueryString() {
    // This app uses client side routing. 
    // Without the first loading of this app,
    // any client side route becomes a server side route!
    // These invalid server side routings cause 404 errors.
    // To workaround these errors, we can use GitHub 404.html redirection
    // to pass the client side routes to this app by using query string.
    // After this app loads, it can use the query string to correctly redirect to
    // a client side route!
    console.log(window.location.search);
    const routeMatches = /route=([^&]*)/.exec(window.location.search);
    const queryMatches = /query=([^&]*)/.exec(window.location.search);
    if (routeMatches !== null) {
      const route = decodeURIComponent(routeMatches[1]);

      let query = ''
      if (queryMatches !== null) {
        query = decodeURIComponent(queryMatches[1]);
      }
      return <Redirect to={route + query} />;
    } else if (window.location.pathname === `${Globals.pwaUrl}/` || window.location.pathname === `${Globals.pwaUrl}`) {
      return <Redirect to={`${Globals.pwaUrl}/charging`} />;
    }
  }

  async getCurrentPositionAndSortData() {
    await Globals.getCurrentPositionAndSortData(
      store.dispatch,
      this.props.tmpSettings.freeChargingItems,
      this.props.tmpSettings.freeWifiItems
    );

    store.dispatch({
      type: "TMP_SET_KEY_VAL",
      key: 'isLoadingData',
      val: false,
    });
  }

  render() {
    return (
      <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet animated={false}>
              {/* The following route is for backward compatibility. */}
              <Route path={`${Globals.pwaUrl}/:tab(charging)`} render={(props: any) => <ListPage {...props} />} exact={true} />
              <Route path={`${Globals.pwaUrl}/:tab(wifi)`} render={(props: any) => <ListPage {...props} />} exact={true} />
              <Route path={`${Globals.pwaUrl}/settings`} render={(props: any) => <SettingsPage {...props} />} />
              <Route path={`${Globals.pwaUrl}/`} render={() => { return this.routeByQueryString(); }} exact={true} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="charging" href={`${Globals.pwaUrl}/charging`}>
                <IonIcon icon={batteryCharging} />
              </IonTabButton>
              <IonTabButton tab="wifi" href={`${Globals.pwaUrl}/wifi`}>
                <IonIcon icon={wifi} />
              </IonTabButton>
              <IonTabButton tab="settings" href={`${Globals.pwaUrl}/settings`}>
                <IonIcon icon={settings} />
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
        <IonAlert
          cssClass='uiFont'
          isOpen={this.state.showUpdateAlert}
          backdropDismiss={false}
          onDidPresent={(ev) => {
            // Run SKIP_WAITING at onDidPresent event to avoid a race condition of
            // an old page fetching old JS chunks with a new service worker!
            this.registrationNew?.installing?.postMessage({ type: 'SKIP_WAITING' });
            this.registrationNew?.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }}
          header={'請重啟 app!'}
          buttons={[
            {
              text: '關閉',
              cssClass: 'primary uiFont',
              handler: (value) => {
                this.setState({
                  showUpdateAlert: false,
                });
              },
            }
          ]}
        />

        <ShareTextModal
          {...{
            text: this.props.shareTextModal?.text,
            showModal: this.props.shareTextModal?.show || false,
            finish: () => {
              store.dispatch({
                type: "TMP_SET_KEY_VAL",
                key: 'shareTextModal',
                val: { show: false },
              });
            }, ...this.props
          }}
        />

        <IonAlert
          cssClass='uiFont'
          isOpen={this.state.showGetPositionAlert}
          backdropDismiss={false}
          header={'需要您的位置作導航至免費充電站或 WiFi 熱點。按下關閉後，會跳出位置權限存取，請允許此 app 存取您的位置。'}
          buttons={[
            {
              text: '關閉',
              cssClass: 'primary uiFont',
              handler: (value) => {
                this.setState({
                  showGetPositionAlert: false,
                });
                store.dispatch({
                  type: "SET_KEY_VAL",
                  key: 'isInitialized',
                  val: true,
                });
                this.getCurrentPositionAndSortData();
              },
            },
          ]}
        />

        <IonToast
          cssClass='uiFont'
          isOpen={this.state.showRestoreAppSettingsToast}
          onDidDismiss={() => this.setState({ showRestoreAppSettingsToast: false })}
          message={`已套用app連結中的設定，是否還原設定？`}
          buttons={[
            {
              text: '取消',
              role: 'cancel',
              handler: () => this.setState({ showRestoreAppSettingsToast: false })
            },
            {
              text: '還原',
              handler: () => this.restoreAppSettings(),
            },
          ]}
        />

        <IonToast
          cssClass='uiFont'
          isOpen={this.state.showToast}
          onDidDismiss={() => this.setState({ showToast: false })}
          message={this.state.toastMessage}
          duration={2000}
        />
      </IonApp>
    );
  }
}

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    shareTextModal: state.tmpSettings.shareTextModal,
    settings: state.settings,
    tmpSettings: state.tmpSettings,
  }
};

const AppOrig = connect(
  mapStateToProps,
)(_AppOrig);


const App = withRouter(_App);

export default App;
