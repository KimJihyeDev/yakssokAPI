var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//env파일 임포트 및 설정처리
require('dotenv').config();


//CORS 팩키지 모듈 임포트
var cors = require('cors');

//시퀄라이저 ORM 객체 불러오기
var sequelize = require('./models/index.js').sequelize;

//라우팅 파일 불러오기
var indexRouter = require('./routes/index');
var userRouter = require('./routes/users');
var productRouter = require('./routes/products');
var fileRouter = require('./routes/files');
var pictogramRouter = require('./routes/pictograms');
var chatRouter = require('./routes/chat');
var reviewRouter = require('./routes/review');

var app = express();


//CORS 지원처리
app.use(cors());

//시퀄라이즈 ORM객체를 MYSQL에 연결하고 동기화처리
sequelize.sync();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



// 정적인 웹요소(html,css,js파일들)를 expess웹서버를 통해
// 서비스할수 있게 설정(디폴트는 public)
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'dist')));


// 라우팅정보를 익스프레스 웹서버에서 사용할수있게 설정
// RESTful API작성 규칙에 맞게 경로이름은 소문자, 복수형으로 한다.
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/files', fileRouter);
app.use('/pictograms', pictogramRouter);
app.use('/chat', chatRouter);
app.use('/reviews', reviewRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// 개발모드 확인
console.log('모드:'+ app.get('env') );

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
