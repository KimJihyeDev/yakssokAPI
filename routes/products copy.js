const express = require('express');
const router = express.Router();
// 시퀄라이즈 모듈 가져오기
const models = require('../models/index');
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = models.Sequelize.Op;
const Product = models.Product;
const Ingredient = models.Ingredient;
const Pictogram = models.Pictogram; // N:M 관계를 맺은 테이블
// 주의할 점은 새로 생긴 관계 테이블(product_pictograms)이 아니라
// 관계를 맺은 테이블을 사용한다는 점


// 메인 화면에 뿌려질 제품 리스트 가져오기
router.get('/', async (req, res, next) => {
    try {
        let products = await Product.findAll({
            order:[['id','DESC']], // 최신 제품 
            limit:12  // 제품 개수는 12개로 
        });
        console.log(products);
        res.json(products);
    } catch (err) {
        console.log(err);
    }
});

router.post('/',async(req,res,next)=>{

    try{
        console.log('리퀘스트객체'+req);
        console.log("리퀘스트바디"+req.body);
        let result = await Product.findOrCreate({
            where:{product_name:req.body.product_name},
            defaults: {
                parent_category: req.body.parent_category,
                child_category:req.body.child_category,
                product_name:req.body.product_name,
                product_image:req.body.product_image, 
                product_desc:req.body.product_desc, 
                suggested_use:req.body.suggested_use, 
                warnings:req.body.warnings, 
                servings:req.body.servings, 
                total_servings:req.body.total_servings, 
                other_ingredients:req.body.other_ingredients, 
            }
        })  // async를 선언한 함수가 끝났으므로 다시 async선언
        .spread(async (product,created) => {
            let productId;
            let pictogramId= [];
            if(created){
                let pictogram = req.body.pictogram;
                console.log(`픽토그램확인`)
                console.log(pictogram); // 결과는 내가 보낸 배열
                for(idx in pictogram ){
                    if(pictogram[idx] === ''){
                        continue;
                    }else{
                        var result = await Pictogram.findOne({
                            where:{ 'pictogram_name': pictogram[idx]}
                        })
                    }
                    console.log('결과출력')
                    console.log(result);
                    console.log(`id얻어옴`)
                    pictogramId.push(result.dataValues.id); // 픽토그램 id를 배열에 넣는다.
                    console.log(`내가 원하는거`);
                    console.log(pictogramId);
                }
                 // 다음은 위에서 작성한 상품의 id를 알아오자
                    result = await Product.findOne({
                        where:{'product_name':req.body.product_name}
                    })
                    console.log('결과출력')
                    console.log(result);
                    productId = result.dataValues.id;
                    console.log(`내가 원하는거`);
                    console.log(productId);

                    // id 둘 다 알아왔으므로 product_pictograms에 등록하기
                    for(idx in pictogramId){
                        sequelize.query(`INSERT INTO product_pictograms values(now(),now(),${productId},${pictogramId[idx]})`)
                        .then((results, metadata) => {
                            console.log(results) // result는 [ 0, 1 ]이 반환되는데 무슨 의미인지 모르겠음
                        })
                    }
                    // 다음은 성분테이블에 정보를 넣자
                    // ingredientsArr로 배열 타입이다
                    // productId 가 foreign key

            }else {
                res.json({
                    code:409,
                    message:'이미 등록된 상품입니다.'
                })
            }
        })
        
        
         
        // 반복문 돌려야 할 듯
        // req.body.pictogram -> 배열
        

        // res.status(200).json({
        //     message:'등록성공'
        // })

    } catch(err){
        console.log(err);
    }
})




module.exports = router;
