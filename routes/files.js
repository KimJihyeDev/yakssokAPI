const express = require('express');
const multiparty = require('multiparty');
const router = express.Router();

// multypart 방식으로 파일업로드
// 제품 이미지 업로드
router.post('/upload', (req,res)=>{
  console.log('이미지 업로드 요청들어옴')
  const form =  new multiparty.Form({
    autoFiles:false, // 요청이 들어오면 파일을 자동으로 저장할지 설정
    uploadDir: 'public/images/products', // 파일이 저장되는 경로
    maxFilesSize: 5 * 1024 * 1024 // 파일의 최대 허용 사이즈 설정(5MB)
  });

  form.parse(req, (error, fields, files)=>{
    const path = files.productImage[0].path;

      res.json({
      code:200,
      message:`${ path }`
    });

  })
});

module.exports = router;



