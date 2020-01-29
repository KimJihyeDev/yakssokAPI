const express = require('express');
const router = express.Router();
// 시퀄라이즈 모듈 가져오기
const models = require('../models/index');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;
const Product = models.Product;

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
        let result = await Product.Create({
            parent_cetegory: req.body.parent_cetegory,
            child_category:req.body.child_category,
            product_name:req.body.product_name,
            product_image:req.body.product_image, 
            product_desc:req.body.product_desc, 
            suggested_use:req.body.suggested_use, 
            warnings:req.body.warnings, 
            servings:req.body.servings, 
            total_servings:req.body.total_servings, 
            ingredients:req.body.ingredients, 
            other_ingredients:req.body.other_ingredients, 
            daily_value:req.body.daily_value, 
            hash_tag:req.body.hash_tag, 
            pictogram:req.body.pictogram,
            like:req.body.like, 
        });
        console.logt(result);

    } catch(err){
        console.log(err);
    }


})
module.exports = router;
