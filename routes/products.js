const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;
const Product = models.Product;
const Ingredient = models.Ingredient;
const Pictogram = models.Pictogram; // N:M 관계를 맺은 테이블
const Review = models.Review; // 
const Comment = models.Comment;
const User = models.User;


// 메인 화면에 뿌려질 제품 리스트 가져오기
router.get('/', async (req, res, next) => {
    try {
        let products = await Product.findAll({
            order: [['id', 'DESC']], // 최신 제품 
            limit: 12  // 제품 개수는 12개로 
        });
        res.json(products);

    } catch(err) {
        res.json({
            code: 500,
            message: '서버에서 에러 발생'
        });
        console.log(err);
    }
});

// 관리자 페이지 제품 리스트 (한번에 10개씩 가져오기
// 페이징 이전에는 전부 가져오는 걸로
router.get('/all', async (req, res, next) => {
    try {
        let products = await Product.findAll({
            order: [['id', 'DESC']],
            // limit: 10
        });
        res.json(products);

    } catch (err) {
        res.json({
            code: 500,
            message: '서버에서 에러 발생'
        });
        console.log(err);
    }
});

// 관리자 사이트에서 제품 1개 읽어오기(수정페이지용)
router.get('/one', async (req, res) => {
    try {
        // const result = await Product.findOne({
        //     include: [
        //         { model: Ingredient },
        //         { model: Pictogram }
        //     ],
        //     where: { id: req.query.id }
        // })
        const result = await Product.findByPk(req.query.id, 
            {
                include: [
                    { model: Ingredient },
                    { model: Pictogram }
                ],
            });
        console.log(result);
        res.json(result);

    } catch(err) {
        res.json({
            code: 500,
            message: '서버에서 에러 발생'
        });
        console.log(err);
    }
});

// 제품 검색
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        console.log('제품검색')
        console.log(keyword)
        const result = await Product.findAll({
            where: {
                product_name: {
                    [Op.like]: `%${ keyword }%`
                }
            }
        });

        console.log('검색결과');
        console.log(result);
        // result.length > 0
        res.json(result)
        //     : res.json({
        //         message: '검색결과가 없습니다.'
        //     })

    } catch(err) {
        res.json({
            code: 500,
            message: '서버에러입니다.'
        });
        console.log(err);
    }
})

// 제품 등록 정보 수정(픽토그램, 성분 정보 제외)
router.patch('/modify', async (req, res) => {
    try {
        const result = Product.update(
            {
                parent_category: req.body.parent_category,
                child_category: req.body.child_category,
                product_name: req.body.product_name,
                product_image: req.body.product_image,
                product_desc: req.body.product_desc,
                suggested_use: req.body.suggested_use,
                warnings: req.body.warnings,
                servings: req.body.servings,
                total_servings: req.body.total_servings,
                other_ingredients: req.body.other_ingredients,

            },
            { where: { id: req.query.id } }
        );
        console.log('수정결과', result);
        res.json({
            code: 200,
            message: '상품정보 수정 성공'
        });
    } catch(err) {
        res.json({
            code: 500,
            message: '서버에러 발생'
        });
        console.log(err);
    }
});

// 제품 삭제
router.delete('/delete', async (req, res) => {
    try {
        const result = await Product.destroy({
            where: { id: req.query.id }
        })
        console.log('제품삭제 확인', result);

        res.json({
            code: 200,
            message: '삭제 성공',
        });

    } catch(err) {
        res.json({
            code: 500,
            message: '서버에러 발생'
        });
        console.log(err);
    }
})

// 카테고리별 제품 리스트
// parent_category = 2일 경우에는 child_category 조회X
router.get('/categories/:parent_id/:child_id', async (req, res) => {
    try {
        console.log('리퀘스트쿼리')
        console.log(req.query.offSet)
        // findAndCountAll로 전체개수를 알아내서 12개 이상이면
        // 클라이언트에서 더보기 버튼 활성화

        // and 조건은{ , }로 연결된다(Op.and 사용x)
        // 동물영양제 검색(id === '2')
        // 숫자가 아니라 문자열로 넘어오는데 주의
        if (req.params.parent_id === '2') {
            products = await Product.findAndCountAll({
                where: {
                    parent_category: req.params.parent_id
                },
                order: [['id', 'DESC']],
                offset: req.query.offSet * 12,
                limit: 12
            });
        } else { // 동물영양제 외의 카테고리
            products = await Product.findAndCountAll({
                where: { parent_category: req.params.parent_id, child_category: req.params.child_id },
                order: [['id', 'DESC']],
                offset: req.query.offSet * 12,
                limit: 12
            });
        }
        console.log('카테고리 검색 결과')
        console.log(products);
        res.json(products);

    } catch(err) {
        res.json({
            code: 500,
            message: '서버에서 에러 발생'
        });
        console.log(err);
    }
});

