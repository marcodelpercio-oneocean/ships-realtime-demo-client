import { FeatureCollection } from "geojson";
import { ShipFeature } from './ship-feature.model';

export class ShipsFeatures implements FeatureCollection {
    type: "FeatureCollection";
    features: ShipFeature[];
    bbox?: import("geojson").BBox;

    constructor(shipsData : any[]) {
        this.type = "FeatureCollection";
        this.features = [];
        for (let shipPosition of shipsData) {
            this.features.push(new ShipFeature(shipPosition));
        }
    }

    findShipByImo(imoId  : number) : ShipFeature {
      for (const shipFeature of this.features) {
        if (shipFeature.id == imoId) {
          return shipFeature;
        }
      }
    }
}
