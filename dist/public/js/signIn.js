$('.form-signin').submit(function( event ) {
    $.ajax({
        type: "post",
        url: '/login',
        dataType: 'html',
        data: JSON.stringify({'email': $('#inputLogin').val(), 'password':$('#inputPassword').val()}),
        contentType: 'application/json',
        success: function (data, textStatus, request) {
            $.ajax({
                type: "get",
                url: "/",
                dataType: "html",
                success: function (data, textStatus, request) {
                    window.location = "/";
                }
            })
        }
    });
});
