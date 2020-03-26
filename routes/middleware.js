const jwt = require('jsonwebtoken');

// 토큰 유효성 검사
exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.YAKSSOK_SECRET)
        
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.log('만료된 토큰')
            return res.json({
                code: 419,
                message: '토큰이 만료되었습니다. 다시 로그인해 주세요.'
            });
        } else {
            // 401에러가 난 경우는 토큰을 전송하지 않은 경우가 대부분이니 주의.
            // 반드시 헤더에 토큰을 넣어서 보낼 것.
            return res.json({
                code: 401,
                message: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
            });
        }
    }
};

// access token 발급
// exports.access_token = (user) => {
exports.access_token = (id) => {
    try {
        // jwt 토큰 발급                         
        const token = jwt.sign(
        { id }, 
        process.env.YAKSSOK_SECRET, 
        {
            expiresIn: '2h',
            issuer: 'YAKSSOK'
        });
        return token;
    } catch (err) {
        res.json({
            code: 500,
            message: '서버에서 에러가 발생했습니다.'
        });
        console.log('토큰 발급 중 에러 발생', err);
        next(err);
    }
}
