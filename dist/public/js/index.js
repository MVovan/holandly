
$( document ).ready( function() {
    let el = document.createElement('p');
    el.textContent = "hi man";
    document.querySelector('body').appendChild(el);
   
/*
    let object = {};
    object.id = '0';
    object.date = "2017-12-12";
    object.time = "17:00";
    object.patternId = '1';

    */

    $.ajax({
        url: "/event/1",
        type: "DELETE",
        //contentType: 'application/json',
        //data: JSON.stringify(object),
        success: function(data) {
            console.log("success");
        }
    })
} )




