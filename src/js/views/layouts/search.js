define(['jquery', 'backbone', 'templates/jst', 'views/elements/searchBar', 'tools/navigate', 'tools/data', 'models/listing','collections/listings'],
    function($, Backbone, tmplts, searchBarViewEl, Navigate, Data, ListingModel, ListingCollection){
    var searchView = Backbone.View.extend({
        el: "#content",
        resultsEl: null,
        contentHeight: 0,
        map: null,
        mapCanvas: $('#map-canvas'),
        userAddressTerms: null,
        propertyIndex: null,
        userZip: null,
        userState: null,
        userCity: null,

        getLocationFromZip: function(address){
            //
        },

        centerOnPinGroup: function(pins){
            var bounds = new Microsoft.Maps.LocationRect.fromLocations(pins);

            //Set map bounds
            this.map.setView({
                bounds: bounds
            });
        },

        initializeMap: function(listings) {
            /**
             *  TODO: Get Lat/Lng from zip or address and
             *  pass to the mapOptions
             */
            var mapOptions = {
                credentials:"AlnGUafJim9K7OtP3Ximx2ZgbtPPLJ954ctxyPBDVZs_iBiBfF57NBrP4Y3aM2tW",
                mapTypeId: Microsoft.Maps.MapTypeId.road,
                zoom: 15,
                showScalebar: false
            };
            this.map = new Microsoft.Maps.Map(document.getElementById("map-canvas"), mapOptions);

            var _this = this;
            Microsoft.Maps.loadModule('Microsoft.Maps.Search', { callback: function(){
                var zip = decodeURIComponent(location.pathname.split('search/')[1]);
                var search = new Microsoft.Maps.Search.SearchManager(_this.map);
                search.geocode({where:zip, count:10, callback:geocodeCallback});
                function geocodeCallback(geocodeResult, userData)
                {
                    var locs = [],
                        pinHTML,
                        currentLocation = geocodeResult.results[0].location;

                    $.each(listings.models, function(i, listing){
                        var location = new Microsoft.Maps.Location(listing.attributes.lat, listing.attributes.lng);
                        if(i === 0 || i === 1){
                                pinHTML = JST['src/js/templates/elements/pmarker.html']({
                                image_src: listing.attributes.primaryImage,
                                count: '5'
                            });
                        }
                        else{
                                pinHTML = JST['src/js/templates/elements/marker.html']({
                                count: '1'
                            });
                        }
                        var pinOptions = {width: null, height: null, htmlContent: pinHTML}; 
                        var pin = new Microsoft.Maps.Pushpin(location, pinOptions);
                        _this.map.entities.push(pin);
                        locs.push(location);
                    });

                    //Get bounding box from group of pins
                    _this.centerOnPinGroup(locs);
                }
             } 
            });
        },

        loadResultsSet: function() {
            var _this = this;
            this.propertyIndex += (this.propertyIndex === null) ? 0 : 1;
            $('.table > div > div > div').unbind(touchEventType);
            this.resultsEl.append(JST['src/js/templates/elements/searchResultsGroup.html']({
                startIndex: this.propertyIndex,
                numBlocksToPrint: 2,          //Change this based or layout options
                numPropertiesToPrint: 4,       //Change this based or layout options
                selects: _this.listings.slice(0,2),
                properties: _this.listings.slice(2,8),
                listings: _this.listings
            }));

            this.setPropertyClickEvents();
        },

        /**
         *  Hanldle click on Current Location button
         *
         */
        currentLocationClicked: function(){
            this.setUserLocation();
        },

        /**
         * Handle what happens when a property is touched/clicked.
         * @propertyId - Integer value.
         */
        onPropertyClick: function(propertyId) {
            Navigate.toUrl('/properties/'+propertyId);
        },

        /**
         * Render the search results view.
         * Load the first 10 results.
         */
        render: function(){
            var _this = this;
            this.userZip = decodeURIComponent(location.pathname.split('search/')[1]);
            this.listings = new ListingCollection();
            this.listings.fetch({
                data: $.param({ 
                    zip: _this.userZip,
                    city: _this.userCity,
                    state: _this.userState,
                }),
                success: function(response){
                    //Load listings in list view
                    _this.loadResultsSet();

                    //Initialize map with listings and 
                    //center on the group
                    _this.initializeMap(_this.listings);
                }
            });

            this.setKeywords();
            this.$el.html(JST['src/js/templates/layouts/search.html']());
            this.$el.attr("class", "search");

            //Check for "Show Map" setting
            this.$el.addClass('showMap');
            this.mapCanvas.addClass('showMap');

            //Toggle browse/split-map view
            $('#currentLocationButton').click(function(){
                _this.currentLocationClicked();
            });

            //Check for orientation
            window.addEventListener("orientationchange", function() {
                this.setContentDimensions();
            }, false);

            this.resultsEl = $(document.getElementById('results'));
            this.setInfiniteScrolling();
            this.setResizeEvent();
            this.setContentDimensions();
            searchBarViewEl.renderToHeader();
        },

        /**
         * Set the content height for this page.
         */
        setContentDimensions: function() {
            this.contentHeight = $(window).height();

            if (navigator.userAgent.match(/iPod|iPhone|iPad/i) &&
                navigator.userAgent.match(/Safari/i) && !(navigator.userAgent.match(/Chrome/i) ||
                    navigator.userAgent.match(/CriOS/i))) {
                this.contentHeight -= 30;
            }

            if($(window).width() <= 768 || window.orientation === 0 || window.orientation === 180){
                this.$el.addClass('portrait');
                this.mapCanvas.addClass('portrait');

                //If Portrait, the height is set by percentage,
                //so we need to clear out the inline css text
                this.$el.css('cssText', '');
                this.mapCanvas.css('cssText', '');
            }
            else{
                this.$el.removeClass('portrait');
                this.mapCanvas.removeClass('portrait');

                //If Landscape, set height by window height
                this.mapCanvas.css('height', (this.contentHeight - 45) + "px");
                this.$el.css('height', this.contentHeight + "px");
            }
        },

        /**
         * Set the infinite scrolling so that results continue to load as the user swipes
         * down the screen.
         */
        setInfiniteScrolling: function() {
            _this = this;
            $(window).scroll(function(){
                if($(window).scrollTop() >= ($(document).height() - $(window).height() - 600)) {

                    //TODO: Make another API call before loading the results again
                    _this.loadResultsSet();
                }
            });
        },

        /**
         * Get the keywords based on the url.
         * First make sure user did a proper search.
         */
        setKeywords: function() {
            if(!/^\/search\/[a-z,A-Z,0-9, ,\,,\',\-,\%,\&,\;]+$/i.test(location.pathname)) {
                Navigate.toUrl('/');          
            }

            searchBarViewEl.setKeywords(decodeURIComponent(location.pathname.split('search/')[1]));
        },

        /**
         * Make each property touchable.
         */
        setPropertyClickEvents: function() {
            var _this = this;
            $('.basic').bind(touchEventType, function() {
                $(this).find('div.element').toggleClass('flip');
                // var propertyId = $(this).attr('property');
                // if(propertyId !== 'undefined' && propertyId !== false) {
                //     _this.onPropertyClick(parseInt(propertyId));
                // }
            });
        },

        /**
         * If the screen is resized, make sure we perform a relayout.
         */
        setResizeEvent: function() {
            var _this = this;
            var resizeTimeout = null;
            $(window).resize(function() {
                if (resizeTimeout !== null) {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = null;
                }

                resizeTimeout = setTimeout(function() {
                    _this.setContentDimensions();
                }, 250);
            });
        },

        setUserLocation: function(){
            console.log('Show Loader');
            var _this = this;
            //First, check for geolocation capability
            if (navigator.geolocation) {
                browserSupportFlag = true;
                navigator.geolocation.getCurrentPosition(function(position) {
                    console.log('Hide Loader ', position);
                }, function() {
                    console.log('No Location Allowed/Found');
                });
            }
            // Browser doesn't support Geolocation
            else {
                console.log('Browser Doesn\'t Support Geolocation');
            }
        }
    });
    
    return new searchView();
});