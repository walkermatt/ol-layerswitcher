export namespace PortalForArcGis {

    export interface OperationalLayer {
        // in addition to base layer
        mode?: number;
        popupInfo?: PopupInfo;
    }

}

export namespace PortalForArcGis {

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

    export interface Outline {
        style: string;
        color: number[];
        width: number;
        type: string;
    }

    export interface Font {
        weight: string;
        style: string;
        family: string;
        size: number;
    }

    export interface Symbol {
        style: string;
        color: number[];
        outline: Outline;
        type: string;
        width?: number;
        horizontalAlignment: string;
        verticalAlignment: string;
        font: Font;
        height?: number;
        xoffset?: number;
        yoffset?: number;
        contentType: string;
        url: string;
        size?: number;
    }

    export interface UniqueValueInfo {
        symbol: Symbol;
        description: string;
        value: string;
        label: string;
    }

    export interface Renderer {
        field1: string;
        type: string;
        uniqueValueInfos: UniqueValueInfo[];
    }

    export interface DrawingInfo {
        renderer: Renderer;
    }

    export interface Attributes {
        VISIBLE: number;
        TITLE: string;
        TYPEID: number;
    }

    export interface Prototype {
        attributes: Attributes;
    }

    export interface Template {
        drawingTool: string;
        description: string;
        name: string;
        prototype: Prototype;
    }

    export interface Domains {
    }

    export interface Type {
        id: number;
        templates: Template[];
        domains: Domains;
        name: string;
    }

    export interface Field {
        alias: string;
        name: string;
        type: string;
        editable: boolean;
        length?: number;
    }

    export interface SpatialReference {
        wkid: number;
        latestWkid: number;
    }

    export interface Extent {
        type: string;
    }

    export interface LayerDefinition {
        objectIdField: string;
        templates: any[];
        type: string;
        drawingInfo: DrawingInfo;
        displayField: string;
        visibilityField: string;
        name: string;
        hasAttachments: boolean;
        typeIdField: string;
        capabilities: string;
        types: Type[];
        geometryType: string;
        fields: Field[];
        extent: Extent;
    }

    export interface Value {
        fields: string[];
        sourceURL: string;
        linkURL: string;
    }

    export interface MediaInfo {
        title: string;
        caption: string;
        value: Value;
        type: string;
    }

    export interface PopupInfo {
        fieldInfos: FieldInfo[];
        showAttachments: boolean;
        mediaInfos: MediaInfo[];
        title: string;
        description: string;
    }

    export interface Geometry {
        rings: number[][][];
        spatialReference: SpatialReference;
    }

    export interface Feature {
        geometry: Geometry;
        attributes: any;
    }

    export interface FeatureSet {
        geometryType: string;
        features: Feature[];
    }

    export interface Layer {
        id: number;
        showLegend: boolean;
        layerDefinition: LayerDefinition;
        popupInfo: PopupInfo;
        featureSet: FeatureSet;
        nextObjectId: number;
    }

    export interface FeatureCollection {
        layers: Layer[];
        showLegend: boolean;
    }

    export interface OperationalLayer {
        layerType: string;
        id: string;
        url: string;
        title: string;
        featureCollection: FeatureCollection;
        opacity: number;
        visibility: boolean;
    }

    export interface BaseMapLayer {
        isReference?: boolean;
        title: string;
        id: string;
        layerType: string;
        opacity: number;
        visibility: boolean;
        url: string;
    }

    export interface BaseMap {
        baseMapLayers: BaseMapLayer[];
        title: string;
    }

    export interface Extent {
        spatialReference: SpatialReference;
        xmax: number;
        xmin: number;
        ymax: number;
        ymin: number;
    }

    export interface Bookmark {
        extent: Extent;
        name: string;
    }

    export interface Title {
        backgroundColor: number[];
        borderColor: number[];
        borderSize: number;
        font: string;
        fontSize: number;
        foregroundColor: number[];
        horizontalAlignment: number;
        opacity: number;
        text: string;
        titleFontStyle: number;
    }

    export interface VisibleLayer {
        id: string;
    }

    export interface Slide {
        baseMap: BaseMap;
        hidden: boolean;
        extent: Extent;
        title: Title;
        visibleLayers: VisibleLayer[];
    }

    export interface Presentation {
        slides: Slide[];
        displayTimeSlider: boolean;
        slideAdvancementInterval: number;
        useTimeExtentOfSlide: boolean;
    }

    export interface WebMap {
        layers: Layer[];
        minScale: number;
        maxScale: number;
        authoringApp: string;
        authoringAppVersion: string;
        applicationProperties: ApplicationProperties;
        MapItems?: any;
        Slides?: any;
        operationalLayers: OperationalLayer[];
        baseMap: BaseMap;
        spatialReference: SpatialReference;
        version: string;
        bookmarks: Bookmark[];
        presentation: Presentation;
    }

}

import Ajax = require("./ajax");

const DEFAULT_URLS = [
    "https://www.arcgis.com/sharing/rest/content/items/204d94c9b1374de9a21574c9efa31164/data?f=json",
    "https://www.arcgis.com/sharing/rest/content/items/a193c5459e6e4fd99ebf09d893d65cf0/data?f=json"
];

export class WebMap {

    get(url = DEFAULT_URLS[1]) {
        let service = new Ajax(url);
        return service.get<PortalForArcGis.WebMap>();
    }

}