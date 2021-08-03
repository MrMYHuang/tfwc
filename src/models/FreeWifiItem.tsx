export class FreeWifiItem {
    主管機關 = ''; // Eg. '行政院農業委員會'
    地區 = ''; // Eg. '臺北市'
    熱點名稱 = ''; // Eg. '行政院農業委員會10樓辦公區'
    地址 = ''; // Eg. '100臺北市中正區南海路37號10樓'
    緯度 = 0; // Eg. '25.0320680'
    經度 = 0; // Eg. '121.5132000'

    constructor(json: any) {
        this.主管機關 = json.主管機關;
        this.地區 = json.地區;
        this.熱點名稱 = json.熱點名稱;
        this.地址 = json.地址;
        this.緯度 = +json.緯度;
        this.經度 = +json.經度;
    }
}
