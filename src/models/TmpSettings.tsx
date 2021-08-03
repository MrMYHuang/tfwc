import { FreeChargingItem } from "./FreeChargingItem";
import { FreeWifiItem } from "./FreeWifiItem";

export class TmpSettings {
    fetchError: boolean = false;
    isLoadingData: boolean = false;
    freeChargingItems: Array<FreeChargingItem> = [];
    freeWifiItems: Array<FreeWifiItem> = [];
    currPosition: GeolocationPosition | undefined = undefined;
    shareTextModal = { text: '', show: false };
}
