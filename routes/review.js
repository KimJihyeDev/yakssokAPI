const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Review = models.Review; // 상품평
const Comment = models.Comment; // 상품평 댓글

// 상품평 읽어오기
router.get('/', async (req, res) => {
   try{
    const result = await Review.findAll({
        include: { model: Comment },
        limit: 10
    });
    console.log('article결과');
    res.json(result);
   } catch(err) {
       console.log(err);
   }
})

// 상품평 작성하기
router.post('/', async (req, res) => {
    try{    
        console.log('유저확인~')
        console.log(req.body)
        const result = await Review.create({
            title: req.body.title,
            contents: req.body.contents,
            userId: req.body.userId,
            productId: req.body.productId.id
        });
        console.log('article결과')
        console.log(result);
    } catch(err) {
        console.log(err);
    }
})

module.exports = router;
