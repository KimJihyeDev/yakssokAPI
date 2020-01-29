var express = require('express');
var router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const User = models.User // users 테이블 객체

// 전체 회원의 목록 조회
router.get('/', async (req, res, next)=>{
  try {
    let user = await User.findAll();
    // user에 담긴 결과: users테이블의 전체 로우가 JSON 형태로
    // 배열에 담겨져 온다.
    // [{"id":"","email":""},{...}] 형태
    res.json(user);
  } catch (err) {
    console.error(err);
  }
});

// 회원 가입
router.post('/', async (req, res, next)=>{
  try {
    let result = User.create({
      // 만약 클라이언트에서 객체가 아닌 다른 형태로 건네주면
      // 어떻게 될까? -> 에러남(반드시 객체로 받아야 하는 듯)
      user_id: req.body.user_id,
      user_pwd: req.body.user_pwd,
      email: req.body.email,
      like_product: req.body.like_product
    })
    console.log('회원가입결과' + result);
    // 이 경우에는 뭐가 리턴될까?
    // 일단 async await 는 Promise 객체가 리턴

    // 회원가입결과[object Promise]로 출력됨 
    // 상태고드201은 created가 성공했을 경우
    res.status(201).json('회원가입결과' + result);

  } catch (err) {
    console.log(err);
  }
});



module.exports = router;
