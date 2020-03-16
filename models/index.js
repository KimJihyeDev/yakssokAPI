const path = require('path');
const Sequelize = require('sequelize');

// DB 연결정보가 있는 config/config.js 파일에서 development 모드의 DB정보를 조회한다
// 배포 전에 환경변수에서 production으로 설정해주기 
const env = process.env.NODE_ENV;
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];

// DB관리 객체 생성
const db = {};

// 시퀄라이즈 ORM 객체 생성
// 시퀄라이즈 ORM 객체 생성 시 관련 DB연결정보 전달
let password;

env == 'development'
    ? password = process.env.DB_PWD
    : password = process.env.DB_PRODUCTION

var sequelize = new Sequelize(
    config.database,
    config.username,
    password, config,
)

// DB객체에 시퀄라이즈 객체를 속성에 바인딩한다.
db.sequelize = sequelize;
// DB객체에 시퀄라이즈 모듈을 속성에 비인딩한다.
db.Sequelize = Sequelize;

// 아래 코드가 실행되면서 MySQL에 테이블이 생성된다.
db.User = require('./user')(sequelize, Sequelize);
db.Product = require('./product')(sequelize, Sequelize);
db.Ingredient = require('./ingredient')(sequelize, Sequelize);
db.Pictogram = require('./pictogram')(sequelize, Sequelize);
db.Review = require('./review')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.UserProducts = require('./userproduct')(sequelize, Sequelize);

// 테이블 간의 관계를 정의

// product와 ingredient 간의 1:N 관계 정의하기
db.Product.hasMany(db.Ingredient);
db.Ingredient.belongsTo(db.Product);

// product와 pictogram 간의 N:M(다대다)관계 설정
db.Product.belongsToMany(db.Pictogram, { through: 'product_pictograms' });
db.Pictogram.belongsToMany(db.Product, { through: 'product_pictograms' });

// product와 user간의 N:M관계 설정(좋아요, 싫어요에 사용)
// 미리 정의한 컬럼을 추가(through의 값이 문자열이 아님에 주의)
db.User.belongsToMany(db.Product, { through: db.UserProducts });
db.Product.belongsToMany(db.User, { through: db.UserProducts });

// review와 comment 간의 1:N 관계 설정
db.Review.hasMany(db.Comment);
db.Comment.belongsTo(db.Review);

// product와 review 간의 1:N 관계 설정 
db.Product.hasMany(db.Review);
db.Review.belongsTo(db.Product);

// user와 review 간의 1:N 관계 설정
db.User.hasMany(db.Review);
db.Review.belongsTo(db.User);

// user와 comment 간의 1:N 관계 설정
db.User.hasMany(db.Comment);
db.Comment.belongsTo(db.User);



// DB관리객체 모듈 출력
module.exports = db;