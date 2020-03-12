const express = require('express');
const router = express.Router();
// 시퀄라이즈 모듈 가져오기
const models = require('../models/index');
const Pictogram = models.Pictogram;
const multer = require('multer');
const path = require('path');
const error = {
    code: 500,
    message: '서버에서 에러가 발생했습니다.'
};

// 모든 픽토그램의 정보 읽어오기
router.get('/', async (req, res) => {
    try {
        let pictograms = await Pictogram.findAll({
            order: [['pictogram_name', 'ASC']]
        });
        res.json({
            code: 200,
            pictograms
        }); 
    } catch (err) {
        res.json(error);
        console.log('픽토그램 로드 에러 발생', err);
        next(err);
    }
});

const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, 'public/images/pictograms/'); // 파일 저장 위치
      }, filename(req, file, cb) {
        const ext = path.extname(file.originalname); // path모듈을 이용해 확장자 추출
        cb(null, path.basename(file.originalname, ext) 
            + new Date().valueOf() + ext); // 파일명 중복을 막기 위해 기존 파일명 + 날짜
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 사이즈 제한
  });

// 픽토그램 등록
router.post('/', upload.single('pictogramImage'), async (req, res, next) => {
    try {
        const query = req.query.duplicate;

        // 쿼리가 있는 경우에는 중복체크를 하는 경우
        if(query) {
            const result = await Pictogram.findOne({
                where: { pictogram_name: req.body.pictogram_name }
            });

            if(result) {
                return res.json({
                            code: 409,
                            message: '이미 등록된 픽토그램입니다.'
                        });
            } else {
                return res.json({
                         code: 200
                       });
            }
        }
        // 쿼리가 없는 경우는 파일 업로드
        const pictogram = await Pictogram.create({
            pictogram_name: req.body.pictogram_name,
            image_path: req.file.filename
        });
        console.log('등록결과', pictogram);
        res.json({
            code: 200,
            message: '등록 성공'
        })
    } catch (err) {
        res.json(error);
        console.log('픽토그램 등록 에러 발생', err);
        next(err);
    }
});

module.exports = router;
