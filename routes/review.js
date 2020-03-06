const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Review = models.Review; // 상품평
const Comment = models.Comment; // 상품평 댓글
const User = models.User; // 상품평 댓글

// 상품평 읽어오기
// 상품 정보 읽어올 때 
router.get('/', async (req, res) => {

    try {
        let result = await Review.findAll({
            where: { productId: req.query.productId },
            include: [
                { model: User },
                { model: Comment }
            ],
            order: [['id', 'DESC']], // 리뷰는 최신순으로 가져온다(댓글은 반대)
            limit: 10
        });
        console.log('review결과', result);

        // user객체에서 user_id를 추출한다
        if (result.length > 0) {
            result.forEach(item => {
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }
        console.log('삭제확인', result);

        // res.json(result);
        res.json({
            code: 200,
            result
        });
    } catch (err) {
        console.log(err);
        res.json({
            code: 500,
            message: '서버에서 에러가 발생했습니다.'
        });
    }
});

// 상품평 작성하기
// 토큰의 유효성은 여기서 따지지x(해당 라우트에 진입할 때 검사했음)
router.post('/', async (req, res) => {
    try {
        let result = await Review.create({
            title: req.body.title,
            contents: req.body.contents,
            userId: req.body.userId,
            productId: req.body.productId.id
        });
        console.log('review결과')
        console.log(result);

        // 등록 후 리뷰 리스트를 검색해서 보낸다
        result = await Review.findAll({
            where: { productId: req.body.productId.id },
            include: [
                { model: User },
                { model: Comment }
            ],
            order: [['id', 'DESC']], // 리뷰는 최신순으로 가져온다(댓글은 반대)
            limit: 10
        });
        console.log('review결과', result);

        // user객체에서 user_id를 추출한다
        if (result.length > 0) {
            result.forEach(item => {
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }
        console.log('삭제확인', result);

        res.status(201).json({
            code: 201,
            message: '리뷰 등록 성공',
            result
        })
    } catch (err) {
        console.log(err);
        res.json({
            code: 500,
            message: '서버에서 에러가 발생했습니다.'
        })
    }
})

// 상품평 삭제
router.delete('/delete/:productId/:reviewId', async (req, res) => {
    try {
        let result = await Review.destroy({
            where: { id: req.params.reviewId }
        });
        console.log('삭제결과', result);
        console.log('req.params.productId확인', req.params.productId);

        result = await Review.findAll({
            where: { productId: req.params.productId },
            include: [
                { model: User },
                { model: Comment }
            ],
            order: [['id', 'DESC']], // 리뷰는 최신순으로 가져온다(댓글은 반대)
            limit: 10
        });
        console.log('review결과', result);

        if (result.length > 0) {
            result.forEach(item => {
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }

        res.json({
            code: 200,
            result
        });

    } catch (err) {
        res.json({
            code: 500,
            message: '서버에서 에러가 발생하였습니다.'
        })
        console.log(err);
    }
});

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
router.get('/comments', async (req, res) => {
    try {
        // 이제 user정보에서 user_id만 추출하고 
        // user객체는 삭제한다
        console.log('리뷰id확인');
        console.log(req.query.review_id);
        const id = req.query.review_id;
        const result = await Comment.findAll({
            include: [
                { model: User }
            ],
            where: {
                reviewId: id
            },
            order: [['id', 'ASC']]
        })

        console.log('해당 리뷰의 댓글');
        console.log(result);

        if (result.length > 0) {
            result.forEach(item => {
                console.log('dataValues확인', item.dataValues);
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }
        console.log('삭제확인')
        console.log(result);
        // 리뷰의 댓글이 없을 경우에는 [] 이 반환 -> 클라이언트에서 처리
        res.json({
            code: 200,
            result
        });

    } catch (err) {
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
        let result = await Comment.create({
            contents: req.body.contents,
            userId: req.body.userId,
            reviewId: req.body.reviewId  // 어느 리뷰의 코멘트인지 식별
        })
        console.log('코멘트 결과')
        console.log(result);

        // 코멘트 리스트를 새로 불러와서 보내준다.
        result = await Comment.findAll({
            include: [
                { model: User }
            ],
            where: {
                reviewId: req.body.reviewId
            },
            order: [['id', 'ASC']],
        });

        console.log('해당 리뷰의 댓글');
        console.log(result);

        if (result.length > 0) {
            result.forEach(item => {
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }
        console.log('삭제확인')
        console.log(result);

        res.status(201).json({
            code: 201,
            message: '댓글 등록 성공',
            result
        });

    } catch (err) {
        console.log(err);
        res.json({
            code: 500,
            message: '서버에서 에러가 발생했습니다.'
        })
    }
})

// 코멘트 삭제하기
router.delete('/deleteComment/:reviewId/:commentId', async (req, res) => {
    try {
        console.log('모튼 파라확인', req.params);
        console.log('이게 문제인거 같음', req.params.commentId);
        console.log('파라미터, 리뷰', req.params.reviewId);
        let result = await Comment.destroy({
            where: { id: req.params.commentId }
        });
        console.log('코멘트 삭제 결과', result);

        // 새로 코멘트 리스트를 전달해준다
        result = await Comment.findAll({
            include: [
                { model: User }
            ],
            where: {
                reviewId: req.params.reviewId
            },
            order: [['id', 'ASC']],
        });


        if (result.length > 0) {
            result.forEach(item => {
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }
        console.log('삭제확인')
        console.log(result);

        res.json({
            code: 200,
            result
        });

    } catch (err) {
        res.json({
            code: 500,
            message: '서버에서 에러발생'
        })
        console.log(err);
    }
});

module.exports = router;
