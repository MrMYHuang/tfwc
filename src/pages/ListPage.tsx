import React, { ReactNode } from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, withIonLifeCycle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonLoading, IonToast, IonTitle, IonInfiniteScroll, IonInfiniteScrollContent, IonAlert, IonSelect, IonInput, IonSelectOption, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { location } from 'ionicons/icons';
import { FreeChargingItem, FreeWifiItem } from 'tfwc-data';
import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';
import './ListPage.css';
import Globals from '../Globals';

class FilterSel {
  id: number = 0;
  key: string = '地區';
  search: string = '';
}

const filters: string[] = [
  '地址',
  '地區',
];

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
  filtersSel: FilterSel[];
  popover: any;
  isScrollOn: boolean;
  fetchError: boolean;
  showToast: boolean;
  toastMessage: string;
  showConfrimOpenMapAlert: boolean;
}

class _ListPage extends React.Component<PageProps, State> {
  dataFiltered: Array<FreeChargingItem | FreeWifiItem> = [];
  mode: string;

  constructor(props: any) {
    super(props);
    this.state = {
      dataParts: [],
      filtersSel: [],
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
  loadMoreLock = false;
  async fetchData(fromStart: boolean = false) {
    await new Promise<void>((ok, fail) => {
      let timer = setInterval(() => {
        if (!this.props.isLoadingData) {
          clearInterval(timer);
          ok();
        }
      }, 50);
    });

    if (this.loadMoreLock) {
      return;
    }
    this.loadMoreLock = true;

    if (fromStart) {
      if (this.mode !== 'wifi') {
        this.dataFiltered = this.props.tmpSettings.freeChargingItems;
      } else {
        this.dataFiltered = this.props.tmpSettings.freeWifiItems;
      }
      const filterRegExp = this.state.filtersSel.map((fs, i) => new RegExp(`.*${this.state.filtersSel[i].search}.*`));
      this.dataFiltered = this.dataFiltered.filter(a => {
        let match = true;
        for (let i = 0; i < filterRegExp.length; i++) {
          const searchText = this.state.filtersSel[i].search;
          if (searchText !== '') {
            const key = this.state.filtersSel[i].key;
            const thisMatch = filterRegExp[i].test((a as any)[key]);
            match = match && thisMatch;
          }
        }
        return match;
      });
      this.page = 0;
    }

    console.log(`Loading page ${this.page}`);

    const newDataPartRangeEnd = Math.min((this.page + 1) * this.rows, this.dataFiltered.length);
    const dataPart = this.dataFiltered.slice(this.page * this.rows, newDataPartRangeEnd);
    const newDataParts = fromStart ? dataPart : [...this.state.dataParts, ...dataPart];
    this.setState({
      fetchError: false, dataParts: newDataParts,
      isScrollOn: newDataParts.length < this.dataFiltered.length,
    }, () => {
      this.page += 1;
      this.loadMoreLock = false;
    });

    return true;
  }

  renderFilterRows() {
    return this.state.filtersSel.map((fs, i) => {
      return <IonItemSliding key={`filterRowSliding${i}`}>
        <IonItem key={`filterRow${i}`}>
          <IonSelect
            slot='start'
            value={fs.id}
            className='uiFont ionSelect'
            interface='popover'
            onIonChange={e => {
              const value = +e.detail.value;
              // Important! Because it can results in rerendering of this component but
              // store states (this.props) of this component is not updated yet! And IonSelect value will be changed
              // back to the old value and onIonChange will be triggered again!
              // Thus, we use this check to ignore this invalid change.
              if (+fs.id === value) {
                return;
              }

              let filtersSel = JSON.parse(JSON.stringify(this.state.filtersSel));
              filtersSel[i].id = value;
              filtersSel[i].key = filters[value];
              this.setState({ filtersSel });
            }}
          >
            {
              filters.map((f, j) => <IonSelectOption className='uiFont' key={`selOpt${j}`} value={j}>
                {f}
              </IonSelectOption>)
            }
          </IonSelect>

          <IonInput
            value={this.state.filtersSel[i].search}
            className='uiFont ionInput'
            clearInput={true}
            onIonChange={e => {
              let filtersSel = JSON.parse(JSON.stringify(this.state.filtersSel));
              filtersSel[i].search = e.detail.value || '';
              this.setState({ filtersSel })
            }}></IonInput>
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption className='uiFont' color='danger' onClick={(e) => {
            const filtersSel = this.state.filtersSel
            filtersSel.splice(i, 1);
            this.setState({ filtersSel });
          }}>刪除</IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    });
  }

  selectedMapUrl = '';
  getRows() {
    const userCoords = this.props.tmpSettings.currPosition?.coords;
    let rows = Array<ReactNode>();
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
          <div className='listItem'>
            <div>
              <IonLabel className='ion-text-wrap uiFont' key={`bookmarkItemLabel_` + index}>
                {this.mode !== 'wifi' ? (item as FreeChargingItem).充電站名稱 : (item as FreeWifiItem).熱點名稱}
              </IonLabel>
            </div>
            <div>
              <IonLabel className='ion-text-wrap uiFontX0_7'>
                {item.地址}
              </IonLabel>
            </div>
          </div>
        </IonItem>
      );
    });
    return rows;
  }

  async getCurrentPositionAndSortData() {
    this.props.dispatch({
      type: "TMP_SET_KEY_VAL",
      key: 'isLoadingData',
      val: true,
    });

    try {
      await Globals.getCurrentPositionAndSortData(
        this.props.dispatch,
        this.props.tmpSettings.freeChargingItems,
        this.props.tmpSettings.freeWifiItems
      );
    } catch (error) {
      console.error(error);
      this.setState({showToast: true, toastMessage: `定位失敗`});
    }

    this.props.dispatch({
      type: "TMP_SET_KEY_VAL",
      key: 'isLoadingData',
      val: false,
    });
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>免費{this.mode !== 'wifi' ? '充電' : ' WiFi'}</IonTitle>

            <IonButton fill="clear" slot='end' onClick={async e => {
              await this.getCurrentPositionAndSortData()
              this.fetchData(true);
            }}>
              <IonIcon icon={location} slot='icon-only' />
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
                <>
                  <IonList>
                    {this.renderFilterRows()}
                  </IonList>

                  <div className='uisRow'>
                    <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                      const filtersSel = JSON.parse(JSON.stringify(this.state.filtersSel));
                      filtersSel.push(new FilterSel());
                      this.setState({ filtersSel });
                    }}>+過濾</IonButton>
                    <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                      this.fetchData(true);
                    }}>搜尋</IonButton>
                  </div>

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
                </>
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
    tmpSettings: { ...state.tmpSettings },
    settings: { ...state.settings },
  }
};

//const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
)(ListPage);
