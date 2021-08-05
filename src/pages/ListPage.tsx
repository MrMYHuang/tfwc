import React from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, withIonLifeCycle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonLoading, IonToast, IonTitle, IonInfiniteScroll, IonInfiniteScrollContent, IonAlert } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { shareSocial } from 'ionicons/icons';
import { FreeChargingItem } from '../models/FreeChargingItem';
import { FreeWifiItem } from '../models/FreeWifiItem';
import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';

interface Props {
  dispatch: Function;
  isLoadingData: boolean;
  tmpSettings: TmpSettings;
  settings: Settings;
}

interface PageProps extends Props, RouteComponentProps<{
  path: string;
  tab: string;
}> { }

interface State {
  dataParts: Array<FreeChargingItem | FreeWifiItem>;
  popover: any;
  isScrollOn: boolean;
  fetchError: boolean;
  showToast: boolean;
  toastMessage: string;
  showConfrimOpenMapAlert: boolean;
}

class _ListPage extends React.Component<PageProps, State> {
  data: Array<FreeChargingItem | FreeWifiItem>;
  mode: string;

  constructor(props: any) {
    super(props);
    this.state = {
      dataParts: [],
      popover: {
        show: false,
        event: null,
      },
      isScrollOn: false,
      fetchError: false,
      showConfrimOpenMapAlert: false,
      showToast: false,
      toastMessage: '',
    }
    this.data = [];
    this.mode = this.props.match.params.tab;
  }

  ionViewWillEnter() {
    //console.log(`${this.props.match.url} will enter`);
    this.fetchData(true);
  }

  /*
  componentDidMount() {
    //console.log(`did mount: ${this.props.match.url}`);
  }
  
  componentWillUnmount() {
    console.log(`${this.props.match.url} unmount`);
  }

  ionViewWillLeave() {
  }
  */

  page = 0;
  rows = 20;
  async fetchData(fromStart: boolean = false) {
    await new Promise<void>((ok, fail) => {
      let timer = setInterval(() => {
        if (!this.props.isLoadingData) {
          clearInterval(timer);
          ok();
        }
      }, 50);
    });

    if (fromStart) {
      if (this.mode !== 'wifi') {
        this.data = this.props.tmpSettings.freeChargingItems;
      } else {
        this.data = this.props.tmpSettings.freeWifiItems;
      }
      this.page = 0;
    }

    //console.log(`Loading page ${this.page}`);

    const dataParts = this.data.slice(this.page * this.rows, (this.page + 1) * this.rows);

    this.page += 1;
    this.setState({
      fetchError: false, dataParts: fromStart ? dataParts : [...this.state.dataParts, ...dataParts],
      isScrollOn: this.state.dataParts.length < this.data.length,
    });

    return true;
  }

  selectedMapUrl = '';
  getRows() {
    const userCoords = this.props.tmpSettings.currPosition?.coords;
    let rows = Array<object>();
    this.state.dataParts.forEach((item: FreeChargingItem | FreeWifiItem, index: number) => {
      let mapUrl = '';
      if (userCoords != null) {
        mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.latitude},${userCoords.longitude}&destination=${item.緯度},${item.經度}`;
      } else {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${item.緯度},${item.經度}`;
      }
      rows.push(
        <IonItem button={true} key={`dictItem` + index}
          onClick={async event => {
            this.selectedMapUrl = mapUrl;
            this.setState({ showConfrimOpenMapAlert: true });
          }}>
          <div tabIndex={0}></div>{/* Workaround for macOS Safari 14 bug. */}
          <IonLabel className='ion-text-wrap uiFont' key={`bookmarkItemLabel_` + index}>
            {this.mode !== 'wifi' ? (item as FreeChargingItem).充電站名稱 : (item as FreeWifiItem).熱點名稱}
          </IonLabel>
        </IonItem>
      );
    });
    return rows;
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>免費{this.mode !== 'wifi' ? '充電' : ' WiFi'}</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              this.props.dispatch({
                type: "TMP_SET_KEY_VAL",
                key: 'shareTextModal',
                val: {
                  show: true,
                  text: decodeURIComponent(window.location.href),
                },
              });
            }}>
              <IonIcon icon={shareSocial} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>

          {
            !this.props.settings.isInitialized ?
              <></>
              :
              this.props.isLoadingData ?
                <IonLoading
                  cssClass='uiFont'
                  isOpen={this.props.isLoadingData}
                  message={'載入中...'}
                />
                :
                <IonList>
                  {this.getRows()}
                  <IonInfiniteScroll threshold="100px"
                    disabled={!this.state.isScrollOn}
                    onIonInfinite={(ev: CustomEvent<void>) => {
                      this.fetchData();
                      (ev.target as HTMLIonInfiniteScrollElement).complete();
                    }}>
                    <IonInfiniteScrollContent
                      loadingText="載入中...">
                    </IonInfiniteScrollContent>
                  </IonInfiniteScroll>
                </IonList>
          }

          <IonAlert
            cssClass='uiFont'
            isOpen={this.state.showConfrimOpenMapAlert}
            backdropDismiss={false}
            header={'確定開啟地圖？'}
            buttons={[
              {
                text: '關閉',
                cssClass: 'secondary uiFont',
                handler: (value) => {
                  this.setState({
                    showConfrimOpenMapAlert: false,
                  });
                },
              },
              {
                text: '確定',
                cssClass: 'primary uiFont',
                handler: (value) => {
                  this.setState({
                    showConfrimOpenMapAlert: false,
                  });
                  window.open(this.selectedMapUrl);
                },
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
        </IonContent>
      </IonPage>
    );
  }
};

const ListPage = withIonLifeCycle(_ListPage);

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    isLoadingData: state.tmpSettings.isLoadingData,
    tmpSettings: state.tmpSettings,
    settings: state.settings,
  }
};

//const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
)(ListPage);