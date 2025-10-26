import { createGlobalState } from "@vueuse/core";
import { ref, shallowRef } from "vue";
import {Map, Popup, type LngLatLike} from "maplibre-gl";
export const useMapStore = createGlobalState(() => {
    const lnglat: LngLatLike = [125.1275, 8.1569];
    const map = shallowRef<null | Map>(null);
    const popup = ref<Popup | null>(new Popup({
    closeButton: false,
    closeOnClick: false,
    }));
    return {
        map,
        lnglat,
        popup
    };
});  