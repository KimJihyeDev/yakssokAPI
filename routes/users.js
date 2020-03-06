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

  } catch(err) {
    res.json({
      code: 500,
      message: '서버에서 에러가 발생했습니다.'
    });
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
        message: '이미 사용 중인 이메일입니다.'
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

    // 이 경우에는 뭐가 리턴될까?
    // 일단 async await 는 Promise 객체가 리턴
    // [object SequelizeInstance:user]가 리턴됨
    const token = access_token(user);

    res.status(201).json({
      code: 201,
      message: `회원가입 성공`,
      token,
      id
    });

  } catch(err) {
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
    // id/email 둘 다로 검색하지만 받은 정보는 1개이므로
    // 이 정보로 or 검색을 실행한다.
    const { user_id_email } = req.body;
    console.log('확인용')
    console.log(user_id_email);
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { user_id: req.body.user_id_email },
          { email: req.body.user_id_email }
        ],
      }
    })

    if(user) {
      console.log('이용자 정보:')
      console.log(user);
      // result는 true/false
      const result = await bcrypt.compare(req.body.user_pwd, user.user_pwd);
      const id = user.id;
      if (result) {
        token = access_token(user);

        console.log('토큰확인');
        console.log(token);
        res.json({
          code: 200,
          message: '로그인 성공',
          token,
          id,
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

  } catch(err) {
    console.log(err);
    return res.statusCode(500).json({
      code: 500,
      message: '서버에러'
    })
  }
});

// 사용자 프로필 조회(토큰 유효성은 token에서 처리)
router.post('/profile', async (req, res) => {

  try {
    const user = await User.findByPk(req.body.id);
    console.log('프로필 조회 결과', user);

    //  비밀번호까지 전해주지X
    const { id, user_id, email } = user;

    if (user) {
      return res.json({
          code: 200,
          email
      });
    } 
    else {
      return res.json({
        code: 403,
        message: '사용자 정보가 없습니다.'
      });
    }
  } catch(err) {
    console.log(err);
    res.json({
      code: 500,
      message: '서버에러'
    })
  }
});

// 토큰 유효성 확인용 라우트
router.get('/token', verifyToken, async (req, res) => {
  try {
    // 유효한 토큰인지 확인 -> middleware.js에서 하는 작업
    const user = await User.findByPk(req.decoded.id);
    console.log('토큰 유효성 검사 후 유저 조회 결과', user);

    const { id, user_id } = user;

    if (user) {
      // 토큰 유효성 따지기 & 아이디 조회용
      // 파라미터가 빈객체가 아니라면 id와 usr_id만 건네준다
      return res.json({
        code: 200,
        id,
        user_id
      });

    } else {
      return res.json({
        code: 403,
        message: '사용자 정보가 없습니다.'
      });
    }

  } catch(err) {
    console.log(err);
    res.json({
      code: 500,
      message: '서버에러'
    })
  }
});

// 회원정보 수정(비밀번호, 이메일)
// 이미 가입된 이메일일 경우 수정x
// router.patch('/modify/:id', verifyToken, async (req, res) => {
router.patch('/modify/:id', async (req, res) => {
  console.log('회원정보수정')
  const type = req.query.type;
  console.log('비밀번호 수정 파라미터 확인', req.params.id);
  console.log('email확인', req.body.email);

  try {
    if(type === 'e') {
      // 사용 중인 이메일인지 확인 후 아니라면 update
      // 사용 중이라면 메시지 리턴

      const find = await User.findOne({
        where: { email: req.body.email }
      });
      console.log('이메일 상태 확인', find)
      if(find) {
        res.json({
          code: 409,
          message: '이미 사용 중인 이메일입니다.'
        });
      } else {
        const result = await User.update({
          email: req.body.email,
        }, 
        { 
          where: { id: req.params.id }
        });

        console.log('이메일 업데이트 확인', result);
        res.json({
          code: 200,
          message: '이메일을 변경하였습니다.',
          result
        });
      }

    } else if(type === 'p') {
      // 현재 비밀번호랑 일치하는지 확인
      // 비밀번호 암호화 해서 비교해야 함
      // 그 후에 새 비밀번호로 변경(암호화)
      console.log('비밀번호 비교', req.params.id);
      const user = await User.findByPk(req.params.id);
      const compare = await bcrypt.compare(req.body.currentPwd, user.user_pwd);
      console.log('비밀번호 비교 결과', compare);
      
      if(compare) {
        const hash = await bcrypt.hash(req.body.pwd, 12);

        const result = await User.update({
          user_pwd: hash
        }, 
        { 
          where: { id: req.params.id }
        });
        
        res.json({
          code: 200,
          message: '비밀번호가 변경되었습니다.',
          result
        });

      } else {
        res.json({
          code: 403,
          message: '비밀번호가 일치하지 않습니다. 비밀번호를 확인해 주세요.'
        });
      }
    }
  } catch(err) {
    res.json({
      code: 500,
      message: '서버에서 에러 발생'
    });
    console.log(err);
  }
});

// 비밀번호 찾기
router.patch('/updatePwd', async (req, res) => {
  try {

  } catch(err) {
    res.json({
      code: 500,
      message: '서버에서 에러가 발생했습니다.'
    });
    console.log(err);
  }
});

// 회원탈퇴
router.delete('/deleteAccount/:id', async (req, res) => {
  try {

  } catch(err) {
    res.json({
      code: 500,
      message: '서버에서 에러 발생'
    });
    console.log(err);
  }
});


module.exports = router;
