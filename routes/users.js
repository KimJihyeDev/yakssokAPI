var express = require('express');
var router = express.Router();
const models = require('../models/index');
const Sequelize = models.Sequelize;
const User = models.User // users 테이블 객체
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const { verifyToken, access_token } = require('./middleware');
const Op = models.Sequelize.Op;
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const error = {
  code: 500,
  message: '서버에서 에러가 발생했습니다.'
};


// 전체 회원의 목록 조회
router.get('/', async (req, res, next) => {
  try {
    let user = await User.findAll();
    res.json(user);

  } catch (err) {
    console.error(err);
    res.json(error);
    next(err);
  }
});

// 회원 가입
router.post('/', async (req, res, next) => {
  try {
    // 아이디 중복체크 
    const userId = await User.findOne({
      where: { user_id: req.body.user_id }
    })

    if (userId) {
      return res.json({
        code: 409,
        message: '사용인 아이디입니다.'
      });
    }

    // 이메일 중복 검사
    const email = await User.findOne({
      where: { email: req.body.email }
    })

    if (email) {
      return res.json({
        code: 409,
        message: '이미 사용인 이메일입니다.'
      });
    }

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

    // [object SequelizeInstance:user]가 리턴됨
    const token = access_token(user);

    res.status(201).json({
      code: 201,
      message: `회원가입 성공`,
      token,
      id
    });
  } catch (err) {
    console.log('회원가입 에러발생', err);
    res.json(error);
    next(err);
  }
});

// 로그인
router.post('/login', async (req, res, next) => {
  try {
    // 아이디/ 이메일 사용자 정보를 조회
    // id/email 둘 다로 검색하지만 받은 정보는 1개이므로
    // 이 정보로 or 검색을 실행한다.
    const { user_id_email } = req.body;
    console.log('로그인 id/email 확인', user_id_email);

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { user_id: req.body.user_id_email },
          { email: req.body.user_id_email }
        ],
      }
    })

    if (user) {
      // result는 true/false
      const result = await bcrypt.compare(req.body.user_pwd, user.user_pwd);
      const id = user.id;
      if (result) {
        token = access_token(user);

        res.json({
          code: 200,
          message: '로그인 성공',
          token,
          id,
        });
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
    console.log('로그인 에러 발생', err);
    res.json(error);
    next(err);
  }
});

// 사용자 프로필 조회(토큰 유효성은 token에서 처리)
router.post('/profile', async (req, res, next) => {
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
  } catch (err) {
    console.log('프로필 조회 에러 발생', err);
    res.json(error);
    next(err);
  }
});

// 토큰 유효성 확인용 라우트
router.get('/token', verifyToken, async (req, res, next) => {
  try {
    // 유효한 토큰인지 확인 -> middleware.js에서 하는 작업
    const user = await User.findByPk(req.decoded.id);
    console.log('토큰 유효성 검사 후 유저 조회 결과', user);

    const { id, user_id } = user;

    if (user) {
      // 토큰 유효성 따지기 & 아이디 조회용
      // 파라미터가 빈객체가 아니라면 id와 usr_id만 건네준다
      res.json({
        code: 200,
        id,
        user_id
      });
    } else {
      res.json({
        code: 403,
        message: '사용자 정보가 없습니다.'
      });
    }
  } catch (err) {
    console.log('토큰 검증 에러발생', err);
    res.json(error);
    next(err);
  }
});

