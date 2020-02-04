const express = require('express');
const router = express.Router();
// 시퀄라이즈 모듈 가져오기
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Pictogram = models.Pictogram;

// 모든 픽토그램의 정보 읽어오기
router.get('/', async (req, res) => {
    try {
        let result = await Pictogram.findAll({
            order: [['pictogram_name', 'ASC']]
        });
        res.json(result); // 리턴값은 배열(json들어있는 배열)
    } catch (err) {
        console.log(err);
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
                        message: '픽토그램 신규 등록 성공'
                    });
                    console.log('신규작성');
                    console.log(created); // 리턴값은 true
                }else { // 기존에 존재하는 경우 
                    res.json({
                        code: 409,
                        mesage: '이미 등록된 픽토그램입니다. '
                    });
                    console.log('중복');
                    console.log(pictogram); // 리턴값은 DB정보 객체
                }
            })
    } catch (err) {
        console.log(err);
    }
});



// 특정 픽토그램의 정보 읽어오기
// 파라미터가 있는 경우에는 라우터 최하단에 작성해야 한다.
router.get('/:id', async (req, res) => {

})



module.exports = router;
