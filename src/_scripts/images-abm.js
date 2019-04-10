'use strict';

var ImagesAbm = function() {

    function validateLogin() {
        var passEntered = $('#input-password').val();
        var password="VTR35L00L4";

        if (passEntered === password) {
            $('#login-form').remove();
            updateDatabaseWithLatestImages();
        } else {
            alert('Password Incorrecto');
        }
    }

    $('#login-button').on('click', validateLogin);

    function updateDatabaseWithLatestImages() {
        $.when(
            getInstagramDataFromHashtags(['ModoBilzyPap'])
        ).then(
            function(instagramResponse) {
                var processedImages = getImagesUrl(instagramResponse);

                return processedImages;
            }
        ).done(function(images) {
            storeImagesInDatabase(images);
        });
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

    function storeImagesInDatabase(images) {
        console.log('storing in database');
        $.ajax({
            type: "POST",
            url: './store-images.php',
            data: {imagesArray: images}
        }).done(function(response) {
            console.log('success AJAX', response);
            if(response === 'success') {
                $('#loadimages').removeAttr('disabled');
            }
        }).fail(function(response) {
            console.log(response);
        });
    }

    $('#loadimages').on('click', function(e){
        e.preventDefault();
        $(this).attr('disabled', true);

        $('.vtr-playstage-abm__form').removeClass('-hidden');

        $.when(
            getImagesFromDatabase()
        ).done(function(data) {
            var imagesInDatabase = JSON.parse(data);

            $('.vtr-playstage-abm__form__loader').hide();

            var formFieldSet = imagesInDatabase.map(function(imageItem,index){

                //while(index < 5) {

                    var imageUrl = imageItem[0];
                    var imageId = imageItem[1];

                    return(
                        $('<div class="vtr-playstage-abm__form__group">'+
                            '<div class="vtr-playstage-abm__form__group__image"><img src="' + imageUrl + '" /></div>'+
                            '<div class="vtr-playstage-abm__form__group__fields">'+
                                '<input type="hidden" class="id-input" name="id-'+ imageId +'", value="'+ imageId +'">'+
                                '<input type="hidden" class="reviewed-input" name="reviewed-'+ imageId +'" value="0">'+
                                '<div class="vtr-playstage-abm__form__fieldgroup">'+
                                    '<select class="select-input" id="category-'+ imageId +'" name="category-'+ imageId +'">'+
                                        '<option selected disabled hidden value="0">Seleccionar categoria</option>'+
                                        '<option value="1">VTR Stage</option>'+
                                        '<option value="2">Perry\'s Stage by VTR</option>'+
                                        '<option value="3">Banco Chile Stage</option>'+
                                        '<option value="4">Acer Stage</option>'+
                                        '<option value="5">Lotus Stage</option>'+
                                        '<option value="6">Kidzapalooza</option>'+
                                        '<option value="7">Heineken Lounge Stage</option>'+
                                        '<option value="8">VTR Playstage</option>'+
                                        '<option value="9">Revive Lolla CL</option>'+
                                    '</select>'+
                                 '</div>'+
                                '<div class="vtr-playstage-abm__form__fieldgroup">'+
                                    '<h4>Aprobar</h4>'+
                                    '<label for="approved-'+ imageId +'">Si</label>'+
                                    '<input class="approval-radio" type="radio" name="approval-'+ imageId +'" id="approved-'+ imageId +'" value="1">'+
                                    '<label for="unapproved-'+ imageId +'">No</label>'+
                                    '<input class="approval-radio" type="radio" name="approval-'+ imageId +'" id="unapproved-'+ imageId +'" value="0">'+
                                '</div>'+
                            '</div'+
                        '</div>')
                    );


               // }


            });

            $('.vtr-playstage-abm__form__body').html(formFieldSet);

            $('.approval-radio').on('change', function(e){
                var currentInput = $(e.target);
                var currentInputItem = currentInput.parents('.vtr-playstage-abm__form__group');

                currentInputItem.addClass('-reviewed');
                currentInputItem.find('.reviewed-input').val(1);

                $('#saveimages').removeAttr('disabled');
            });
        });
    });

    $('#saveimages').on('click', function(e){
        console.log('saved clicked');
        e.preventDefault();

        var reviewedItems = $('.vtr-playstage-abm__form__group.-reviewed');
        var serializedData = [];

        reviewedItems.each(function(){
            var $this = $(this);

            var itemid = $this.find('.id-input').val();
            var reviewedStatus = $this.find('.reviewed-input').val();
            var approvedStatus = $this.find('input:checked').val();
            var category = $this.find('.select-input').val();

            serializedData.push({
                id: itemid,
                reviewed: reviewedStatus,
                approved: approvedStatus,
                category: category
            });
        });

        console.log('updating in database');
        $.ajax({
            type: "POST",
            url: './update-images.php',
            data: {imagesArray: serializedData}
        }).done(function(response) {
            console.log('success UPDATE', response);
            if(response === 'success') {
                console.log('was successful');
                $('.vtr-playstage-abm__form__group.-reviewed').remove();
            }
        }).fail(function(response) {
            console.log(response);
        });
    });

    function getImagesFromDatabase() {
        console.log('Loading from database');

        return new Promise(function(resolve, reject) {
            resolve(
                $.get('./load-images.php', function (data, status) {
                    return data;
                })
            );
        });
    }
}

module.exports = ImagesAbm;