// 회원정보 수정(비밀번호, 이메일)
// 이미 가입된 이메일일 경우 수정x
// router.patch('/modify/:id', verifyToken, async (req, res, next) => {
router.patch('/modify/:id', async (req, res, next) => {
  console.log('회원정보수정')
  const type = req.query.type;
  console.log('비밀번호 수정 파라미터 확인', req.params.id);
  console.log('email확인', req.body.email);

  try {
    if (type === 'e') {
      // 사용인 이메일인지 확인 후 아니라면 update
      // 사용이라면 메시지 리턴

      const find = await User.findOne({
        where: { email: req.body.email }
      });
      console.log('이메일 상태 확인', find)
      if (find) {
        res.json({
          code: 409,
          message: '이미 사용인 이메일입니다.'
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
    } else if (type === 'p') {
      // 현재 비밀번호랑 일치하는지 확인
      // 비밀번호 암호화 해서 비교해야 함
      // 그 후에 새 비밀번호로 변경(암호화)
      console.log('비밀번호 비교', req.params.id);
      const user = await User.findByPk(req.params.id);
      const compare = await bcrypt.compare(req.body.currentPwd, user.user_pwd);
      console.log('비밀번호 비교 결과', compare);

      if (compare) {
        const hash = await bcrypt.hash(req.body.pwd, 12);

        const result = await User.update(
          {
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
  } catch (err) {
    res.json(error);
    console.log('회원 정보 수정 에러 발생.', err);
    next(err);
  }
});

// 비밀번호 찾기 이메일 전송 라우트
// 1. 사용자한테서 전송받은 이메일을 찾는다
// 2. 가입된 이메일이면 비밀번호 재설정 링크를 전송
// 3. 가입된 이메일이 아니면 에러 메시지를 보낸다.
router.post('/resetPwd', async (req, res, next) => {
  console.log('비번재설정 이메일', req.body.email);
  const email = req.body.email;
  try {
    const user = await User.findOne({
      where: { email }
    });
    console.log('회원 가입 확인', user);

    if (user) {
      // 비밀번호 재설정 토큰 발급 
      const token = jwt.sign(
        {
          email
        },
        process.env.YAKSSOK_SECRET,
        {
          expiresIn: '1m', // 1분 설정
          issuer: 'yakssok'
        });

      // 이메일 발송 객체를 생성
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
          user: 'yakssok2020@gmail.com',  // 이메일 계정
          pass: process.env.YAKSSOK_EMAIL // 이메일 계정의 비밀번호
        }
      });

      const mailOptions = {
        from: `약정보쏙쏙<yakssock2020@gmail.com>`,    // 발송 메일 주소(위에서 작성한 gmail 계정 아이디)
        to: email,                     // 수신 메일 주소
        subject: 'yakssok 회원 비밀번호 재설정',   // 제목
        html: `<p>비밀 번호를 재설정 하기 위해 아래의 링크를 클릭해주세요.
                아래 링크는 테스트 환경(포트폴리오)에서는 1분 동안만 유효합니다.</p>
                <a href="${ process.env.YAKSSOK_FRONT }/auth/${ token }">
                ${ process.env.YAKSSOK_FRONT }/auth/${ token }</a>`
      };
      // 메일을 발송
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        }
        else {
          console.log('Email sent: ' + info.response);
          return res.json({
            code: 200,
            message: '비밀번호 재설정 메일을 전송하였습니다.'
          });
        }
      });
    } else {
      res.json({
        code: 403,
        message: '가입된 이메일 주소가 아닙니다. 이메일 주소를 확인해 주세요.'
      });
    }
  } catch (err) {
    res.json(error);
    console.log('비밀번호 변경 이메일에서 에러 발생', err);
    next(err);
  }
});

router.get('/authToken', verifyToken, (req, res, next) => {
  console.log('토큰에서 추출한 email확인', req.decoded.email);
  // 이메일을 user에서 찾아서
  
}); 

// 비밀번호 재설정 토큰 인증
// 비밀번호 찾기(새 비밀번호 설정)
router.patch('/updatePwd', verifyToken, async (req, res, next) => {
  console.log('토큰에서 추출한 email확인', req.decoded.email);
  try {
    const hash = await bcrypt.hash(req.body.pwd, 12);

    const user = await User.update(
      {
        user_pwd: hash
      },
      { 
        where: { email: req.decoded.email }
      });
      console.log('비밀번호 재설정 결과', user);
      res.json({
        code: 200,
        message: '비밀번호를 재설정하였습니다.'
      });
  } catch (err) {
    res.json(error);
    console.log('비밀번호 찾기 에러 발생', err);
    next(err);
  }
});

// 회원탈퇴
router.delete('/deleteAccount/:id', async (req, res, next) => {
  try {
    const result = await User.destroy(
      {
        where: { id: req.params.id }
      });
    console.log('회원 탈퇴 확인', result);

    res.json({
      code: 200,
      message: '회원탈퇴 요청이 처리되었습니다.'
    });

  } catch (err) {
    res.json(error);
    console.log('탈퇴 처리 에러 발생', err);
    next(err);
  }
});


module.exports = router;
