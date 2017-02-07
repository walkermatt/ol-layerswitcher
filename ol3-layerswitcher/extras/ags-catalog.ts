import Ajax = require("./ajax");

export interface Service {
    name: string;
    type: string;
}

export interface CatalogInfo {
    currentVersion: number;
    folders: string[];
    services: Service[];
}

export interface SpatialReference {
    wkid: number;
    latestWkid: number;
    wkt: string;
}

export interface Extent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: SpatialReference;
}

export interface DocumentInfo {
    Title: string;
    Author: string;
    Comments: string;
    Subject: string;
    Category: string;
    AntialiasingMode: string;
    TextAntialiasingMode: string;
    Keywords: string;
}

export interface Layer {
    id: number;
    name: string;
    parentLayerId: number;
    defaultVisibility: boolean;
    subLayerIds?: any;
    minScale: number;
    maxScale: number;
}

export interface FeatureServerInfo {
    currentVersion: number;
    serviceDescription: string;
    hasVersionedData: boolean;
    supportsDisconnectedEditing: boolean;
    syncEnabled: boolean;
    supportedQueryFormats: string;
    maxRecordCount: number;
    capabilities: string;
    description: string;
    copyrightText: string;
    spatialReference: SpatialReference;
    initialExtent: Extent;
    fullExtent: Extent;
    allowGeometryUpdates: boolean;
    units: string;
    documentInfo: DocumentInfo;
    layers: Layer[];
    tables: any[];
    enableZDefaults: boolean;
    zDefault: number;
}

export interface AdvancedQueryCapabilities {
    supportsPagination: boolean;
    supportsStatistics: boolean;
    supportsOrderBy: boolean;
    supportsDistinct: boolean;
}

export interface EsriTSSymbol {
    type: string;
    color: number[];
    backgroundColor?: any;
    borderLineColor?: any;
    borderLineSize?: any;
    verticalAlignment: string;
    horizontalAlignment: string;
    rightToLeft: boolean;
    angle: number;
    xoffset: number;
    yoffset: number;
    kerning: boolean;
    haloColor?: any;
    haloSize?: any;
    font: Font;
}

export interface DefaultSymbol {
    type: string;
    url: string;
    imageData: string;
    contentType: string;
    width: number;
    height: number;
    angle: number;
    xoffset: number;
    yoffset: number;
}

export interface UniqueValueInfo {
    symbol: DefaultSymbol;
    value: string;
    label: string;
    description: string;
}

export interface Renderer {
    type: string;
    field1: string;
    field2?: any;
    field3?: any;
    fieldDelimiter: string;
    defaultSymbol: DefaultSymbol;
    defaultLabel: string;
    uniqueValueInfos: UniqueValueInfo[];
}

export interface Font {
    family: string;
    size: number;
    style: string;
    weight: string;
    decoration: string;
}

export interface LabelingInfo {
    labelPlacement: string;
    where?: any;
    labelExpression: string;
    useCodedValues: boolean;
    symbol: DefaultSymbol & EsriTSSymbol;
    minScale: number;
    maxScale: number;
}

export interface DrawingInfo {
    renderer: Renderer;
    transparency: number;
    labelingInfo: LabelingInfo[];
}

export interface CodedValue {
    name: string;
    code: any;
}

export interface Domain {
    type: string;
    name: string;
    codedValues: CodedValue[];
    range: number[];
}

export interface Field {
    name: string;
    type: string;
    alias: string;
    domain: Domain;
    editable: boolean;
    nullable: boolean;
    length?: number;
}

export interface Domains {
    [n: string]: {
        type: string
    };
}

export interface Attributes {
    [n: string]: string;
}

export interface Prototype {
    attributes: Attributes;
}

export interface Template {
    name: string;
    description: string;
    prototype: Prototype;
    drawingTool: string;
}

export interface Type {
    id: string;
    name: string;
    domains: Domains;
    templates: Template[];
}

