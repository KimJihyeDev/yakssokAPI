var express = require('express');
var router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const User = models.User // users 테이블 객체
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const { verifyToken, access_token } = require('./middleware');
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
router.post('/', async (req, res) => {

  // const { headers } = req
  // console.log(headers);
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
        message: '사용 중인 아이디입니다.'
      });
    }

    // 이메일 중복 검사
    const email = await User.findOne({
      where: { email: req.body.email }
    })

    if (email) {
      return res.json({
        code: 409,
        message: '가입된 이메일입니다.'
      });
    }

    // if문으로 처리. 클라이언트에서 이메일, id 인증됐는지 확인부터
    // 일단 그냥 해보자
    const hash = await bcrypt.hash(req.body.user_pwd, 12);


    const user = await User.create({
      // 만약 클라이언트에서 객체가 아닌 다른 형태로 건네주면
      // 어떻게 될까? -> 에러남(반드시 객체로 받아야 하는 듯)
      user_id: req.body.user_id,
      user_pwd: hash,
      email: req.body.email,
    })
    console.log('회원가입결과' + user);
    const { id } = await User.findOne({
      where: { user_id: req.body.user_id }
    });
    console.log(`~~~`);
    console.log(id);

    // 이 경우에는 뭐가 리턴될까?
    // 일단 async await 는 Promise 객체가 리턴
    // [object SequelizeInstance:user]가 리턴됨
    const token = access_token(user);
    let time = Date.now();
    // 토큰 삭제 판단을 위한 변수(유효기간은 토큰에서 설정)
    time = time + 3600000;

    res.status(201).json({
      code: 201,
      message: `회원가입 성공`,
      token,
      id,
      time
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
router.post('/login', async (req, res) => {
  try {
    // 아이디/ 이메일 사용자 정보를 조회
    // 탈퇴회원 선별도 신경쓸 것
    // id/email 둘 다로 검색하지만 받은 정보는 1개이므로
    // 이 정보로 or 검색을 실행한다.
    console.log('리퀘스트바디')
    console.log(req.body);
    const { user_id_email } = req.body;
    console.log('확인용')
    console.log(user_id_email);
    const user = await User.findOne({
      where: {
        [Op.or]: [{ user_id: req.body.user_id_email },
        { email: req.body.user_id_email }],
      }
    })

    if (user) {
      console.log('이용자 정보:')
      console.log(user);
      // result는 true/false
      const result = await bcrypt.compare(req.body.user_pwd, user.user_pwd);
      const id = user.id;
      if (result) {
        token = access_token(user);

        console.log('토큰확인');
        console.log(token);
        let time = Date.now();
        console.log('시간확인')
        console.log(time)
        time = time + 3600000; // 클라이언트에서 알 수 있도록 시간 설정
        console.log('시간확인')
        console.log(time)
        1582047352821
        res.json({
          code: 200,
          message: '로그인 성공',
          token,
          id,
          time
        })
      } else {
        res.json({
          code: 403,
          message: '아이디 또는 비밀번호를 확인해 주세요.'
        })
      }

    } else {
      // id, email 정보가 없는 경우
      // status(403)설정시 클라이언트에서 에러 메시지를 출력 못 함
      res.json({
        code: 403,
        message: '아이디 또는 비밀번호를 확인해 주세요.'
      })
    }

  } catch (err) {
    console.log(err);
    return res.statusCode(500).json({
      code: 500,
      message: '서버에러'
    })
  }
});

// 사용자 프로필 조회
// & 사용자 토큰 인증(분기로 2가지 다 처리)
router.get('/profile', verifyToken, async (req, res) => {
  console.log('프로필')
  console.log(req.decoded)
  // const payload = req.decoded; 

  const query = req.query.type;
  console.log('쿼리 확인');
  console.log(query)
  try {
    // 토큰이 만료되었는지 
    // 유효한 토큰인지 확인 -> middleware.js에서 하는 작업
    // 여기서는 토큰이 없는 상태에서의 접근만 차단
    const user = await User.findOne({
      where: {
        user_id: req.decoded.id,
      }
    });
    console.log('결과')
    console.log(user)
    //  비밀번호까지 전해주지X
    const { user_id, email } = user
    const id = user.id;
    if (user) {
      // 토큰 유효성 따지기 & 아이디만 조회용
      // 파라미터가 빈객체가 아니라면 id만 건네준다
      if (query === 'i') {
        return res.json({
          code: 200,
          id: id
        });
      } else {  // 프로필 조회용
        return res.json({
          code: 200,
          user_id: user_id,
          email: email
        });
      }

    } else {
      return res.json({
        code: 403,
        message: '사용자 정보가 없습니다.'
      });
    }

  } catch (err) {
    console.log(err);
    res.json({
      code: 500,
      message: '서버에러'
    })
  }
})


module.exports = router;
