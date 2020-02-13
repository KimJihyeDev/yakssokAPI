const jwt = require('jsonwebtoken');

// 토큰 유효성 검사
exports.verifyToken = (req, res, next) => {
    try{
        // req.decoded는 true/false ? 
        req.decoded = jwt.verify(req.headers.authorization, process.env.YAKSSOK_SECRET)
        console.log('토큰의 decoded값')
        console.log(req.decoded);
        // 자바스크립트에서 함수는 값이기 때문에 리턴값으로 사용가능
        return next();
    } catch(err) {
        if(err.name === 'TokenExpiredError') {
            console.log('만료된 토큰')
            return res.json({
                code:419,
                message: '토큰이 만료되었습니다.'
            });
        } else {
            return res.json({
                code:401,
                message: '유효하지 않은 토큰입니다.'
            })
        } 
    }
};