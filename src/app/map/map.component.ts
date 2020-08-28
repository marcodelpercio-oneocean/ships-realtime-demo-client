import { environment } from '../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { map, tap, catchError, retry } from 'rxjs/operators';
import * as mapboxgl from 'mapbox-gl';
import { VesselsPositionService } from '../vessels-position.service';
import { ShipsFeatures } from '../ships-features.model';
import { ShipFeature } from '../ship-feature.model';
import { ShipsLayer } from '../ships-layer.model';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('shipmarker') shipmarker : ElementRef;
  map: mapboxgl.Map;
  private shipsFeatures : ShipsFeatures;
  private shipsPopups : { [imo: string] : mapboxgl.Popup } = {};

  constructor(private positionService : VesselsPositionService) {

  }

  /** Builds the Mapbox Map instance on init */
  ngOnInit(): void {
    this.buildMap();
  }

  /**
   * After this component is rendered we initialize some map properties/listeners
   * and connect to the Rxjs Websocket
   */
  ngAfterViewInit() {
      this.initMap();
      this.positionService.connect();
  }

  /** Updates the vessels data source with new data and triggers an update for any open popup */
  private updateShipsData(newData) {
     this.shipsFeatures = new ShipsFeatures(newData);
     (<mapboxgl.GeoJSONSource> this.map.getSource('ships')).setData(this.shipsFeatures);
     this.updateAllPopups();
  }

  /** Builds the actual Mapbox Map instance */
  private buildMap() {
    this.map = new mapboxgl.Map({
        accessToken: environment.mapbox.accessToken,
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 2
    });
  }

  /** Initialization of the vessels layer/source and other event-listeners (such as for popups) */
  private initMap() {
    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', (mapLoadEvent) => {

        this.map.addImage('shipmarker', this.shipmarker.nativeElement);
        this.map.addSource("ships", {
                                      type: "geojson",
                                      data: {  type: 'FeatureCollection',  features: []  }
                                    });

        this.map.addLayer(new ShipsLayer());
    });
    this.map.on('sourcedata', this.onShipsSourceLoaded);
    // Change the cursor to a pointer when the mouse is over the ships layer.
    this.map.on('mouseenter', 'ships', () => {
          this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'ships', () => {
      this.map.getCanvas().style.cursor = '';
    });
    this.map.on('click', 'ships', this.onShipClicked);
  }

  /** Starts subscription to the Rxjs Websocket only after the vessels source has loaded */
  private onShipsSourceLoaded = (e: mapboxgl.EventData): void => {
      if (e && e.dataType === 'source' && e.sourceId === 'ships' && e.isSourceLoaded) {
          console.log("Source 'ships' is now loaded");
          this.map.off('sourcedata', this.onShipsSourceLoaded); //Unbind event here
          /** Rxjs websocket */
          this.positionService.proxy$.subscribe({
            next: (msgData) => {
                                   console.log("Received vessels data...");
                                   this.updateShipsData(msgData);
                               }
          });
          console.log("Subscribing now to websocket messages");

      }
  }

  /** Event handler for clicking on a ship. Triggers popup opening */
  private onShipClicked = (e: mapboxgl.EventData): void => {
    if (e && e.type === 'click' && e.features && e.features[0].source == 'ships') {
        this.openShipPopup(e.features[0].id);
    }
  }

  /** Opens a popup with ship details */
  openShipPopup(imoId : number) {
    const imoKey = String(imoId);
    if (! (imoKey in this.shipsPopups)) {
      this.shipsPopups[imoKey] = new mapboxgl.Popup({closeOnClick : false, closeOnMove: false, offset: 5});
      this.shipsPopups[imoKey].addTo(this.map);
    }

    this.updateShipPopup(imoKey);
  }

  /** Updates the location and content of an existing ship popup */
  updateShipPopup(imoKey : string) {
    if (imoKey in this.shipsPopups) {
      const shipFeature : ShipFeature = this.shipsFeatures.findShipByImo(+imoKey);
      if (shipFeature) {
        this.shipsPopups[imoKey].setLngLat(shipFeature.getLngLat());
        this.shipsPopups[imoKey].setHTML(shipFeature.getPopupContent());
      }
    }
  }

  /** Runs an update for all the popups currently open */
  updateAllPopups() : void {
    for (const imoId in this.shipsPopups) {
      this.updateShipPopup(imoId);
    }
  }

}
