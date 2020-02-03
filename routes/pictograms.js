const express = require('express');
const router = express.Router();
// 시퀄라이즈 모듈 가져오기
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Pictogram = models.Pictogram;

// 모든 픽토그램의 정보 읽어오기
router.get('/',async(req,res)=>{
    try{
        let result = await Pictogram.findAll();
        res.json(result);
    }catch(err){
        console.log(err);
    }
});

// 픽토그램 등록
router.post('/',async(req,res)=>{
    // async,await의 반환값은 Promise 객체
    try{
        console.log('요청옴')
        // pictogram_type: req.body.pictogram_type,
        let result = await Pictogram.create({
            type: req.body.type,
            pictogram_name: req.body.pictogram_name,
            image_path: req.body.image_path
        })
        // image_path: req.body[0].image_path
        console.log(req.body);
        console.log('결과는?')
        console.log(result);
        res.status(201).json({
            message:'등록성공'
        });

    }catch(err){
        console.log(err);
    }
});



// 특정 픽토그램의 정보 읽어오기
// 파라미터가 있는 경우에는 라우터 최하단에 작성해야 한다.
router.get('/:id',async (req,res)=>{
    
})



module.exports = router;
