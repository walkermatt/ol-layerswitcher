export interface Format {
    places: number;
    digitSeparator: boolean;
    dateFormat: string;
}

export interface FieldInfo {
    fieldName: string;
    label: string;
    isEditable: boolean;
    tooltip: string;
    visible: boolean;
    format: Format;
    stringFieldOption: string;
}

export interface PopupInfo {
    title: string;
    fieldInfos: FieldInfo[];
    description?: any;
    showAttachments: boolean;
    mediaInfos: any[];
}

export interface OperationalLayer {
    id: string;
    layerType: string;
    url: string;
    visibility: boolean;
    opacity: number;
    mode: number;
    title: string;
    popupInfo: PopupInfo;
}

export interface BaseMapLayer {
    id: string;
    layerType: string;
    url: string;
    visibility: boolean;
    opacity: number;
    title: string;
}

export interface BaseMap {
    baseMapLayers: BaseMapLayer[];
    title: string;
}

export interface SpatialReference {
    wkid: number;
    latestWkid: number;
}

export interface SpatialReference2 {
    wkid: number;
}

export interface Extent {
    spatialReference: SpatialReference2;
    xmax: number;
    xmin: number;
    ymax: number;
    ymin: number;
}

export interface Bookmark {
    extent: Extent;
    name: string;
}

export interface Routing {
    enabled: boolean;
}

export interface BasemapGallery {
    enabled: boolean;
}

export interface Measure {
    enabled: boolean;
}

export interface Viewing {
    routing: Routing;
    basemapGallery: BasemapGallery;
    measure: Measure;
}

export interface ApplicationProperties {
    viewing: Viewing;
}

export interface Value {
    fields: string[];
}

export interface MediaInfo {
    title: string;
    type: string;
    caption: string;
    value: Value;
}

export interface Layer {
    id: number;
    showLegend: boolean;
    popupInfo: PopupInfo;
}

export interface WebMap {
    layers: Layer[];
    minScale: number;
    maxScale: number;
    operationalLayers: OperationalLayer[];
    baseMap: BaseMap;
    spatialReference: SpatialReference;
    authoringApp: string;
    authoringAppVersion: string;
    version: string;
    bookmarks: Bookmark[];
    applicationProperties: ApplicationProperties;
    MapItems?: any;
    Slides?: any;
}

import Ajax = require("./ajax");


const DEFAULT_URLS = [
    "https://www.arcgis.com/sharing/rest/content/items/204d94c9b1374de9a21574c9efa31164/data?f=json",
    "https://www.arcgis.com/sharing/rest/content/items/a193c5459e6e4fd99ebf09d893d65cf0/data?f=json"
];

export class WebMap {

    get(url = DEFAULT_URLS[1]) {
        let service = new Ajax(url);
        return service.get<WebMap>();
    }

}