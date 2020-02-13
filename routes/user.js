var express = require('express');

//단방향 암호화(복호화가 안되는) 노드팩키지 참조
const bcrypt = require('bcrypt');

//JWT 인증토큰 노드 팩키지 라이브러리 참조
const jwt = require('jsonwebtoken');

//모든 라우팅 모듈에서 토큰 기반 인증처리를  공통처리 해주는 부분
const { verifyToken } = require('./middlewares');


//라우터에서 사용하고자 하는 모델 객체를 조회한다.
var User = require('../models/index.js').User;

var router = express.Router();

/* 
사용자 로그인 페이지 
 http://www.test.com/user/login
*/
router.get('/login', function(req, res, next) {
  res.render('user/login');
});

/* 
사용자 가입 화면  
 http://www.test.com/user/entry
*/
router.get('/entry', function(req, res, next) {
    res.render('user/entry');
});

//신규 사용자 등록처리 OPEN API 
//브라우저에서 post방식으로 http://localhost/user 호출시 작동
router.post('/',async (req, res) => {

  try{
    const exUser = await User.findOne({ where: { email:req.body.email } });

    if (exUser) {
      console.log("이미 가입된 메일주소입니다.");
      return res.json({
        code:500,
        message:'이미 가입된 메일주소입니다.' 
      });
    }
    else
    {
      //단방향 암호화를 통해 난독화 및 복호화불가한 문자열로 변환
      const hash = await bcrypt.hash(req.body.userpwd, 12);

      const user = await User.create({
        email:req.body.email,
        userpwd:hash,
        nickname:req.body.username,
        entrytype:'local',
        snsid:'',
        username:req.body.username,
        telephone:'',
        photo:'sample.png',
        lastip:'127.0.0.1',
        usertype:'u',
        userstate:'a',
      });

   
      return res.json({
        code:200,
        result:user 
      });

    }
  }catch(err){
    console.log(error);
    return res.status(500).json({ code:500,message:'서버에러발생'});
  }
});


//일반 로그인 처리: 토큰 발급 없는 일반 로그인
//브라우저에서 post방식으로 http://localhost:3000/user/login 호출시 작동
router.post('/login',async (req, res) => {

  try
  {

    //동일 메일 아이디 사용자 정보 조회
    const exUser = await User.findOne(
      {
        attributes:['id','email','userpwd','nickname','entrytype','username','telephone','lastcontact'], 
        where: { email:req.body.email } 
      });


    if (exUser) {
      console.log(exUser);

      //DB 암호와 사용자 암호 비교
      const result = await bcrypt.compare(req.body.userpwd, exUser.userpwd);
      console.log(result);
      
      if(result)
      {
          return res.json({
            code:200,
            result:exUser 
          });
      }else{
          return res.json({
            code:500,
            message:'암호정보가 일치하지 않습니다.' 
          });
      }
   
    }
    else
    {  
      return res.json({
        code:500,
        message:'사용자 정보가 존재하지 않습니다.' 
      });

    }
  }catch(err){
    console.log(error);
    return res.status(500).json({ code:500,message:'서버에러발생'});
  }
});


//토큰 기반 로그인 처리 
//브라우저에서 post방식으로 http://localhost:3000/user/tlogin 호출시 작동
router.post('/tlogin',async (req, res) => {

  try
  {
    //동일 메일 아이디 사용자 정보 조회
    const exUser = await User.findOne(
      {
        attributes:['id','email','userpwd','nickname','entrytype','username','telephone','lastcontact'], 
        where: { email:req.body.email } 
      });


    if (exUser) {
      console.log("로그인 사용자정보",exUser);

      //DB 암호와 사용자 암호 비교
      const result = await bcrypt.compare(req.body.userpwd, exUser.userpwd);
      console.log("결과",result);
      console.log("JWT_SECRET",process.env.JWT_SECRET);
      
      //로그인 사용자의 아이디/암호가 일치하는 정상사용자 인경우 인증토큰 발급
      if(result)
      {
        //토큰 생성
        const token = jwt.sign({
          id: exUser.id,
          email: exUser.email,
          username:exUser.username,
        }, process.env.JWT_SECRET, {
          expiresIn: '120m', // 1분
          issuer: 'webzine',
        });
    
        //토큰 발급처리
        return res.json({
            code:200,
            result:token 
          });

      }else{
          return res.json({
            code:500,
            message:'암호정보가 일치하지 않습니다.' 
          });
      }
   
    }
    else
    {  
      return res.json({
        code:500,
        message:'사용자 정보가 존재하지 않습니다.' 
      });

    }
  }catch(err){
    console.log(err);
    return res.status(500).json({ code:500,message:'서버에러발생'});
  }
});


//테스트용 api
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});


//내개인정보조회 : api가 호출될때 등록된 미들웨어(verifyToken)를 먼저 실행하고 프로세스를 진행한다.
router.get('/profile',verifyToken,async (req, res) => {
  try
  {
    //토큰에서 디코딩된 사용자 정보조회
    //res.json(req.decoded);

    const user = await User.findOne({
      attributes:['email','nickname','entrytype','username'],
      where:{
        email:req.decoded.email,
        usertype:'u'
      }
    });

    if(user){
      return res.json({
        code:200,
        result:user 
      });
    }else{
      return res.json({
        code:500,
        message:'사용자 정보가 존재하지 않습니다.' 
      });

    }
  }catch(err){
    console.log(error);
    return res.status(500).json({ code:500,message:'서버에러발생'});
  }

});













module.exports = router;
