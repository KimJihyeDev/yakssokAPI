const path = require('path');
const Sequelize = require('sequelize');

// DB 연결정보가 있는 config/config.js 파일에서 development 모드의 DB정보를 조회한다
// 배포 전에 환경변수에서 production으로 설정해주기 
const env = process.env.NODE_ENV;
const config = require(path.join(__dirname,'..','config','config.json'))[env];

// DB관리 객체 생성
const db = {};

// 시퀄라이즈 ORM 객체 생성
// 시퀄라이즈 ORM 객체 생성 시 관련 DB연결정보 전달
// const sequelize = new Sequelize(config.database,config.username,config.password,config);
// 비밀번호 노출을 막기위해 비밀번호를 환경변수로 분리하여 객체 생성
const sequelize = new Sequelize(config.database,config.username,process.env.DB_PWD,config);

// DB객체에 시퀄라이즈 객체를 속성에 바인딩한다.
db.sequelize= sequelize;
// DB객체에 시퀄라이즈 모듈을 속성에 비인딩한다.
db.Sequelize = Sequelize;

// 아래 코드가 실행되면서 MySQL에 테이블이 생성된다.
db.User = require('./user')(sequelize,Sequelize);
db.Product = require('./product')(sequelize,Sequelize);




// DB관리객체 모듈 출력
module.exports = db;