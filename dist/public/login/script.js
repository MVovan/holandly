
let object = {email: 'andrey@gmail.com', password: "z001"};

document.addEventListener('click', function(event) {
    $.ajax({
        type: "post",
        url: '/login',
        dataType: 'json',
        data: JSON.stringify(object),
        contentType: 'application/json',
        success: function(data, textStatus, request){
            console.log(request.getResponseHeader('location'));
       }
    });
})
        
