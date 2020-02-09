const express = require('express');
const router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = models.Sequelize.Op;
const Product = models.Product;
const Ingredient = models.Ingredient;
const Pictogram = models.Pictogram; // N:M 관계를 맺은 테이블


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

// 단일 상품 조회
router.get('/:id', async(req,res) => {
    // 클라이언트에 전송할 객체
    let resultObj = {
        product_ingredients:[],
        pictograms:[],
    }
    try{
        // 상품, 성분 정보 가져오기
        let result = await Product.findAll({
            include: { model: Ingredient },
            where: { id: req.params.id }
        })
        console.log(`join 결과`)
        console.log(result);
        resultObj.product_ingredients = result;
        console.log(`배열입력확인`)
        console.log(resultObj.product_ingredients);
        
        result = await Product.findOne({  
            where:{id: req.params.id }
        });
        // 픽토그램 조회
        const pictograms = await result.getPictograms();
        console.log(`픽토그램결과`)
        console.log(pictograms);
        resultObj.pictograms = pictograms;
        
        res.json(resultObj);
        
    }catch(err){
        console.log(err);
    }
})

// 상품등록
// 3개의 테이블에 데이터 등록
router.post('/',async(req,res,next)=>{
    console.log(`성분확인`)
    console.log(req.body.ingredientsArr);

    try{
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
        })  
        .spread(async (product,created) => {
            let productId;
            let pictogramId= [];
            if(created){
                let pictogram = req.body.pictogram;

                for(idx in pictogram ){
                    if(pictogram[idx] === ''){
                        continue;
                    }else{
                        var result = await Pictogram.findOne({
                            where:{ 'pictogram_name': pictogram[idx]}
                        })
                    }
                    console.log(result);
                    pictogramId.push(result.dataValues.id); // 픽토그램 id를 배열에 넣는다.
                }
                    result = await Product.findOne({
                        where:{'product_name':req.body.product_name}
                    })
                    console.log(result);
                    productId = result.dataValues.id;
                    console.log(productId);

                    for(idx in pictogramId){
                        sequelize.query(`INSERT INTO product_pictograms values(now(),now(),${productId},${pictogramId[idx]})`)
                        .then((results, metadata) => {
                            console.log(results) 
                        })
                    }

                    let ingredient = req.body.ingredientsArr;
                    console.log(`입력받은 성분`)
                    console.log(ingredient);
                    for(idx in ingredient){
                        let result = await Ingredient.create({
                            ingredient:ingredient[idx].ingredient,
                            per_serving:ingredient[idx].amountsPerServing,
                            daily_value:ingredient[idx].dailyValue,
                            productId:productId
                        })
                        console.log(`성분정보`);
                        console.log(result);
                    }
                    res.json({
                        code:200,
                        message:`등록성공`
                    })
            }else {
                res.json({
                    code:409,
                    message:'이미 등록된 상품입니다.'
                })
            }
        })
    } catch(err){
        console.log(err);
    }
})

// router.get('/test',async(req,res)=>{
//     try{
//         const 

//     }catch(err){
//         console.log(err);
//     }
// })

module.exports = router;
