const SocketIO = require('socket.io');
// 서버가 듣고 보내는 이벤트는 이곳에 작성
// ejs, html 등은 클라이언트이다.

// io > socket이다
// 소켓 모듈
connectedUsers = {};
module.exports = (server) => {
    // express 서버와 socket.io 연결
    // 아래는 서버 설정
    // SocketIo(server, { 설정명: '설정값' }); 
    const io = SocketIO(server, { path: '/socket.io' });

    // io 네임스페이스로 채팅방을 설정(io 중 room으로 온 요청만 처리)
    const room = io.of('room');
    // 채팅
    const chat = io.of('chat');
    // 채팅방 번호 
    let roomId;

    // socket 연결이 되었을 때의 이벤트
    // io로 on(이벤트를 듣는다.)
    room.on('connection', (socket) => { // io가 연결 되면 socket으로 처리
        //소켓Req객체
        const req = socket.request;

        console.log('소켓확인');
        console.log(socket)
        const { id } = socket;
        console.log('id확인')
        console.log(id)





        // 접속 클라이언트의 IP 주소(로컬환경에서는 작동X)
        const ip = req.headers['x-forwarded-for'] || req.connection.resmoteAddress;

        console.log('새클라이언트 접속', ip, socket.id, req.ip);

        // 서버의 로그 정보를 현재 접속자에게 보내는 함수
        function log() {
            let array = ['Message from Server'];
            array.push.apply(array, arguments);
            socket.emit('log', array);
        }

        // 소켓 연결 해제
        socket.on('disconnect', () => {
            // setInterval 을 멈추게 하는 clearInterval
            clearInterval(socket.interval);
        });

        // 소켓 에러발생시 로깅
        socket.on('error', (error) => {
            console.log(error);
        });

        // 사용자 채팅 메시지 브로드 캐스팅
        socket.on('message', (nick, message) => {
            // 현재 접속자에게만 메시지 보내기
            // 멀티캐스트?\
            console.log(nick, message);
            socket.emit('receiveMsg', nick, message);

            // 메시지를 전송한 클라이언트를 제외한 모든 사용자에게 메시지 송신
            socket.broadcast.emit('receivemsg', nick, message);
        });

        socket.on('frontEndMessage', (clientId, message) => {
            console.log(`${clientId}님의 ${message} `);
            console.log(`${clientId}님의 소켓id:${id} `)
            //  메시지를 전송한 클라이언트에게만 이벤트 전송(유니 캐스트)
            // socket.emit('chat', id, message);

            // 모든 클라이언트에게 이벤트 전송
            // io.to(소켓아이디).emit('이벤트명' 데이터);
            console.log('to를 위해 재확인')
            console.log(admin)
            io.to(admin).emit('chat', clientId, message);
            // socket.broadcast.emit('chat', clientId, message)
        })
    });
};