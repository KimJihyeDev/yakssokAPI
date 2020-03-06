const jwt = require('jsonwebtoken');

// 토큰 유효성 검사
exports.verifyToken = (req, res, next) => {
    try {
        // req.decoded는 true/false ? 
        console.log('리퀘스트헤더')
        console.log(req.headers)
        console.log(req.headers.authorization)
        // req.decoded = jwt.verify(req.headers.authorization, process.env.YAKSSOK_SECRET)
        req.decoded = jwt.verify(req.headers.authorization, process.env.YAKSSOK_SECRET)
        console.log('토큰의 decoded값')
        console.log(req.decoded);
        // 자바스크립트에서 함수는 값이기 때문에 리턴값으로 사용가능
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
            console.log('유효하지 않은 토큰');
            return res.json({
                code: 401,
                message: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
            });
        }
    }
};
// access token 발급
exports.access_token = (user) => {
    try {
        // jwt 토큰 발급                         
        const token = jwt.sign({
            id: user.id,
        }, process.env.YAKSSOK_SECRET, {
            expiresIn: '2hour',
            issuer: 'YAKSSOK'
        });
        return token;
    } catch (err) {
        console.log(err);
    }
}