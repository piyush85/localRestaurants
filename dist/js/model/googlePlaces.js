(function(google,$){

    googleMapServices = function(){
        var el = arguments[1];
        this.options = arguments[0];
        this.map = this._getMap(el);
        this.places = this._getPlaces(this.map);

    };
    googleMapServices.prototype = {
        _getMap: function(el){
            return new google.maps.Map($("#" + el)[0], this.options);
        },
        _getPlaces: function(map){
            if(map){
                return new google.maps.places.PlacesService(this.map);
            }
        },
        //exposed API
        search: function(searchObj, cb, scope){
            this.places.search(searchObj, function(result, status){
                cb.call(scope, result, status);
            });
        }
    }

})(google,jQuery)
