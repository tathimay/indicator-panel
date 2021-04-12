var mainMap={
    map:null,
    geojson:null,

    init:()=>{
        mainMap.map = L.map('mainmap').setView([-23, -45], 8);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v9',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(mainMap.map);

        mainMap.addInfoControl();
        mainMap.addAttribution();
        mainMap.loadGeojson();
        mainMap.addLegend();
    },

    // control that shows state info on hover
    addInfoControl:()=>{
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = '<h4>Índice de Vulnerabilidade Metropolitana à COVID-19</h4>' +  (props ?
                '<b>' + props.nm + '</b><br />' + props.density + 'índice (entre 0 e 1)'
                : 'passe o mause sobre os município');
        };

        info.addTo(mainMap.map);
    },


    // get color depending on population density value
    getColor:(d)=>{
        return d > 1000 ? '#800026' :
                d > 500  ? '#BD0026' :
                d > 200  ? '#E31A1C' :
                d > 100  ? '#FC4E2A' :
                d > 50   ? '#FD8D3C' :
                d > 20   ? '#FEB24C' :
                d > 10   ? '#FED976' :
                            '#FFEDA0';
    },

    style:(feature)=>{
        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: mainMap.getColor(feature.properties.density)
        };
    },

    highlightFeature:(e)=>{
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    },

    resetHighlight:(e)=>{
        mainMap.geojson.resetStyle(e.target);
        info.update();
    },

    zoomToFeature:(e)=>{
        mainMap.map.fitBounds(e.target.getBounds());
    },

    onEachFeature:(feature, layer)=>{
        layer.on({
            mouseover: mainMap.highlightFeature,
            mouseout: mainMap.resetHighlight,
            click: mainMap.zoomToFeature
        });
    },

    loadGeojson: async ()=>{
        const response = await fetch("data/rm-vale.geojson");
        const data = await response.json();
        mainMap.geojson = L.geoJson(data, {
            style: mainMap.style,
            onEachFeature: mainMap.onEachFeature
        }).addTo(mainMap.map);
    },

    addAttribution:()=>{
        mainMap.map.attributionControl.addAttribution('IVM-COVID-19 &copy; <a href="http://www.inpe.br/">INPE</a>');
    },

    addLegend:()=>{
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                labels = [],
                from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + mainMap.getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(mainMap.map);
    }
};