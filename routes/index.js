var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 상품 등록 페이지
router.get('/product_register', res => 
  res.render('product_register')
);

// 상품 리스트 페이지
router.get('/product_list', res => 
  res.render('product_list')
);

// 상품 수정, 삭제 페이지
router.get('/product_modify', res => 
  res.render('product_modify')
);

// 픽토그램 등록 페이지
router.get('/pictogram_register', res => 
  res.render('pictogram_register')
);


module.exports = router;
