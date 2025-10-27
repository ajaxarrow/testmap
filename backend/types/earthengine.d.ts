// Type declarations for @google/earthengine
declare module '@google/earthengine' {
  export interface Geometry {
    (geometry: any): any;
  }

  export interface Filter {
    listContains(property: string, value: any): any;
    eq(property: string, value: any): any;
  }

  export interface ImageCollection {
    (collectionId: string): ImageCollection;
    filterBounds(geometry: any): ImageCollection;
    filterDate(startDate: string, endDate: string): ImageCollection;
    filter(filter: any): ImageCollection;
    select(bands: string | string[]): ImageCollection;
    median(): Image;
  }

  export interface Image {
    lt(threshold: number): Image;
    selfMask(): Image;
    reduceToVectors(options: {
      geometry?: any;
      scale?: number;
      geometryType?: string;
      eightConnected?: boolean;
      labelProperty?: string;
      maxPixels?: number;
    }): FeatureCollection;
  }

  export interface FeatureCollection {
    evaluate(callback: (result: any, error?: any) => void): void;
  }

  export interface EarthEngineData {
    authenticateViaPrivateKey(
      privateKey: any,
      onSuccess: () => void,
      onError?: (error: any) => void
    ): void;
  }

  export function initialize(
    opt_baseurl?: string | null,
    opt_tileurl?: string | null,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ): void;

  export const Geometry: Geometry;
  export const Filter: Filter;
  export const ImageCollection: ImageCollection;
  export const data: EarthEngineData;

  const ee: {
    Geometry: Geometry;
    Filter: Filter;
    ImageCollection: ImageCollection;
    data: EarthEngineData;
    initialize: typeof initialize;
  };

  export default ee;
}