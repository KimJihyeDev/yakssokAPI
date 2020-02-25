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
// const sequelize = new Sequelize(config.database,config.username,config.password,config);
// 비밀번호 노출을 막기위해 비밀번호를 환경변수로 분리하여 객체 생성
const sequelize = new Sequelize(
    config.database,
    config.username,
    process.env.DB_PWD, config,
);
// const sequelize = new Sequelize(
//     config.database,
//     config.username,
//     config.password, config,
// );
// DB객체에 시퀄라이즈 객체를 속성에 바인딩한다.
db.sequelize = sequelize;
// DB객체에 시퀄라이즈 모듈을 속성에 비인딩한다.
db.Sequelize = Sequelize;

// 아래 코드가 실행되면서 MySQL에 테이블이 생성된다.
db.User = require('./user')(sequelize, Sequelize);
db.Product = require('./product')(sequelize, Sequelize);
db.Ingredient = require('./ingredient')(sequelize, Sequelize);
db.Pictogram = require('./pictogram')(sequelize, Sequelize);
db.HashTag = require('./hashtag')(sequelize, Sequelize);
db.Review = require('./review')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);

// 테이블 간의 관계를 정의

// product와 ingredient 간의 1:N 관계 정의하기
// 1:N의 관계의 경우 
// hasMany, belongsTo 메소드를 통해 1:N 관계를 정의할 수 있다.
// 참조하는 쪽이 hasMany, 참조되는 쪽이 belongsTo이다.
// 관계가 설정되면 참조하는 테이블인 ingredient 테이블에
// 참조키 컬럼명이 productId(참조테이블명 + Id)로 생성된다.
db.Product.hasMany(db.Ingredient);
db.Ingredient.belongsTo(db.Product);

// product와 pictogram 간의 N:M(다대다)관계 설정
// N:M 관계 설정을 통해 관련 테이블(productpictogram)과 컬럼이 자동생성된다.
// productId 컬럼과 pictogramId 컬럼이 자동으로 생성됨.
// N:M에서는 belongsToMany 양쪽 테이블에 메소드를 사용한다.
// thorough에는 새로 생성될 테이블의 이름을 정의한다.
db.Product.belongsToMany(db.Pictogram, { through: 'product_pictograms' });
db.Pictogram.belongsToMany(db.Product, { through: 'product_pictograms' });

// product와 hashTag 간의 N:M 관계 설정
db.Product.belongsToMany(db.HashTag, { through: 'product_hashtags' });
db.HashTag.belongsToMany(db.Product, { through: 'product_hashtags' });

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