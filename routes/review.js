const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Review = models.Review; // 상품평
const Comment = models.Comment; // 상품평 댓글
const User = models.User; // 상품평 댓글
const error = {
    code: 500,
    message: '서버에서 에러가 발생했습니다.'
};

// 중복 코드 처리(리뷰)
const reviews = (req, res, next, id) => {
    return (async () => {
        try {
            const result = await Review.findAndCountAll({
                where: { productId: id },
                include: [
                    {
                        model: User,
                        attributes: ['user_id'],
                        paranoid: false  // 삭제된 회원의 글도 가져와야 한다
                    },
                ],
                order: [['id', 'DESC']], // 리뷰는 최신순으로 가져온다(댓글은 반대)
                limit: 10
            });

            res.json({
                code: 200,
                result
            });
        } catch (err) {
            console.log('리뷰 조회 에러 발생', err);
            next(err);
        }
    })();
}

// 중복코드 처리(코멘트)
const comments = (req, res, next, id) => {
    return (async () => {
        try {
            const result = await Comment.findAndCountAll({
                include: [
                    {
                        model: User,
                        attributes: ['user_id'],
                        paranoid: false
                    }
                ],
                where: {
                    reviewId: id
                },
                order: [['id', 'ASC']]
            });

            // 리뷰의 댓글이 없을 경우에는 [] 이 반환 -> 클라이언트에서 처리
            res.json({
                code: 200,
                result
            });
        } catch (err) {
            console.log('코멘트 조회 에러 발생', err);
            next(err);
        }
    })();
}

// 리뷰 
// 삭제된 회원의 글일 경우 user 정보가 null이 되므로 paranoid: false처리
router.get('/', async (req, res, next) => {
    try {
        const id = req.query.productId;
        await reviews(req, res, next, id);
    } catch (err) {
        console.log('상품평 로딩 에러 발생', err);
        res.json(error);
        next(err);
    }
});

// 리뷰 작성하기
router.post('/', async (req, res, next) => {
    try {
        const id = req.body.productId.id;

        await Review.create({
            title: req.body.title,
            contents: req.body.contents,
            userId: req.body.userId,
            productId: req.body.productId.id
        });

        await reviews(req, res, next, id);
    } catch (err) {
        console.log('리뷰 등록 에러 발생', err);
        res.json(error);
        next(err);
    }
});

// 리뷰 삭제
router.delete('/delete/:productId/:reviewId', async (req, res, next) => {
    try {
        await Review.destroy({
            where: { id: req.params.reviewId }
        });

        const id = req.params.productId;
        await reviews(req, res, next, id);
    } catch (err) {
        res.json(error);
        console.log('상품평 삭제 에러 발생', err);
        next(err);
    }
});


// 코멘트 불러오기
// 어느 글의 코멘트인지 알아야 한다
router.get('/comments', async (req, res, next) => {
    try {
        const id = req.query.review_id;
        await comments(req, res, next, id);
    } catch (err) {
        res.json(error);
        console.log('코멘트 조회 오류 발생', err);
        next(err);
    }
})

// 코멘트 작성하기
router.post('/comments', async (req, res, next) => {
    try {
        await Comment.create({
            contents: req.body.contents,
            userId: req.body.userId,
            reviewId: req.body.reviewId  // 어느 리뷰의 코멘트인지 식별
        })

        const id =  req.body.reviewId;
        await comments(req, res, next, id);
    } catch (err) {
        res.json(error);
        console.log('코멘트 등록 에러 발생', err);
        next(err);
    }
})

// 코멘트 삭제하기
router.delete('/deleteComment/:reviewId/:commentId', async (req, res, next) => {
    try {
        await Comment.destroy({
            where: { id: req.params.commentId }
        });

        const id = req.params.reviewId;
        await comments(req, res, next, id);
    } catch (err) {
        res.json(error);
        console.log('코멘트 삭제 에러 발생', err);
        next(err);
    }
});

module.exports = router;
