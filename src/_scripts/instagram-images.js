'use strict';

var InstagramImages = function() {

    var imagesContainer = $('.home__concurso__images-group');

    function insertImages() {
        $.when(
            getInstagramDataFromHashtags(['ModoBilzyPap'])
        ).then(
            function(instagramResponse) {
                var processedImages = getImagesUrl(instagramResponse);
                console.log(instagramResponse);

                return processedImages;
            }
        ).done(
            function(images) {

                var htmlStructure = images.map(function(image, index) {
                    var animationDelay = (Math.floor(Math.random() * 100) / 100);

                    return (
                        $('<div class="col-xs-20 col-xs-offset-2 col-sm-12 col-sm-offset-0">'+
                            '<div data-wow-delay="' + animationDelay + 's" class="home__concurso__image wow fadeInUpBig">'+
                                '<img src="' + image + '"/>'+
                            '</div>'+
                        '</div>')
                    )
                });

                imagesContainer.html(htmlStructure);
                new WOW().init();
            }
        );
    }

    function getInstagramDataFromHashtags(hashtags){
        return new Promise(function(resolve, reject) {
            resolve(
                hashtags.map(function(hash, index){
                    return new Promise(function(resolve, reject) {
                        resolve(
                            $.get('https://www.instagram.com/explore/tags/'+ hash +'/?__a=1', function (data, status) {
                                return data;
                            })
                        );
                    })
                })
            );
        });
    }

    function getImagesUrl(data){
        return new Promise(function(resolve, reject) {
            resolve(
                Promise.all(data).then(function(values) {
                    var rawImagesArray = values.map(function(imageSet, ndex){
                        return imageSet.graphql.hashtag.edge_hashtag_to_media.edges;
                    });
                    var mergedImageArrays = [].concat.apply([], rawImagesArray);
                    var imageUrls = mergedImageArrays.map(function(image, index) {
                        return image.node.thumbnail_src;
                    });
                    return imageUrls;
                })
            )
        });
    }

    insertImages();
}

module.exports = InstagramImages;