export interface FeatureLayerInfo {
    currentVersion: number;
    id: number;
    name: string;
    type: string;
    description: string;
    copyrightText: string;
    defaultVisibility: boolean;
    editFieldsInfo?: any;
    ownershipBasedAccessControlForFeatures?: any;
    syncCanReturnChanges: boolean;
    relationships: any[];
    isDataVersioned: boolean;
    supportsRollbackOnFailureParameter: boolean;
    supportsStatistics: boolean;
    supportsAdvancedQueries: boolean;
    advancedQueryCapabilities: AdvancedQueryCapabilities;
    geometryType: string;
    minScale: number;
    maxScale: number;
    extent: Extent;
    drawingInfo: DrawingInfo;
    hasM: boolean;
    hasZ: boolean;
    enableZDefaults: boolean;
    zDefault: number;
    allowGeometryUpdates: boolean;
    hasAttachments: boolean;
    htmlPopupType: string;
    objectIdField: string;
    globalIdField: string;
    displayField: string;
    typeIdField: string;
    fields: Field[];
    types: Type[];
    templates: any[];
    maxRecordCount: number;
    supportedQueryFormats: string;
    capabilities: string;
    useStandardizedQueries: boolean;
}

export interface Origin {
    x: number;
    y: number;
}

export interface Lod {
    level: number;
    resolution: number;
    scale: number;
}

export interface TileInfo {
    rows: number;
    cols: number;
    dpi: number;
    format: string;
    compressionQuality: number;
    origin: Origin;
    spatialReference: SpatialReference;
    lods: Lod[];
}

export interface InitialExtent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: SpatialReference;
}

export interface FullExtent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: SpatialReference;
}

export interface MapServerInfo {
    currentVersion: number;
    serviceDescription: string;
    mapName: string;
    description: string;
    copyrightText: string;
    supportsDynamicLayers: boolean;
    layers: Layer[];
    tables: any[];
    spatialReference: SpatialReference;
    singleFusedMapCache: boolean;
    tileInfo: TileInfo;
    initialExtent: InitialExtent;
    fullExtent: FullExtent;
    minScale: number;
    maxScale: number;
    units: string;
    supportedImageFormatTypes: string;
    documentInfo: DocumentInfo;
    capabilities: string;
    supportedQueryFormats: string;
    exportTilesAllowed: boolean;
    maxRecordCount: number;
    maxImageHeight: number;
    maxImageWidth: number;
    supportedExtensions: string;
}


/**
 * assigns undefined values
 */
function defaults<A, B>(a: A, ...b: B[]): A & B {
    b.filter(b => !!b).forEach(b => {
        Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
    });
    return <A & B>a;
}

export class Catalog {
    private ajax: Ajax;

    constructor(url: string) {
        this.ajax = new Ajax(url);
    }

    about(data?: any) {

        let req = defaults({
            f: "pjson"
        }, data);

        return this.ajax.jsonp<CatalogInfo>(req);
    }

    aboutFolder(folder: string) {

        let ajax = new Ajax(`${this.ajax.url}/${folder}`);
        let req = {
            f: "pjson"
        };

        return ajax.jsonp<CatalogInfo>(req);
    }

    aboutFeatureServer(name: string) {
        let ajax = new Ajax(`${this.ajax.url}/${name}/FeatureServer`);
        let req = {
            f: "pjson"
        };
        return defaults(ajax.jsonp<FeatureServerInfo>(req), { url: ajax.url });
    }

    aboutMapServer(name: string) {
        let ajax = new Ajax(`${this.ajax.url}/${name}/MapServer`);
        let req = {
            f: "pjson"
        };
        return defaults(ajax.jsonp<MapServerInfo>(req), { url: ajax.url });
    }

    aboutLayer(layer: number) {

        let ajax = new Ajax(`${this.ajax.url}/${layer}`);
        let req = {
            f: "pjson"
        };
        return ajax.jsonp<FeatureLayerInfo>(req);
    }

}