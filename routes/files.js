const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');
const router = express.Router();

// 업로드된 파일이 저장될 uplods 폴더를 서버에 자동생성
// fs.readdir('uploads',(error)=>{
//   if(error){
//     console.log('uploads 폴더 초기 생성');
//     fs.mkdirSync('uploads');
//   }
// });

// multypart 방식으로 파일업로드
// 제품 이미지 업로드
router.post('/upload', (req,res)=>{
  console.log('이미지 업로드 요청들어옴')
  const form =  new multiparty.Form({
    autoFiles:false, // 요청이 들어오면 파일을 자동으로 저장할지 설정
    // uploadDir: 'uploads', // 파일이 저장되는 경로
    uploadDir: 'public/images/products', // 파일이 저장되는 경로
    maxFilesSize: 5 * 1024 * 1024 // 파일의 최대 허용 사이즈 설정(5MB)
  });

  form.parse(req, (error, fields, files)=>{
    // 파일 전송이 요청되면 이곳으로 온다.
    // 에러, 필드정보, 파일 객체가 넘어온다.
    // files는 파일 객체. 
    // productImage input객체의 name 속성에서 정한 이름
    // file객체에 productImage이름으로 배열이 생성되고 그 안에 객체가 들어있다.
    const path = files.productImage[0].path;
    console.log('파일 라우터, 입력받은 이미지정보출력',path);

      res.json({
      code:200,
      message:`${ path }`
    });
  })
});

// 픽토그램 업로드
router.post('/upload/pictograms',(req,res)=>{
  const form = new multiparty.Form({
    autoFiles: false, // 요청이 들어오면 파일을 자동으로 저장할지 설정
    uploadDir: 'public/images/pictograms', // 파일이 저장되는 경로
    maxFilesSize: 5 * 1024 * 1024  // 파일의 최대 허용 사이즈 설정(5MB)
  });
  console.log('픽토그램 업로드 요청', form);
  
  form.parse(req,(error, fields, files)=>{
    const path = files.image_path[0].path;
    console.log(files);

      res.json({
      code:200,
      message:`${ path }`
    });
  })
});


module.exports = router;



