import { Layer, AnyLayout, AnyPaint } from "mapbox-gl";

export class ShipsLayer implements Layer {
  id: string;
  type?: "symbol" | "fill" | "line" | "circle" | "fill-extrusion" | "raster" | "background" | "heatmap" | "hillshade";
  metadata?: any;
  ref?: string;
  source?: string | import("mapbox-gl").GeoJSONSourceRaw | import("mapbox-gl").VideoSourceRaw | import("mapbox-gl").ImageSourceRaw | import("mapbox-gl").CanvasSourceRaw | import("mapbox-gl").VectorSource | import("mapbox-gl").RasterSource | import("mapbox-gl").RasterDemSource;
  minzoom?: number;
  maxzoom?: number;
  interactive?: boolean;
  filter?: any[];
  layout?: AnyLayout;
  paint?: AnyPaint;

  constructor() {
      this.id = 'ships';
      this.type = 'symbol';
      this.source = 'ships';
      this.layout = {
        'text-field': ['get', 'name'],
        'text-variable-anchor': ['top'],
        'text-radial-offset': 0.95,
        'text-size': 10,
        'icon-image': 'shipmarker',
        'icon-allow-overlap' : true,
        'text-optional': true,
        'text-allow-overlap': false,
        'icon-size': 0.6,
        'icon-rotate': ['get', 'course']
      };
      this.paint = {
        'text-color': "#000",
        'text-halo-color': "#fff",
        'text-halo-width': 1.5
     };
  }

}
