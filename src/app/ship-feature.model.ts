import { Feature, Point } from "geojson";

export class ShipFeature implements Feature {
    type: "Feature";
    geometry: Point;
    id?: string | number;
    properties: { [name: string]: any; };
    bbox?: import("geojson").BBox;

    constructor(shipPosition : {
                                  name: string,
                                  imo: number,
                                  longitude: number,
                                  latitude: number,
                                  speed: number,
                                  draught: number,
                                  course: number,
                                  navStatus: string
                               }) {
        this.id = shipPosition.imo;
        this.geometry = {
          type: 'Point',
          coordinates: [shipPosition.longitude, shipPosition.latitude]
        }
        this.properties = {};
        this.properties = {...shipPosition};
    }

    getLngLat() : {lng : number, lat : number} {
        return {lng: this.properties.longitude, lat: this.properties.latitude};
    }

    getPopupContent() : string {
        return `<div><strong>${this.properties.name}</strong> &nbsp;&nbsp; IMO: ${this.properties.imo}</div>
                <div>
                      <strong>Lon.</strong>: ${this.properties.longitude} &nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Lat.</strong>: ${this.properties.latitude}
                </div>
                <div>
                      <strong>Speed:</strong> ${this.properties.speed.toFixed(2)} kn &nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Course:</strong> ${this.properties.course.toFixed(2)}&deg;
                </div>
                <div>${this.properties.navStatus}</div>`;
    }

}
