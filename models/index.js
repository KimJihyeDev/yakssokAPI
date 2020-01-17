const path = require('path');
const Sequelize = require('sequelize');

// DB 연결정보가 있는 config/config.js 파일에서 development 모드의 DB정보를 조회한다
// 배포 전에 이 이부분을 수정
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname,'..','config','config.json'))[env];

// DB관리 객체 생성
const db = {};

// 시퀄라이즈 ORM 객체 생성
// 시퀄라이즈 ORM 객체 생성 시 관련 DB연결정보 전달
const sequelize = new Sequelize(config.database,config.username,process.env.db_pwd,config);

// DB객체에 시퀄라이즈 객체를 속성에 바인딩한다.
db.sequelize= sequelize;
// DB객체에 시퀄라이즈 모듈을 속성에 비인딩한다.
db.Sequelize = Sequelize;

// DB관리객체 모듈 출력
module.exports = db;