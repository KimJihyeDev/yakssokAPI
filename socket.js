const SocketIO = require('socket.io');
const models = require('./models/index');
const UserProducts = models.UserProducts; 
const Product = models.Product; 
const User = models.User; 

// 소켓 모듈
connectedUsers = {};
module.exports = (server) => {

    // express서버와 socket.io연결
    const io = SocketIO(server, { path: '/socket.io' });

    // 네임스페이스 지정
    const productIo = io.of('product');

    productIo.on('connection', (socket) => {

        //소켓Req객체
        const req = socket.request;

        //접속 클라이언트 IP주소
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);

        //소켓 연결해제
        socket.on('disconnect', () => {
            console.log('클라이언트가 연결을 끊었습니다.');
        });

        //소켓 에러발생시 로깅
        socket.on('error', (err) => {
            console.error(err);
        });

        // 사용자가 접속했을 때 발생하는 이벤트
        // 사용자에게 소켓 id를 건네준다.
        socket.emit('welcome', socket.id);

        // 사용자가 좋아요를 한 경우
        socket.on('like', async (socketId, userId, productId) => {

            // 1. 해당 상품을  좋아요 싫어요를 한 회원인지 조회
            // 2. 좋아요를 해 놓은 상태라면 삭제(delete)
            // 3. 싫어요를 해 놓은 상태상면 경고(이미 좋아요/싫어요를 하셨습니다.)
            try {
                const result = await UserProducts.findOne({ 
                       where: { userId, productId },
                       attributes: ['like_dislike'],
                    });
                    
                    // 이미 좋아요/싫어요를 한 경우
                    if(result) {
                        // 좋아요 싫어요인지 확인
                        const isLike = result.like_dislike;
                        
                        if(isLike) {
                            // 이미 좋아요를 한 회원이면 삭제하고
                            // like_count를 감소시킨 후 그 결과를 알려준다
                            await UserProducts.destroy({
                                where: { userId, productId }
                            });

                            await Product.decrement(
                                { like_count: 1 },
                                { where: { id: productId } } 
                            );

                            let like = await Product.findByPk(productId, {
                                attributes: ['like_count'],
                            });
                            
                            like = like.getDataValue('like_count');
                            io.of('product').emit('likeDecrease', productId, like, userId);
                        }
                    }

                    if(!result) {
                        await UserProducts.create({
                            userId,
                            productId,
                            like_dislike: true
                        });

                        // products테이블의 좋아요 수도 늘린다
                        await Product.increment
                        (   
                            { like_count:  + 1 },
                            { where: { id: productId } } 
                        );
                        
                        let like = await Product.findByPk(productId, 
                        {   
                            attributes: ['like_count'],
                            include: [
                                { model: User , 
                                  attributes: ['id']
                                },
                            ]
                        });
                        like = like.getDataValue('like_count');

                        io.of('product').emit('likeIncrease', productId, like, userId);
                    }
            } catch (err) {
                console.log('좋아요 이벤트 중 에러 발생', err);
            }
        });

        // 사용자가 싫어요한 경우 
        socket.on('dislike', async (socketId, userId, productId) => {
            try {
                const result = await UserProducts.findOne({ 
                       where: { userId, productId },
                       attributes: ['like_dislike'],
                    });
                    
                    // 이미 좋아요/싫어요를 한 경우
                    if(result) {
                        // 좋아요 싫어요인지 확인
                        const isLike = result.like_dislike;
                        
                        if(!isLike) {
                            // 이미 싫어요를 한 회원
                            await UserProducts.destroy({
                                where: { userId, productId }
                            });

                            await Product.decrement(
                                { dislike_count: 1 },
                                { where: { id: productId } } 
                            );

                            let dislike = await Product.findByPk(productId, {
                                attributes: ['dislike_count'],
                            });

                            dislike = dislike.getDataValue('dislike_count');
                            io.of('product').emit('dislikeDecrease', productId, dislike, userId);
                        }
                    }

                    if(!result) {
                        await UserProducts.create({
                            userId,
                            productId,
                            like_dislike: false
                        });

                        await Product.increment
                        (   
                            { dislike_count:  1 },
                            { where: { id: productId } } 
                        );

                        let dislike = await Product.findByPk(productId, 
                        {   
                            attributes: ['dislike_count'],
                            include: [
                                { model: User , 
                                  attributes: ['id']
                                },
                            ]
                        });

                        dislike = dislike.getDataValue('dislike_count');
                        io.of('product').emit('dislikeIncrease', productId, dislike, userId);
                    }
            } catch (err) {
                console.log('싫어요 이벤트 중 에러 발생', err);
            }
        })

    })
};