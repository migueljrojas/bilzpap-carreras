'use strict';

var InstagramImages = function() {

    var imagesContainer = $('.home__concurso__images-group');

    var imagePages = [];
    var pageIndex = 0;
    var cargarMasButton = $('.home__concurso__cargar-mas');


    function getImages() {
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
                imagePages = _.chunk(images, 10);
                appendImages();
                cargarMasButton.removeClass('-disabled');
                return;
            }
        );
    }

    function appendImages() {
        if(pageIndex < imagePages.length) {
            var htmlStructure = imagePages[pageIndex].map(function(image, index) {
                var animationDelay = (Math.floor(Math.random() * 100) / 100);
    
                return (
                    $('<div class="col-xs-20 col-xs-offset-2 col-sm-12 col-sm-offset-0">'+
                        '<div data-wow-delay="' + animationDelay + 's" class="home__concurso__image wow fadeInUpBig">'+
                            '<img src="' + image + '"/>'+
                        '</div>'+
                    '</div>')
                )
            });
    
            imagesContainer.append(htmlStructure);
            pageIndex += 1;
            new WOW().init();
        } 
        
        if(pageIndex === imagePages.length) {
            cargarMasButton.hide();
        }
    }

    cargarMasButton.on('click', function(e) {
        e.preventDefault();
        appendImages();
    });

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
        console.log(data);
        return new Promise(function(resolve, reject) {
            resolve(
                Promise.all(data).then(function(values) {
                    var rawImagesArray = values.map(function(imageSet){
                        return imageSet.graphql.hashtag.edge_hashtag_to_media.edges;
                    });
                    var mergedImageArrays = [].concat.apply([], rawImagesArray);
                    var imageUrls = mergedImageArrays.map(function(image) {
                        return image.node.thumbnail_src;
                    });
                    return imageUrls;
                })
            )
        });
    }

    getImages();
}

module.exports = InstagramImages;
