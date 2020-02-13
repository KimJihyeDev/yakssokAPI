var express = require('express');
var router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const User = models.User // users 테이블 객체
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middleware');
const Op = models.Sequelize.Op;

// 전체 회원의 목록 조회
router.get('/', async (req, res, next) => {
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
router.post('/', async (req, res, next) => {
  try {
    // 아이디 중복체크 
    const userId = await User.findOne({
      where: { user_id: req.body.user_id }
    })
    console.log('아이디 중복체크 결과');
    console.log(userId);
    // 검색결과가 있다 = 이미 가입된 아이디
    if (userId) {
      return res.json({
        code: 409,
        message: '사용 중인 아이디'
      });
    }

    // 이메일 중복 검사
    const email = await User.findOne({
      where: { email: req.body.email }
    })

    if (email) {
      return res.json({
        code: 409,
        message: '가입된 이메일'
      });
    }

    // if문으로 처리. 클라이언트에서 이메일, id 인증됐는지 확인부터
    // 일단 그냥 해보자
    const hash = await bcrypt.hash(req.body.user_pwd, 12);


    const result = await User.create({
      // 만약 클라이언트에서 객체가 아닌 다른 형태로 건네주면
      // 어떻게 될까? -> 에러남(반드시 객체로 받아야 하는 듯)
      user_id: req.body.user_id,
      user_pwd: hash,
      email: req.body.email,
      userstate: true,
    })
    console.log('회원가입결과' + result);
    // 이 경우에는 뭐가 리턴될까?
    // 일단 async await 는 Promise 객체가 리턴
    // [object SequelizeInstance:user]가 리턴됨

    res.status(201).json({
      code: 201,
      message: `회원가입 성공`,
      test: result 
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      message: '서버에러 발생'
    })
  }
});

// 로그인
router.post('/login', async (req,res) => {
  try{
    // 아이디/ 이메일 사용자 정보를 조회
    // 탈퇴회원 선별도 신경쓸 것
    // id/email 둘 다로 검색하지만 받은 정보는 1개이므로
    // 이 정보로 or 검색을 실행한다.
    const user = await User.findOne({
      where: { 
        [Op.or]: [ { user_id: req.body.user_id_email },
                   { email: req.body.user_id_email }],
        userstate: true
      }
    })
    
    if(user){
      console.log('이용자 정보:')
      console.log(user);
      // result는 true/false?
      const result = await bcrypt.compare(req.body.user_pwd, user.user_pwd);
      

      if(result){
        // jwt 토큰 발급                         
        const token = jwt.sign({
          id: user.user_id,
          email: user.email
        }, process.env.YAKSSOK_SECRET, {
          expiresIn: '5m',
          issuer: 'YAKSSOK' 
        });

        res.json({
          code: 200,
          message: '로그인 성공',
          token: token,
        })
      }else{
        res.json({
          code: 403,
          message: '비밀번호 불일치'
        })
      } 

    }else{
      // id, email 정보가 없는 경우
      res.json({
        code: 403,
        message: '가입되지 않은 이용자'
      })
    }

  }catch(err){
    console.log(err);
    return res.statusCode(500).json({
      code: 500,
      message: '서버에러'
    })
  }
});

// 사용자 프로필 조회
router.post('/profile', verifyToken, async (req,res) => {
  // console.log('프로필')
  // const payload = req.decoded; 
  try{
// 토큰이 만료되었는지 
// 유효한 토큰인지 확인 -> middleware.js에서 하는 작업
// 여기서는 토큰이 없는 상태에서의 접근만 차단
    const user = await User.findOne({
      where: {
        id: req.decodeed.id
      }
    });

    if(user){
      return res.json({
        code: 200,
        result: user,
        payload: test
      });
    }else{
      return res.json({
        code: 500,
        message: '사용자 정보 없음'
      });
    }

  }catch(err){
    console.log(err);
    res.json({
      code: 500,
      message: '서버에러'
    })
  }
})

// 토큰 유효성 검사
router.get('/token', verifyToken, async (req, res) => {
  try{
    // 토큰 유효성을 검사하기 위한 라우터
    // 토큰이 유효하지 않은 경우, 만료된 경우에는
    // verifyToken(middleware.js)에서 처리한다.
    res.json({
      code: 200,
      message: '토큰 인증 성공'
    })
  }catch(err){
    console.log(err);
  }
});

module.exports = router;
