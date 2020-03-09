const express = require('express');
const router = express.Router();
// 시퀄라이즈 모듈 가져오기
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Pictogram = models.Pictogram;
const error = {
    code: 500,
    message: '서버에서 에러가 발생했습니다.'
};

// 모든 픽토그램의 정보 읽어오기
router.get('/', async (req, res) => {
    try {
        let pictograms = await Pictogram.findAll({
            order: [['pictogram_name', 'ASC']]
        });
        res.json({
            code: 200,
            pictograms
        }); 
    } catch (err) {
        res.json(error);
        console.log('픽토그램 로드 에러 발생', err);
        next(err);
    }
});

// 픽토그램 등록
// findOrCreate 
// 중복값이 있을 경우 내부적으로 처리
// 없을 경우에는 새로운 객체를 생성한다.
router.post('/', async (req, res) => {
    // async,await의 반환값은 Promise 객체
    try {
        console.log('요청옴')
        let result = await Pictogram.findOrCreate({
            where: { pictogram_name: req.body.pictogram_name },
            defaults: {
                pictogram_name: req.body.pictogram_name,
                image_path: req.body.image_path
            }
        })
            // findOrCreate에서는 리턴값이 2개이므로 then을 사용X
            // spread 를 사용한다.
            .spread((pictogram, created) => {

                if (created) { // 새로 작성한 경우 created 가 반환
                    res.json({
                        code: 201,
                    });
                    console.log('신규작성');
                    console.log(created); // 리턴값은 true
                }else { // 기존에 존재하는 경우 
                    res.json({
                        code: 409,
                        mesage: '이미 등록된 픽토그램입니다. '
                    });
                }
            })
    } catch (err) {
        res.json(error);
        console.log('픽토그램 등록 에러 발생', err);
        next(err);
    }
});

module.exports = router;
