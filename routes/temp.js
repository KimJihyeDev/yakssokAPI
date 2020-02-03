
var express  = require('express');
//const Sequelize = require('sequelize');

//라우터에서 사용하고자 하는 모델 객체를 조회한다.
const models = require('../models/index.js');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;

var Article = require('../models/index.js').Article;
var Board = require('../models/index.js').Board;
var Temp = models.Temp;

//라우터 객체 생성
var router = express.Router();
  
  
//게시글등록 기능
router.post('/',function(req,res,next){

    Temp.create({
        test:req.body.test
  })
  .then((result) =>{
    console.log(result);
    res.status(201).json(result);
  })
  .catch((err) => {
    console.error(err);
    next(err);
  })
  
  });
  


//사용자 정보관리 전용 User라우터를 외부에 노출한다.
module.exports = router;


