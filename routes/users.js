var express = require('express');
var router = express.Router();
const models = require('../models/index');
const User = models.User // users 테이블 객체
const bcrypt = require('bcrypt');
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
          message: '사용인 중인 아이디입니다.'
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

      // 단방향 암호화(복호화불가)
      const hash = await bcrypt.hash(req.body.user_pwd, 12);

      const user = await User.create({
        user_id: req.body.user_id,
        user_pwd: hash,
        email: req.body.email,
      })

      const { id } = await User.findOne({
        where: { user_id: req.body.user_id }
      });

      // 액세스 토큰 발급
      const token = access_token(user);
      // const token = access_token(id);

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

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { user_id: req.body.user_id_email },
          { email: req.body.user_id_email }
        ],
      }
    })

    if (user) {
      const result = await bcrypt.compare(req.body.user_pwd, user.user_pwd);
      const id = user.id;
      if (result) {
        token = access_token(id);

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

// 사용자 프로필 조회
router.post('/profile', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.body.id, {
      attributes: ['email']
    });

    if (user) {
      res.json({
        code: 200,
        user
      });
    }
    else {
      res.json({
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
    const user = await User.findByPk(req.decoded.id);

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
// 이미 다른 회원이 사용 중인 이메일인지 체크
router.patch('/modify/:id', async (req, res, next) => {
  const type = req.query.type;

  try {
    if (type === 'e') {

      const find = await User.findOne({
        where: { email: req.body.email }
      });

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

        res.json({
          code: 200,
          message: '이메일을 변경하였습니다.',
          result
        });
      }
    } else if (type === 'p') {

      const user = await User.findByPk(req.params.id);
      const compare = await bcrypt.compare(req.body.currentPwd, user.user_pwd);

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
router.post('/resetPwd', async (req, res, next) => {
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
          res.json({
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

// 이메일 토큰 인증 라우터(페이지 진입시 확인)
router.get('/authToken', verifyToken, (req, res, next) => {
  console.log('토큰에서 추출한 email확인', req.decoded.email);
  
}); 

// 비밀번호 재설정 토큰 인증(비밀번호 재설정시 확인)
// 비밀번호 찾기(새 비밀번호 설정)
router.patch('/updatePwd', verifyToken, async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.pwd, 12);

    const user = await User.update(
      {
        user_pwd: hash
      },
      { 
        where: { email: req.decoded.email }
      });
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
