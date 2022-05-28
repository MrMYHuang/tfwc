import { FreeChargingItem } from "./FreeChargingItem";
import { IFreeWifiItem } from "./FreeWifiItem";

export interface ShareTextModal {
    text: string;
    show: boolean;
}

export interface TmpSettings {
    fetchError: boolean;
    isLoadingData: boolean;
    freeChargingItems: Array<FreeChargingItem>;
    freeWifiItems: Array<IFreeWifiItem>;
    currPosition: GeolocationPosition | undefined;
    shareTextModal: ShareTextModal;
}

export const defaultTmpSettings = {
    fetchError: false,
    isLoadingData: false,
    freeChargingItems: [],
    freeWifiItems: [],
    currPosition: undefined,
    shareTextModal: { text: '', show: false },
};