// 프론트에서 단일 상품 조회(3개의 테이블을 join)
// 와일드카드 패턴이 적용되었으므로 최하단에 작성(같은 전송방식에만 해당. get, post, patch...)
router.get('/:id', async (req, res) => {

    try {
        // 상품, 성분 정보 가져오기
        // 리뷰는 여기서 가져오면X. limit와 order조건도 줘야 하므로
        // const result = await Product.findOne({
        //     include: [
        //         { model: Ingredient },
        //         { model: Pictogram }
        //     ],
        //     where: { id: req.params.id },
        // })
        const result = await Product.findByPk(req.params.id,
            {
                include: [
                    { model: Ingredient },
                    { model: Pictogram }
                ],
            });
        console.log(`join 결과`)
        console.log(result);
        console.log('픽토그램 확인')
        console.log(result.dataValues.pictograms)

        // 성분 정보를 객체에 담는다

        let reviewInfo = await Review.findAll({
            include: [
                
                // { model: Comment }
            ],
            where: { productId: req.params.id },
            order: [['id', 'DESC']], // 리뷰는 최신순으로(댓글은 오름차순으로)
        });

        res.json(result);

    } catch(err) {
        res.json({
            code: 500,
            message: '서버에서 에러 발생'
        });
        console.log(err);
    }
})

// 상품등록
// 3개의 테이블에 데이터 등록
router.post('/', async (req, res) => {
    console.log(`성분확인`)
    console.log(req.body.ingredients);

    try {
        let result = await Product.findOrCreate({
            where: { product_name: req.body.product_name },
            defaults: {
                parent_category: req.body.parent_category,
                child_category: req.body.child_category,
                product_name: req.body.product_name,
                product_image: req.body.product_image,
                product_desc: req.body.product_desc,
                suggested_use: req.body.suggested_use,
                warnings: req.body.warnings,
                servings: req.body.servings,
                total_servings: req.body.total_servings,
                other_ingredients: req.body.other_ingredients,
            }
        })
            .spread(async (product, created) => {
                console.log('여기까지는 왔나', req.body.pictogram);
                let productId;
                let pictogramId = [];
                if (created) {
                    const pictogram = req.body.pictogram;

                    for (idx in pictogram) {
                        // null check
                        if (!pictogram[idx]) {
                            continue;
                        } else {
                                var result = await Pictogram.findOne({
                                where: { 'pictogram_name': pictogram[idx] }
                            })
                        }
                        console.log('픽토그램 등록', result);
                        pictogramId.push(result.dataValues.id); // 픽토그램 id를 배열에 넣는다.
                    }
                    result = await Product.findOne({
                        where: { 'product_name': req.body.product_name }
                    })
                    console.log(result);
                    productId = result.dataValues.id;
                    console.log(productId);

                    for (idx in pictogramId) {
                        sequelize.query(
                            `INSERT INTO product_pictograms VALUES(now(),now(),${ productId },${ pictogramId[idx] })`)
                            .then((results, metadata) => {
                                console.log(results)
                            })
                    }
                    let ingredient = req.body.ingredients;
                    console.log(`입력받은 성분`)
                    console.log(ingredient);
                    for (idx in ingredient) {
                        let result = await Ingredient.create({
                            ingredient: ingredient[idx].ingredient,
                            per_serving: ingredient[idx].per_serving,
                            daily_value: ingredient[idx].daily_value,
                            productId: productId
                        })
                        console.log(`성분정보`);
                        console.log(result);
                    }
                    res.json({
                        code: 200,
                        message: `등록성공`
                    })
                } else {
                    res.json({
                        code: 409,
                        message: '이미 등록된 상품입니다.'
                    });
                }
            })

    } catch(err) {
        res.json({
            code: 500,
            message: '서버 에러입니다.'
        });
        console.log(err);
    }
})


module.exports = router;
