define(['jquery', 'backbone', 'templates/jst', 'views/elements/searchBar'],
    function($, Backbone, tmplts, searchBarViewEl){
    var searchView = Backbone.View.extend({
        el: "#content",
        resultsEl: null,
        eventType: 'click', // 'touchstart',

        loadResultsSet: function() {
            $('.table > div > div > div').unbind(this.eventType);

            this.resultsEl.append(JST['src/js/templates/elements/searchResultsGroup.html']({
                selects: [{
                    id: 1,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt-large.jpg',
                    price: '$1,200 - 2,350'
                },{
                    id: 1,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt-large.jpg',
                    price: '$1,200 - 2,350'
                }],
                properties: [{
                    id: 3,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt.jpg'
                },{
                    id: 2,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt-2.jpg'
                },{
                    id: 3,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt.jpg'
                },{
                    id: 2,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt-2.jpg'
                },{
                    id: 3,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt.jpg'
                },{
                    id: 2,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt-2.jpg'
                },{
                    id: 3,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt.jpg'
                },{
                    id: 2,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt-2.jpg'
                },{
                    id: 3,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt.jpg'
                },{
                    id: 2,
                    name: 'Apartment Name',
                    location: 'City, St',
                    type: 'Studio - 3 Beds',
                    img: '/img/apt-2.jpg'
                }]
            }));

            this.setPropertyClickEvents();
            searchBarViewEl.renderToHeader();
        },

        /**
         * Handle what happens when a property is touched/clicked.
         * @propertyId - Integer value.
         */
        onPropertyClick: function(propertyId) {
            if(!!(window.history && window.history.pushState)) {
                appRouter.navigate('/properties/'+ propertyId, {
                    trigger: true,
                    replace: true
                });
            } else {
                location.href = '/properties/'+propertyId;
            }
        },

        /**
         * Render the search results view.
         * Load the first 10 results.
         */
        render: function(){
            this.$el.html(JST['src/js/templates/layouts/search.html']());
            this.$el.attr("class", "search");

            this.resultsEl = $(document.getElementById('results'));
            this.loadResultsSet();
            this.setInfiniteScrolling();
        },

        /**
         * Set the infinite scrolling so that results continue to load as the user swipes
         * down the screen.
         */
        setInfiniteScrolling: function() {
            _this = this;
            $(window).scroll(function(){
                if($(window).scrollTop() >= ($(document).height() - $(window).height() - 600)) {
                    _this.loadResultsSet();
                }
            });
        },

        /**
         * Make each property touchable.
         */
        setPropertyClickEvents: function() {
            var _this = this;
            $('.table > div > div > div').bind(this.eventType, function() {
                var propertyId = $(this).attr('property');
                if(propertyId !== 'undefined' && propertyId !== false) {
                    _this.onPropertyClick(parseInt(propertyId));
                }
            });
        }
    });
    
    return new searchView();
});