const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Review = models.Review; // 상품평
const Comment = models.Comment; // 상품평 댓글
const User = models.User; // 상품평 댓글

// 상품평 읽어오기
router.get('/', async (req, res) => {
   try{
    const result = await Review.findAll({
        include: { model: Comment },
        limit: 10
    });
    console.log('review결과');
    res.json(result);

   } catch(err) {
       console.log(err);
       res.json({
        code: 500,
        message: '서버에서 에러가 발생했습니다.'
    })
   }
})

// 상품평 작성하기
router.post('/', async (req, res) => {
    try{    
        console.log('유저확인~')
        console.log(req.body)
        let result = await Review.create({
            title: req.body.title,
            contents: req.body.contents,
            userId: req.body.userId,
            productId: req.body.productId.id
        });
        console.log('review결과')
        console.log(result);

        res.status(201).json({
            code: 201,
            message: '리뷰 등록 성공',
            result
        })
    } catch(err) {
        console.log(err);
        res.json({
            code: 500,
            message: '서버에서 에러가 발생했습니다.'
        })
    }
})

// 상품평 지우기
router.delete('/delete', async (req,res) => {
    try {
        console.log('지우고자 하는 id')
        console.log(req.query.review_id)
        const result = await Review.destroy({
            where: { id: req.query.review_id }
        })
        console.log(result);

    } catch(err) {
        console.log(err);
    }
    // Review.destroy({ where: { id: req.query.review_id } })
    // .then((result) => {
    //     console.log('왜 삭제를 못 해!!')
    //     console.log(result);
    //   res.json(result);
    // })
    // .catch((err) => {
    //   console.error(err);
    //   next(err);
    // });

})

// 상품평 수정
// router.patch('/delete', async (req,res) => {
//     try {
//         console.log('수정하고자 하는 id')
//         console.log(req.query.review_id)
//         const result = await Review.update({
//             where: { id: req.query.review_id }
//         })
//         console.log(result);

//     } catch(err) {
//         console.log(err);
//     }
// })




// 코멘트 불러오기
// 어느 글의 코멘트인지 알아야 한다
// 미사용
router.get('/comments', async (req, res) => {
    try {
        // 이제 user정보에서 user_id만 추출하고 
        // user객체는 삭제한다
        console.log('리뷰id확인');
        console.log(req.query.review_id);
        const id = req.query.review_id;
        const result = await Comment.findAll({
            include: [
                { model: Review }, 
                { model: User }
            ],
            where: {
                reviewId: id
            },
            order: [['id', 'ASC']]
        })
        
        console.log('해당 리뷰의 댓글');
        console.log(result);

        if (result.length >= 1) {
            result.forEach(item => {
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }
        console.log('삭제확인')
        console.log(result);
        // 리뷰의 댓글이 없을 경우에는 [] 이 반환
        res.json(result);

    } catch(err) {
        console.log(err);
        res.json({
            code: 500,
            message: '서버에서 에러가 발생했습니다.'
        })
    }
})

// 코멘트 작성하기
router.post('/comments', async (req, res) => {
    try {
        console.log(req.body)
        const result = await Comment.create({
            contents: req.body.contents,
            userId: req.body.userId ,
            reviewId: req.body.reviewId  // 어느 리뷰의 코멘트인지 식별
        })
        console.log('코멘트 결과')
        console.log(result);
        // 응답해야지!!
        // 방금전 만든 코멘트의 결과를 보고서
        // 코멘트 객체 자체가 나오면 즉시 클라이언트에 응답
        res.status(201).json({
            code: 201,
            message: '댓글 등록 성공',
            result
        });

    } catch(err) {
        console.log(err);
        res.json({
            code: 500,
            message: '서버에서 에러가 발생했습니다.'
        })
    }
})

module.exports = router;
