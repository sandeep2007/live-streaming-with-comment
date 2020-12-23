userSocketId = null;
channelId = 0;
senderId = 0;

setInterval(() => {

    if (getToken() && !connection.commentSocket) {

        console.log('Initiate socket connection')

        connection.commentSocket = createSocket(socket_url1, '/test', getToken());
        console.log(connection.commentSocket)
        connection.commentSocket.on('connect', (data) => {
            console.log('Connected')
        })

        connection.commentSocket.on('userConnect', (data) => {

            senderId = getUserData('id');
        });

        connection.commentSocket.on('userDisconnect', (data) => {

        });

        connection.commentSocket.on('receiveMessage', (data) => {
            receiveMessage(data);
        });

        connection.commentSocket.on('chatList', (data) => {
            console.log(data);
            renderChatList(data);
        });

        connection.commentSocket.on('pongTest', (data) => {

            var template = `<div class="alert alert-success alert-dismissible">
                                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                                    <strong>Success!</strong> You are connected.
                                </div>`;
            showMsg('#msg', template);
        })

        connection.commentSocket.on('userTyping', (data) => {
            userTyping(data);
        })
    }
}, 1000);

// function renderUserStatus(data) {

//     if (channelId == data.id) {
//         $('.last-seen').fadeOut();
//         let userPresense = `<i class="profile-status-1 fa fa-circle ${(data.is_online == 'ONLINE' ? 'text-success' : 'text-danger')}"></i>`;

//         var html = `
//             <a href="javascript:{}" class="list-group-item" style="height: 62px;">

//                 <div class="float-left" style="margin-right: 10px;">
//                 <img class="user-profile" src="${data.image}">
//                 </div> 
//                 <div class="float-left">
//                 <div>${data.name}</div>
//                 <div style="margin-top: -9px;"></div>
//                 </div> 
//             </a>`;
//         $('#chat-header').html(html);
//         $('.last-seen').fadeIn();
//     }
// }

function createCommentBox(data) {
    channelId = data.uniqCastId;
    connection.commentSocket.emit('joinChannel', { channelId: channelId });
    //renderUserStatus(data)
    $('#channel-box').show();
    // $('#user-list').hide();
    connection.commentSocket.emit('chatList', { channelId: channelId });
    scrollChatDown();
}

function closeChannelBox() {

    connection.commentSocket.emit('leaveChannel', { channelId: channelId });
    channelId = null;
    $('#channel-box').hide();
    // $('#user-list').show();
    $('#chat-list').empty();

}

function scrollChatDown() {
    var objDiv = document.getElementById("chat-list");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function receiveMessage(data) {

    if (channelId == data.channelId) {
        var elMsg = `<div class="chat-msg-receiver message-item"><small>${data.userName}</small><br/>${data.message}<br/><small>${data.date_created}</small></div>`;
        $('#chat-list').append(elMsg);
        userTypingHide();
        scrollChatDown();
    }
}

function pad(s) { return (s < 10) ? '0' + s : s; }

function getCurrentDateTime() {
    var today = new Date();
    var date = pad(today.getFullYear()) + '-' + pad((today.getMonth() + 1)) + '-' + pad(today.getDate());
    var time = pad(today.getHours()) + ":" + pad(today.getMinutes()) + ":" + pad(today.getSeconds());
    var currentDateTime = date + ' ' + time;
    return currentDateTime;
}

function sendMessage(target) {
    event.preventDefault();
    var date_created = getCurrentDateTime();
    var $el = $(target);
    var message = $el.find('.chat-input-box').val();
    if (message) {
        $el.find('.chat-input-box').val('');
        connection.commentSocket.emit('sendMessage', { senderId: senderId, channelId: channelId, message: message });
    }

}

function renderChatList(chatList) {
    var chatEl = chatList.map((data) => {
        return `<div class="chat-msg-receiver message-item"><small>${data.userName}</small><br/>${data.message}<br/><small>${data.date_created}</small></div>`;
    });
    $('#chat-list').html(chatEl);
    scrollChatDown();
}

function press(e) {

    e = e || window.event;
    if (e.keyCode == 13) {
        sendMessage('#channel-box');
    }
}

typingStatus = true;
function userTyping(data) {

    if (senderId != data.senderId) {
        $('.user-typing').fadeIn();
        if (typingStatus) {
            typingStatus = false;
            setTimeout(() => {
                $('.user-typing').fadeOut();
                typingStatus = true;
            }, 5000);
        }
    }
}

function userTypingHide() {

    $('.user-typing').hide();
}

$(document).ready(() => {
    $('#chat-input').on('keyup', (e) => {
        if (e.target.value != '') {
            connection.commentSocket.emit('userTyping', { channelId: channelId });
        }
    })
});
