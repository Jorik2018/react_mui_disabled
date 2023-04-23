import { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { transform } from 'ol/proj'
import { useDispatch } from "react-redux";
import { useResize } from 'gra-react-utils';
import { TileWMS as _TileWMS, ImageWMS as _ImageWMS, OSM } from 'ol/source';
import { Tile as _Tile, Image as _Image } from 'ol/layer';
import * as proj from 'ol/proj';

import 'ol/ol.css';

const MapPanel = (props) => {

  const mapElement:any = useRef()

  const [map, setMap]:any = useState()

  useResize(({width, height}:any) => {
   
    if (mapElement.current) {
      //console.log('resize map2 h='+height);
      const header:any = document.querySelector('.MuiToolbar-root');
      const body:any = mapElement.current;
      const nav:any = document.querySelector('nav');
      header.children[0].style.marginLeft =  nav.offsetWidth+ 'px';
      body.style.height = height+ 'px';
      body.style.maxWidth = width + 'px';
      body.style.width = width + 'px';
      if (map)setTimeout(()=> { map.updateSize(); }, 200);
    }
  },mapElement);

  const dispatch = useDispatch();

  const [featuresLayer, setFeaturesLayer]:any = useState()

  //const [selectedCoord, setSelectedCoord] = useState()

  const mapRef:any = useRef()

  mapRef.current = map

  useEffect(() => {
    if (mapElement.current.children.length == 0) {
      console.log('mounted');
      const initalFeaturesLayer = new VectorLayer({
        source: new VectorSource()
      })
      const initialMap:any = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),

          initalFeaturesLayer

        ],
        view: new View({
          projection: 'EPSG:3857',
          center: proj.transform([-77.5275351,-9.4871398], 'EPSG:4326', 'EPSG:3857'),
          zoom: 8
        }),
        controls: []
      })
      initialMap.on('click', handleMapClick)
      //
      //console.log(el);
      //se ejecuta cada vez q se dibuja el mapa
      /*initialMap.on('rendercomplete', () => {
        if(!initialMap.resized){
          el.dispatchEvent(new Event('parentResize'));
          initialMap.resized=1;
        }
      })*/
      //el.dispatchEvent(new Event('parentResize'));
      console.log('initial map');
      setMap(initialMap)
      setFeaturesLayer(initalFeaturesLayer)

      var oLayer = _Tile;
      var source = _TileWMS;

      /*if (la[j].type == "I") {
        oLayer = _Image;
        source = _ImageWMS;
      }*/


      [
        
        {label: 'Distritos', address: 'dremh:DISTRITO', visible: true},
        {address: 'gra:disabled', visible: true}
      ].forEach((layer)=>{ 
        var dd = layer.address.split(":");
        var par = {
          LAYERS: layer.address,
          TILED: true,
        };
        var l = new oLayer({
          source: new source({
            url: //me.baseURL 
              'http://web.regionancash.gob.pe'
              + "/geoserver/" + dd[0] + "/wms",
            params: par,
            serverType: "geoserver",
            // Countries have transparency, so do not fade tiles:
            transition: 0,
          }),
        });
  
        initialMap.addLayer(l);
      });




    }
    dispatch({ type: 'title', title: 'Mapa' });
  }, [])

  useEffect(() => {

    if ((props.features || []).length) { // may be null on first render
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )
      map.getView().fit(featuresLayer.getSource().getExtent(), {
        padding: [100, 100, 100, 100]
      })

    }

  }, [props.features])

  // map click handler
  const handleMapClick = (event:any) => {

    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    //setSelectedCoord(transormedCoord)

    console.log(transormedCoord)

  }

  

  return <>
    <div ref={mapElement} style={{width:10,height:10}} className="map-container"></div>
  </>;

}

export default MapPanel;