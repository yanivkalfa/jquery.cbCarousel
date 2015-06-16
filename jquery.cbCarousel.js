/**
 * jQuery carousel script
 * @author Constantin Boiangiu
 * @copyright Constantin Boiangiu
 *
 * @url http://www.constantinb.com/cfd_download/jquery-responsive-carousel/
 * @version 1.0
 */

;(function($){

    $.fn.CB_CarouseljQ = function(options){
        if (this.length > 1){
            this.each(function() {
                $(this).CB_CarouseljQ(options);
            });
            return this;
        }
        // defaults
        var defaultOptions = {
            visibleItems : 10,
            navs :{
                'back'	: '.nav-back',
                'fwd'	: '.nav-fwd'
            },
            cycle		: true,
            opacityIdle : .7,
            opacityOn	: 1,
            opacityOver : .8,
            animateNavs : true,
            threshold	: -15,

            // callbacks
            init 		: function(){},
            change 		: function(){},
            navClick 	: function(){}
        };

        // merge user options with defaults
        var options 		= $.extend({}, defaultOptions, options),
            self 			= this,
            outerContainer 	= $(this).find('.galleryContainer'),
            container		= $(this).find('.gallery-thumbnails'), // items container
            items 			= $(this).find('.item'), // all items
            totalItems 		= items.length,
            containerWidth	= 0,
            correction		= 0;

        if( 0 == options.visibleItems ){
            options.visibleItems = totalItems;
        }

        // reset visibleItems parameter to number of items if option exceeds total items
        if( options.visibleItems >= totalItems ){
            options.visibleItems = totalItems;
        }
        // set some more vars
        var	vItems 			= options.visibleItems, // number of visible items stored from options
            itemWidth		= $(items[0]).outerWidth(), // single item width
            current			= 0; // store current element, default is 0

        // initialize plugin
        var initialize = function( firstTime ){

            makeCalculations(firstTime);

            // runs only on initial init
            if( firstTime ){
                // let the dogs out
                $.each(items, function(i, item){
                    if( current == i ){
                        $(this).addClass('active').css({'opacity' : options.opacityOn});
                    }else{
                        $(this).css({'opacity' : options.opacityIdle});
                    }
                    var pos = $(this).position();
                    $(this).data('pos', pos);
                });

                $(items).click(function(e){
                    e.stopPropagation();
                    var index = $.inArray(this, items);
                    animateIndex(index);
                }).mouseenter(function(e){
                    if( !$(this).hasClass('active') ){
                        $(this).stop().animate({'opacity' : options.opacityOver}, {queue: false, duration:200});
                    }
                }).mouseleave(function(e){
                    if( !$(this).hasClass('active') ){
                        $(this).stop().animate({'opacity' : options.opacityIdle}, {queue: false, duration:200});
                    }
                });
                // set sideways navigation
                setSideNavs();

                $(window).resize( function(){
                    resetCarousel();
                } );

                // init event
                options.init.call(self, {});
            }

            return this;
        };

        var makeCalculations = function(firstTime){
            // check if visible items exceeds container element width
            resetCarousel(firstTime);
            // calculate the container width
            containerWidth 	= vItems * itemWidth; // container width based on number of visible items
            // put width on items container and make it pos absolute
            $(self).css({
                'width' : containerWidth
            });
            $(outerContainer).css({
                'width' : containerWidth
            });

            // calculate the correction to keep main element in the middle
            correction = Math.ceil( vItems/2.0001 ) - ( vItems == 0 ? 0 :  1 );
        }

        var resetCarousel = function(firstTime){
            var parentWidth	= $(self).parent().outerWidth();
            if( 0 == containerWidth ){
                containerWidth = vItems * itemWidth;
            }
            $(self).css({'display':'block'});
            if( containerWidth + options.threshold  > parentWidth ){
                var newItems = vItems - 1,
                    newWidth = newItems * itemWidth;

                for( var t = newItems; t >= 1; t-- ){
                    if( newWidth + options.threshold < parentWidth || t == 1 ){
                        vItems = t;
                        containerWidth = newWidth;
                        break;
                    }else{
                        newWidth-=itemWidth;
                    }
                }
                // if not even one element can be fitted, hide the carousel and bail out
                if( 0 == newWidth ){
                    $(self).css({'display':'none'});
                    return;
                }

                makeCalculations();
                if( !firstTime )
                    animateIndex(current, true);

            }else if( containerWidth + options.threshold < parentWidth && vItems < options.visibleItems ){
                if( parentWidth - containerWidth < itemWidth ){
                    return;
                }

                var extraItems = Math.floor( (parentWidth - (containerWidth + options.threshold  ))/itemWidth );
                if( extraItems < 1 ){
                    return;
                }
                vItems += extraItems;
                if( vItems > options.visibleItems ){
                    vItems = options.visibleItems;
                }

                containerWidth = vItems * itemWidth;
                makeCalculations();
                animateIndex(current, true);
            }
        }

        var animateIndex = function( index, force ){
            if( current == index && !force ){
                return;
            }
            // if only 2 visible items, when going backwards we want the active element to stay on the right and not on the left
            // this solves the issue by modifying the correction
            var calcCorrection = 2 == vItems && index < current ? 1 : correction;

            /* slide to element */
            var navTo = index - calcCorrection < 0 ? 0 : index - calcCorrection;
            var firstLast = totalItems - vItems;
            if( navTo > firstLast ){
                navTo = firstLast;
            }

            var pos = $(items[navTo]).data('pos');
            $(container).stop().animate({
                'margin-left' : - pos.left
            },{
                queue: false,
                duration: 300
            });
            current = index;
            $(items).removeClass('active').css({'opacity' : options.opacityIdle});
            $(items[current]).addClass('active').css({'opacity' : options.opacityOn});
            sideNavsEnd();
            //slide change event
            options.change.call(self, {'index' : index}, $(items[current]));
        }

        var sideNavsEnd = function(){
            if( options.cycle ){
                return;
            }

            var navBack	= $(self).find(options.navs.back), // backwards navigation element
                navFwd	= $(self).find(options.navs.fwd),
                elem 	= false; // forward navigation element

            $(navBack).removeClass('end');
            $(navFwd).removeClass('end');

            if( current == 0 ){
                $(navBack).addClass('end');
            }else if( current == totalItems -1 ){
                $(navFwd).addClass('end');
            }
        }

        var setSideNavs = function(){

            var navBack	= $(self).find(options.navs.back), // backwards navigation element
                navFwd	= $(self).find(options.navs.fwd); // forward navigation element

            if( !options.cycle ){
                if( 0 == current ){
                    $(navBack).addClass('end');
                }else if( current == totalItems -1 ){
                    $(navFwd).addClass('end');
                }
            }

            // navigation interaction
            $(navBack).click(function(e){
                e.preventDefault();
                var resetVal = options.cycle ? totalItems - 1 : 0,
                    index = current - 1 < 0 ? resetVal : current - 1;

                if( !options.cycle  ){
                    if( index == 0 ){
                        $(this).addClass('end');
                    }else{
                        $(this).removeClass('end');
                    }
                    $(navFwd).removeClass('end');
                }

                animateIndex(index);
                options.navClick.call(self, {'index':index, 'direction':-1});
            });

            $(navFwd).click(function(e){
                e.preventDefault();
                var resetVal = options.cycle ? 0 : totalItems - 1;
                index = current + 1 > totalItems -1 ? resetVal : current + 1;

                if( !options.cycle  ){
                    if( index == totalItems - 1 ){
                        $(this).addClass('end');
                    }else{
                        $(this).removeClass('end');
                    }
                    $(navBack).removeClass('end');
                }

                animateIndex(index);
                options.navClick.call(self, {'index':index, 'direction':1});
            });

            if( !options.animateNavs ){
                return;
            }

            $(navBack).css({'opacity':0, 'left':-50});
            $(navFwd).css({'opacity':0, 'right':-50});

            // carousel hover shows/hides navigation
            if (options.visibleItems != totalItems){
                $(self).mouseenter(function(){
                    $(navBack).stop().animate({'opacity':1, 'left' : 2},{queue:false, duration:200});
                    $(navFwd).stop().animate({'opacity':1, 'right' : 2},{queue:false, duration:200});
                }).mouseleave(function(){
                    $(navBack).stop().animate({'opacity':0, 'left' : -50},{queue:false, duration:200});
                    $(navFwd).stop().animate({'opacity':0, 'right' : -50},{queue:false, duration:200});
                })
            }
        }

        this.gotoIndex = function( index ){
            animateIndex(index);
        }

        return initialize(true);
    }

})(jQuery);
