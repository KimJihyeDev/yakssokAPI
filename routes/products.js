const express = require('express');
const router = express.Router();
// 시퀄라이즈 모듈 가져오기
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Product = models.Product;
const Ingredient = models.Ingredient;
const Pictograms = models.Pictogram; // N:M 관계를 맺은 테이블
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
      // 3개의 테이블에 데이터를 입력하고 그 결과를 받아온다.
      // 그 결과들을 어떻게 묶지? 배열? 객체? -> 객체로 해보자
    let returnObj  = {
        productObj:{},
        pictogramObj:{},
        ingredientObj:{}
    }

    try{
        console.log('리퀘스트객체'+req);
        console.log("리퀘스트바디"+req.body);
        let result = await Product.create({
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
        });

        console.log(result); // 리턴값은 객체로 각종 DB정보가 담겨져 온다
       
        res.status(200).json({
            message:'등록성공'
        })
         // returnObj.productObj = result; // 리턴할 객체에 추가
        // // 반복문 돌려야 할 듯
        // // req.body.pictogram -> 배열
        // let pictograms = req.body.pictogram;
        // for(idx in pictograms ){
        //     result = await Pictogram.findOne({
        //         where:{ 'pictogram_name':pictogram[idx]}
        //     })
        // }
        // console.log('여기서부터가 중요')
        // console.log(result); 

    } catch(err){
        console.log(err);
    }
})




module.exports = router;
