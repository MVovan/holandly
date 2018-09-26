//
let object = {email: 'andrey@gmail.com', password: "z001"};

document.addEventListener('click', function(event) {
    $.ajax({
        type: "post",
        url: '/login',
        dataType: 'html',
        data: JSON.stringify(object),
        contentType: 'application/json',
        success: function(data, textStatus, request){
            $.ajax({
                type: "get",
                url: "/",
                dataType: "html",
                success: function(data, textStatus, request) {
                    window.location = "/";
    
                }
            })
       }
    });
})
        
