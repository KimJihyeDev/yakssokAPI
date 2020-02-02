const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
var multiparty = require('multiparty');

const router = express.Router();

//업로드된 파일이 저장될 서버상 uploads폴더 자동생성
fs.readdir('uploads',(error) =>{
    if(error){
        console.log("uploads업로드 폴더가 없어 새로 생성합니다.");
        fs.mkdirSync('uploads');
    }
});



//multypart방식으로 파일업로드
//http://localhost/file/upload
router.post('/upload', function (req, res) {

  console.log("test");

  var form = new multiparty.Form({
      autoFiles: false, // 요청이 들어오면 파일을 자동으로 저장할 것인가
      // uploadDir: 'uploads/', // 파일이 저장되는 경로(프로젝트 내의 temp 폴더에 저장됩니다.)
      uploadDir: 'http://localhost:4000/test', // 파일이 저장되는 경로(프로젝트 내의 temp 폴더에 저장됩니다.)
      maxFilesSize: 1024 * 1024 * 5 // 허용 파일 사이즈 최대치
  });

  form.parse(req, function (error, fields, files) {
      // 파일 전송이 요청되면 이곳으로 온다.
      // 에러와 필드 정보, 파일 객체가 넘어온다.
      var path = files.fileInput[0].path;
      console.log(path);
      //res.send(path); // 파일과 예외 처리를 한 뒤 브라우저로 응답해준다.

      return res.json({
        code:200,
        message: path
      });
  });
});

module.exports = router;







