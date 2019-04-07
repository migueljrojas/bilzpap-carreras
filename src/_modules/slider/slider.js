'use strict';

// Constructor
var Slider = function() {
    var slider = $('._slider');
    var sliderMulti = $('._slidermulti');

    if (slider) {
        slider.each(function(){
            $(this).slick({
                dots: true,
                fade: true,
                arrows: true,
                autoplay: true
            });
        });
    }

    if (sliderMulti) {
        sliderMulti.each(function(){
            $(this).slick({
                dots: false,
                infinite: true,
                speed: 300,
                slidesToShow: 2,
                slidesToScroll: 2,
                arrows: true,
                autoplay: true,
                responsive: [
                    {
                        breakpoint: 900,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            centerMode: false,
                            slidesToShow: 1,
                            arrows: true,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        });
    }
};

module.exports = Slider;
