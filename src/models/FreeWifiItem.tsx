export interface IFreeWifiItem {
    主管機關: string; // Ministry
    地區: string; // Area
    機關: string; // Agency
    熱點名稱: string; // Name
    地址: string // Address
    管理單位: string; // Administration
    緯度: number; // Latitude
    經度: number; // Longitude
}

export class FreeWifiItem implements IFreeWifiItem {
    主管機關 = ''; // Ministry
    地區 = ''; // Area
    機關 = ''; // Agency
    熱點名稱 = ''; // Name
    地址 = ''; // Address
    管理單位 = ''; // Administration
    緯度 = 0; // Latitude
    經度 = 0; // Longitude

    constructor(json: any) {
        // Latest hotspotlist.zip uses English headers; keep legacy support too.
        this.主管機關 = json.Ministry ?? json.主管機關 ?? '';
        this.地區 = json.Area ?? json.地區 ?? '';
        this.機關 = json.Agency ?? json.機關 ?? '';
        this.熱點名稱 = json.Name ?? json.熱點名稱 ?? '';
        this.地址 = json.Address ?? json.地址 ?? '';
        this.管理單位 = json.Administration ?? json.管理單位 ?? '';
        const lat = +(json.Latitude ?? json.緯度 ?? 0);
        const lng = +(json.Longitude ?? json.經度 ?? 0);
        this.緯度 = Number.isFinite(lat) ? lat : 0;
        this.經度 = Number.isFinite(lng) ? lng : 0;
    }
}
