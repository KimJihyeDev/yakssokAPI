const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;
const Product = models.Product;
const Ingredient = models.Ingredient;
const Pictogram = models.Pictogram; // N:M 관계를 맺은 테이블
const error = {
    code: 500,
    message: '서버에서 에러가 발생했습니다.'
};


// 메인 화면에 뿌려질 제품 리스트 가져오기
router.get('/', async (req, res, next) => {
    try {
        let products = await Product.findAndCountAll({
            order: [['id', 'DESC']], // 최신 제품 
            limit: 12,  // 제품 개수는 12개씩
            offset: req.query.offSet * 12,
        });
        console.log('제품 검색', products);
        res.json({
            code: 200,
            products
        });
    } catch (err) {
        reres.json(error);
        console.log('상품 정보 로딩 에러 발생', err);
        next(err);
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
        res.json({
            code: 200,
            products
        });

    } catch (err) {
        res.json(error);
        console.log('제품 정보 에러 발생', err);
        next(err);
    }
});

// 제품 검색
router.get('/search', async (req, res, next) => {
    try {
        const keyword = req.query.keyword;
        console.log('제품검색')
        console.log(keyword)
        const result = await Product.findAll({
            where: {
                product_name: {
                    [Op.like]: `%${keyword}%`
                }
            }
        });

        console.log('검색결과', result);
        // result.length > 0
        res.json({
            code: 200,
            result
        });
    } catch (err) {
        res.json(error);
        console.log('제품 검색 에러 발생', err);
        next(err);
    }
})

// 제품 등록 정보 수정(픽토그램, 성분 정보 제외)
router.patch('/modify', async (req, res, next) => {
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
    } catch (err) {
        res.json(error);
        console.log('제품 정보 수정 에러 발생', err);
        next(err);
    }
});

// 제품 삭제
router.delete('/delete', async (req, res, next) => {
    try {
        const result = await Product.destroy({
            where: { id: req.query.id }
        })
        console.log('제품삭제 확인', result);

        res.json({
            code: 200
        });
    } catch (err) {
        res.json(error);
        console.log('제품 삭제 에러 발생', err);
        next(err);
    }
})

// 카테고리별 제품 리스트
// parent_category = 2일 경우에는 child_category 조회X
router.get('/categories/:parent_id/:child_id', async (req, res, next) => {
    try {
        console.log('리퀘스트쿼리')
        console.log(req.query.offSet)
        // findAndCountAll로 전체개수를 알아내서 12개 이상이면
        // 클라이언트에서 더보기 버튼 활성화

        // and 조건은{ , }로 연결된다(Op.and 사용x)
        // 동물영양제 검색(id === '2')
        // 숫자가 아니라 문자열로 넘어오는데 주의
        if (req.params.parent_id == 2) {
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
        res.json({
            code: 200,
            products
        });
    } catch (err) {
        res.json(error);
        console.log('카테고리 검색 에러 발생', err);
        next(err);
    }
});

// 단일 상품 조회
// 와일드카드 패턴이 적용되었으므로 최하단에 작성(같은 전송방식에만 해당. get, post, patch...)
router.get('/:id', async (req, res, next) => {
    try {
        // 상품, 성분 정보 가져오기
        // 리뷰는 여기서 가져오면X. limit와 order조건도 줘야 하므로
        const product = await Product.findByPk(req.params.id,
            {
                include: [
                    { model: Ingredient },
                    { model: Pictogram }
                ],
            });

        res.json({
            code: 200,
            product
        });
    } catch (err) {
        res.json(error);
        console.log('단일 상품 조회 에러 발생', err);
        next(err);
    }
})

// 상품등록
router.post('/', async (req, res, next) => {
    try {
        const isProduct = await Product.findOrCreate({
            where: {
                product_name: req.body.product_name
            },
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
            .spread(async (find, created) => {
                // find의 리턴값은 제품 객체
                // created의 경우에도 find는 리턴되므로 주의
                // created의 리턴값은 boolean

                if(!created) {
                    res.json({
                        code: 409,
                        message: '이미 등록된 상품입니다.'
                    });
                }

                let productId;
                let pictogramId = [];

                if (created) {
                    // 등록한 제품의 id를 알아낸다
                    productId = find.dataValues.id;

                    const pictogram = req.body.pictogram;

                    // 픽토그램 처리
                    for (idx in pictogram) {
                        // null check
                        if (!pictogram[idx]) {
                            continue;
                        } else {
                            var result = await Pictogram.findOne({
                                where: { 'pictogram_name': pictogram[idx] },
                                attributes: ['id'],
                            })
                        }
                        pictogramId.push(result.dataValues.id); 
                    }

                    for (idx in pictogramId) {
                        sequelize.query(
                            `INSERT INTO product_pictograms VALUES(now(),now(),${ productId },${ pictogramId[idx] })`)
                            .then((results, metadata) => {
                            }
                        )
                    }

                    const ingredients = req.body.ingredients;
                    console.log(`입력받은 성분`, ingredients);

                    for (idx in ingredients) {
                        result = await Ingredient.create({
                        ingredient: ingredients[idx].ingredient,
                        per_serving: ingredients[idx].per_serving,
                        daily_value: ingredients[idx].daily_value,
                        productId: productId
                        })
                    }

                    res.json({
                        code: 200
                    });
                }
            })
    } catch (err) {
        res.json(error);
        console.log('상품 등록 에러 발생', err);
        next(err);
    }
})


module.exports = router;
