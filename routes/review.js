const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Review = models.Review; // 상품평
const Comment = models.Comment; // 상품평 댓글
const User = models.User; // 상품평 댓글
const error = {
    code: 500,
    message: '서버에서 에러가 발생했습니다.'
};


// 리뷰 
// 상품 정보 읽어올 때
// 삭제된 회원의 글일 경우 user 정보가 null이 되므로 paranoid: false처리
router.get('/', async (req, res, next) => {
    try {
        const result = await Review.findAll({
            where: { productId: req.query.productId },
            include: [
                {
                    model: User,
                    attributes: ['user_id'],
                    paranoid: false  // 삭제된 회원의 글도 가져와야 한다
                },
                // 댓글에서도 user_id를 가지고 와야 한다
                // { 
                //     model: Comment,
                //     include: [{
                //             model: User,
                //             attributes: ['user_id'],
                //             paranoid: false  // 삭제된 회원의 글도 가져와야 한다
                //     }],
                // }
            ],
            order: [['id', 'DESC']], // 리뷰는 최신순으로 가져온다(댓글은 반대)
            limit: 10
        });
        console.log('상품평 조회', result);
        res.json({
            code: 200,
            result
        });
    } catch (err) {
        console.log('상품평 로딩 에러 발생', err);
        res.json(error);
        next(err);
    }
});

// 리뷰 작성하기
// 토큰의 유효성은 여기서 따지지x(해당 라우트에 진입할 때 검사했음)
router.post('/', async (req, res, next) => {
    console.log('리뷰', req.body);
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
                {
                    model: User,
                    attributes: ['user_id'],
                    paranoid: false  // 삭제된 회원의 글도 가져와야 한다
                },
                // { 
                //     model: Comment,
                //     include: [{
                //             model: User,
                //             attributes: ['user_id'],
                //             paranoid: false  // 삭제된 회원의 글도 가져와야 한다
                //     }],
                // }
            ],
            order: [['id', 'DESC']], // 리뷰는 최신순으로 가져온다(댓글은 반대)
            limit: 10
        });
        console.log('review결과', result);

        res.status(201).json({
            code: 201,
            result
        });
    } catch (err) {
        console.log('리뷰 등록 에러 발생', err);
        res.json(error);
        next(err);
    }
});

// 상품평 삭제
router.delete('/delete/:productId/:reviewId', async (req, res, next) => {
    try {
        let result = await Review.destroy({
            where: { id: req.params.reviewId }
        });
        console.log('삭제결과', result);
        console.log('req.params.productId확인', req.params.productId);

        result = await Review.findAll({
            where: { productId: req.params.productId},
            include: [
                {
                    model: User,
                    attributes: ['user_id'],
                    paranoid: false  // 삭제된 회원의 글도 가져와야 한다
                },
                // { 
                //     model: Comment,
                //     include: [{
                //             model: User,
                //             attributes: ['user_id'],
                //             paranoid: false  // 삭제된 회원의 글도 가져와야 한다
                //     }],
                // }
            ],
            order: [['id', 'DESC']], // 리뷰는 최신순으로 가져온다(댓글은 반대)
            limit: 10
        });

        res.json({
            code: 200,
            result
        });
    } catch (err) {
        res.json(error);
        console.log('상품평 삭제 에러 발생', err);
        next(err);
    }
});

// 상품평 수정
// router.patch('/delete', async (req,res) => {
//     try {
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
router.get('/comments', async (req, res, next) => {
    try {
        const id = req.query.review_id;
        const result = await Comment.findAll({
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

        console.log('댓글 조회 결과', result);
        // 리뷰의 댓글이 없을 경우에는 [] 이 반환 -> 클라이언트에서 처리
        res.json({
            code: 200,
            result
        });
    } catch (err) {
        res.json(error);
        console.log('댓글 삭제 오류 발생', err);
        next(err);
    }
})

// 코멘트 작성하기
router.post('/comments', async (req, res, next) => {
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
                { 
                    model: User,
                    attributes: ['user_id'],
                    paranoid: false 
                }
            ],
            where: {
                reviewId: req.body.reviewId
            },
            order: [['id', 'ASC']],
        });

        res.status(201).json({
            code: 201,
            result
        });
    } catch (err) {
        res.json(error);
        console.log('코멘트 등록 에러 발생', err);
        next(err);
    }
})

// 코멘트 삭제하기
router.delete('/deleteComment/:reviewId/:commentId', async (req, res, next) => {
    try {
        console.log('파라미터, 리뷰', req.params.reviewId);
        let result = await Comment.destroy({
            where: { id: req.params.commentId }
        });
        console.log('코멘트 삭제 결과', result);

        // 새로 코멘트 리스트를 전달해준다
        result = await Comment.findAll({
            include: [
                {
                    model: User,
                    attributes: ['user_id'],
                    paranoid: false 
                }
            ],
            where: {
                reviewId: req.params.reviewId
            },
            order: [['id', 'ASC']],
        });

        res.json({
            code: 200,
            result
        });
    } catch (err) {
        res.json(error);
        console.log('코멘트 삭제 에러 발생', err);
        next(err);
    }
});

module.exports = router;
