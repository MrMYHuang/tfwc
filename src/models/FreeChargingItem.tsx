export class FreeChargingItem {
    主管機關 = ''; // Eg. '內政部'
    地區 = ''; // Eg. '新北市'
    充電站名稱 = ''; // Eg. '新北市新店戶政事務所'
    地址 = ''; // Eg. '231新北市新店區行政街2號2樓'
    緯度 = 0; // Eg. '24.967241'
    經度 = 0; // Eg. '121.542046'

    constructor(json: any) {
        this.主管機關 = json.主管機關;
        this.地區 = json.地區;
        this.充電站名稱 = json.充電站名稱;
        this.地址 = json.地址;
        this.緯度 = +json.緯度;
        this.經度 = +json.經度;
    }
}
