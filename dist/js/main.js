(function(google,$){
    var restaurants = function(){
        var myLatlng = new google.maps.LatLng(-33.8670522,151.1957362);
        var myOptions = {
            zoom: 15,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }, oThis = this;
        this.googleMap = new googleMapServices(myOptions,"map_canvas");
        this.markers = [];
        google.maps.event.addListener(this.googleMap.map, 'tilesloaded', function(){
           oThis.tilesLoaded();
        });
        eventInit.call(this);
    }
    restaurants.prototype = {
        tilesLoaded: function(){
            var map = this.googleMap.map;
            this.search();
            google.maps.event.clearListeners(map, 'tilesloaded');
            google.maps.event.addListener(map, 'zoom_changed', this.search);
            google.maps.event.addListener(map, 'dragend', this.search);
        },
        search: function(){
            var oThis = this;
            this.clearMarkersandResults();

            //timeout to wait to clear results
            if (this.searchTimeout) {
                window.clearTimeout(searchTimeout);
            }
            this.searchTimeout = window.setTimeout(function(){
                oThis.getMapData.call(oThis);
            }, 500);
        },
        clearMarkersandResults: function(){
            var markers = this.markers,
                centerMarker = this.centerMarker;

            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
            if (centerMarker) {
                centerMarker.setMap(null);
            }

            $("results").empty();
        },
        getMapData: function () {
        var sortBy = $("sortBy").val(),
            map = this.googleMap.map,
            places = this.googleMap.places,
            search = {
            types:["food"],
            keyword:"",
            name:"cruise"
            },
            oThis = this;


        if (sortBy == 'distance' && search.types) {
            search.rankBy = google.maps.places.RankBy.DISTANCE;
            search.location = map.getCenter();
            centerMarker = new google.maps.Marker({
                position: search.location,
                animation: google.maps.Animation.DROP,
                map: map
            });
        } else {
            search.bounds = map.getBounds();
        }

            this.googleMap.search(search, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var icon ='img/current_location.svg';
                    oThis.markers.push(new google.maps.Marker({
                        position: results[i].geometry.location,
                        animation: google.maps.Animation.DROP,
                        icon: icon
                    }));
                    google.maps.event.addListener(this.markers[i], 'mouseover', this.getDetails(results[i], i));
                    window.setTimeout(this.dropMarker.call(this,i), i * 100);
                    this.addResult(results[i], i);
                }
            }
        },this);
    },
    addResult: function (result, i) {

        var results = $('#results'),
            row = $('<div class="row"></div>'),
            col = $('<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 "></div>'),
            panel = $('<div class="panel panel-default"></div>'),
            iconTd = $("<div class='col-xs-12 col-sm-12 col-md-3 col-lg-3'><img src='"+result.photos[0].getUrl({maxWidth:100, maxHeight:100})+"' /></div>"),
            nameTd = $("<div class='col-xs-12 col-sm-12 col-md-6 col-lg-6'><h4>"+result.name+"</h4></div>");
        row.addClass(i% 2 == 0 ? 'even' : 'odd');

        panel.append(iconTd).append(nameTd);
        results.append(row.append(col.append(panel)));
    },
    dropMarker : function (i) {
        var oThis = this;
        return function() {
            if (oThis.markers[i]) {
                oThis.markers[i].setMap(oThis.googleMap.map);
            }
        }
    },
    getDetails : function (result, i) {
            var oThis = this;
        return function() {
            oThis.googleMap.places.getDetails({
                reference: result.reference
            }, oThis.showMarkerWindow.call(oThis,i));
        }
    },
    showMarkerWindow : function (i) {
        var oThis = this;
        return function(place, status) {
            if (oThis.iw) {
                oThis.iw.close();
                oThis.iw = null;
            }

            if (status == google.maps.places.PlacesServiceStatus.OK) {
                iw = new google.maps.InfoWindow({
                    content: oThis.getMWContent(place)
                });
                iw.open(oThis.googleMap.map, oThis.markers[i]);

                oThis.iw = iw;
            }
        }
    },
    getMWContent:function (place) {
        var content = '';
        content += '<table>';
        content += '<tr class="iw_table_row">';
        content += '<td style="text-align: right"><img class="hotelIcon" src="' + place.icon + '"/></td>';
        content += '<td><b><a href="' + place.url + '">' + place.name + '</a></b></td></tr>';
        content += '<tr class="iw_table_row"><td class="iw_attribute_name">Address:</td><td>' + place.vicinity + '</td></tr>';
        if (place.formatted_phone_number) {
            content += '<tr class="iw_table_row"><td class="iw_attribute_name">Telephone:</td><td>' + place.formatted_phone_number + '</td></tr>';
        }
        if (place.rating) {
            var ratingHtml = '';
            for (var i = 0; i < 5; i++) {
                if (place.rating < (i + 0.5)) {
                    ratingHtml += '&#10025;';
                } else {
                    ratingHtml += '&#10029;';
                }
            }
            content += '<tr class="iw_table_row"><td class="iw_attribute_name">Rating:</td><td><span id="rating">' + ratingHtml + '</span></td></tr>';
        }
        if (place.website) {
            var fullUrl = place.website,
                hostnameRegexp = new RegExp('^https?://.+?/'),
                website = hostnameRegexp.exec(place.website);
            if (website == null) {
                website = 'http://' + place.website + '/';
                fullUrl = website;
            }
            content += '<tr class="iw_table_row"><td class="iw_attribute_name">Website:</td><td><a href="' + fullUrl + '">' + website + '</a></td></tr>';
        }
        content += '</table>';
        return content;
    }
}


    google.maps.event.addDomListener(window, 'load', new restaurants());
})(google,jQuery)


