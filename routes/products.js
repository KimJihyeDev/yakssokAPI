const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = models.Sequelize.Op;
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
    } catch (err) {
        console.log(err);
    }
});

// 관리자 페이지 제품 리스트 (한번에 10개씩 가져오기)
router.get('/all', async (req, res, next) => {
    try {
        let products = await Product.findAll({
            order: [['id', 'DESC']],
            limit: 10
        });
        res.json(products);
    } catch (err) {
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

    } catch (err) {
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
    } catch (err) {
        console.log(err);
    }
});

// 단일 상품 조회(3개의 테이블을 join)
// 와일드카드 패턴이 적용되었으므로 최하단에 작성(같은 전송방식에만 해당. get, post, patch...)
router.get('/:id', async (req, res) => {
    let resultObj = {};

    try {
        // 상품, 성분 정보 가져오기
        // 리뷰는 여기서 가져오면X. limit와 order조건도 줘야 하므로
        const result = await Product.findOne({
            include: [
                { model: Ingredient }, 
                { model: Pictogram }
            ],
            where: { id: req.params.id },
        })
        console.log(`join 결과`)
        console.log(result);
        console.log('픽토그램 확인')
        console.log(result.dataValues.pictograms)

        // 성분 정보를 객체에 담는다
        resultObj.productInfo = result;

        // product_id를 이용하여 review의 정보를 가져온다
        // 이 부분을 리뷰를 추가하는 부분에서 불러보자
        // 이게 리뷰 리스트를 만드는 코드였으니 되겠지
        // 1. 리뷰를 작성한다(reviws -> post에서 실행)
        // 2. 작성한 리뷰를 리뷰 아래와 같이 검색한다
        // 3. 리턴한다
        let reviewInfo = await Review.findAll({
            include: [
                { model: User }, 
                { model: Comment }
            ],
            where: { productId: req.params.id },
            order: [['id', 'DESC']], // 리뷰는 최신순으로(댓글은 오름차순으로)
        });

        //  가져온 User객체에서 user_id만 추출한 후 삭제
        if (reviewInfo.length > 0) {
            reviewInfo.forEach(item => {
                item.dataValues.user_id = item.dataValues.user.user_id;
                delete item.dataValues.user
            });
        }
        
        // 삭제한 후에 review도 resultObj에 추가
        // review가 없다면 reviewInfo 는 null?
        resultObj.reviewInfo = reviewInfo;
        console.log('삭제확인')
        console.log(reviewInfo[0])

        // review가 없을 때도 처리
        // 빈 배열인지 확인
        // if (reviewInfo.length > 0) {
        //     console.log('user_id 값')
        //     console.log(reviewInfo);
        // } else {
        //     console.log('댓글이 없습니다')
        // }
        res.json(resultObj);

    } catch (err) {
        console.log(err);
    }
})

// 상품등록
// 3개의 테이블에 데이터 등록
router.post('/', async (req, res, next) => {
    console.log(`성분확인`)
    console.log(req.body.ingredientsArr);

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
                let productId;
                let pictogramId = [];
                if (created) {
                    let pictogram = req.body.pictogram;

                    for (idx in pictogram) {
                        // null check
                        if (!pictogram[idx]) {
                            continue;
                        } else {
                            var result = await Pictogram.findOne({
                                where: { 'pictogram_name': pictogram[idx] }
                            })
                        }
                        console.log(result);
                        pictogramId.push(result.dataValues.id); // 픽토그램 id를 배열에 넣는다.
                    }
                    result = await Product.findOne({
                        where: { 'product_name': req.body.product_name }
                    })
                    console.log(result);
                    productId = result.dataValues.id;
                    console.log(productId);

                    for (idx in pictogramId) {
                        sequelize.query(`INSERT INTO product_pictograms VALUES(now(),now(),${productId},${pictogramId[idx]})`)
                            .then((results, metadata) => {
                                console.log(results)
                            })
                    }

                    let ingredient = req.body.ingredientsArr;
                    console.log(`입력받은 성분`)
                    console.log(ingredient);
                    for (idx in ingredient) {
                        let result = await Ingredient.create({
                            ingredient: ingredient[idx].ingredient,
                            per_serving: ingredient[idx].per_serving,
                            daily_value: ingredient[idx].dailyValue,
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
                    })
                }
            })
    } catch (err) {
        console.log(err);
    }
})


module.exports = router;
