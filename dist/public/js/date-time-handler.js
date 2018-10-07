$('ul').on('click', '.active', function () {
    updateDays();
    $(this).css('background-color', "#27AE60");
    $(this).css('color', "white");
    $('.time-container ul').html('');
    var date = $(this).html();
    getTimeline(formatDate(date));
    $('.time-container').css('display', 'block');
});

$('.forward').on("click", function () {
    updateDays();
    $('.time-container').css('display', 'none');
    $('.time-container ul').html('');
    var last_date = $('.date-bar li').last().html();
    let gottenDate = formatDate(last_date, true);
    getWeek(gottenDate);
});

$('.backward').on("click", function () {
    updateDays();
    $('.time-container').css('display', 'none');
    $('.time-container ul').html('');
    var last_date = $('.date-bar li').first().html();
    let gottenDate = formatDate(last_date, false);
    getWeek(gottenDate);
});

function getTimeline(date) {
    $.ajax({
        type: 'GET',
        url: "/getTimeLine/"+date+"/" +patternId,
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            let events = data.events;
            for (let i = 0; i < events.length; i++){
                if (events[i].availability) {
                    let item = addTimeNode(events[i]);
                    $('.time-container ul').append(item);
                }
            }
            $('.time-container').attr('display', 'flex');
        }
    })
}

$('.time-container ul').on('click', '.pick', function () {
    eventId = $(this).children('.event-id').text();
    $('.submit-modal').css('display', 'flex');
    let startTime = $(this).parent().children('.time').text();
    $('#modal-start').html("⌚    Начало: "  +startTime.slice(0, 5));
});

$('.submit-modal').on('click', function (e) {
    if (e.target !== this)
        return;

    $('.submit-modal').css('display', 'none');
});

$('#visitorName').focusout(function () {
   checkName();
});

$('#visitorEmail').focusout(function () {
   checkEmail(); 
});

$('.modal-confirm').on('click', function () {
    if (!error_name && !error_email) {
        let vName = $('#visitorName').val();
        let vEmail = $('#visitorEmail').val();
        sendVisitor({name: vName, email: vEmail, event: eventId});
    }
});

function getWeek(date) {
    $.ajax({
        type: 'GET',
        url: "/getWeek/"+date+'/'+patternId,
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            let days = data.days;
            for (let i = 0; i < days.length; i++) {
                let iDate = new Date(days[i].date);
                $('.date-bar li').eq(i).html(days[i].date);
                if (days[i].available) {
                    $('.date-bar li').eq(i).attr('class', 'active');
                }
                else {
                    $('.date-bar li').eq(i).attr('class', '');
                }
            }
        }
    })
}

function formatDate(date, increase){
    let dateArray = date.split('/');
    let gottenDate = new Date(dateArray[2] + "-" + dateArray[1] + '-' + dateArray[0]);
    if (increase) {
        gottenDate.setDate(gottenDate.getDate()+1);
    }
    else if (increase === false) {
        gottenDate.setDate(gottenDate.getDate()-7);
    }
    gottenDate = gottenDate.toISOString().slice(0, 10);
    return gottenDate;
}

function updateDays(){
    $('.active').css('background-color', '');
    $('.active').css('color', '');
}

function addTimeNode(data){
    let timelineTime = formatTimelineTime(data.date, data.time);
    let li = $('<li>');
    li.append('<span>');
    let id = $('<div>');
    id.addClass('event-id');
    id.html(data.eventId);
    let pick = $('<div>');
    pick.addClass('pick');
    pick.html('Записаться');
    let remain = $('<div>');
    remain.addClass('remain');
    remain.html('Осталось мест: ' + data.remain);
    pick.append(id);
    pick.append(remain);
    li.append(pick);
    let time = $('<div>');
    time.addClass('time');
    let startSpan = $('<span>').html(timelineTime.getHours() + ":" +
        ('0'+timelineTime.getMinutes()).slice(-2));
    time.append(startSpan);
    timelineTime.setMinutes(timelineTime.getMinutes() + duration);
    let endSpan = $('<span>').html(timelineTime.getHours() + ":" +
        ('0'+timelineTime.getMinutes()).slice(-2));
    time.append(endSpan);
    li.append(time);
    return li;
}

function formatTimelineTime(date, time){
    let timeArr = time.split(':');
    let timelineTime = new Date(date);
    timelineTime.setHours(timeArr[0]);
    timelineTime.setMinutes(timeArr[1]);
    timelineTime.setSeconds(timeArr[2]);
    return timelineTime;
}

function sendVisitor(inputData){
    console.log(inputData);
    $.ajax({
        type: 'POST',
        url: '/submitVisitor',
        data: JSON.stringify({name: inputData.name, email: inputData.email, event: inputData.event}),
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            console.log(data);
        }
    })
}

function checkName() {
    let pattern = /^[a-zA-Z]*$/;
    let name = $('#visitorName').val();
    if (pattern.test(name) && name !== ''){
        $('#visitorName').css('border-bottom', '2px solid #34F458');
        error_name = false;
    }
    else {
        $('#visitorName').css('border-bottom', '2px solid #f90a0a');
        error_name = true;
    }
}

function checkEmail() {
    let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let mail = $('#visitorEmail').val();
    if (pattern.test(mail) && mail !== ''){
        $('#visitorEmail').css('border-bottom', '2px solid #34F458');
        error_email = false;
    }
    else {
        $('#visitorEmail').css('border-bottom', '2px solid #f90a0a');
        error_email = true;
    }
}



var error_name = false;
var error_email = false;

var duration = $('#eventDuration').html();
duration = parseInt(duration);
var patternId = $('#patternId').html();

var eventId;