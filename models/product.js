module.exports=(sequelize,DataTypes)=>{
    // 테이블과 맵핑되는 상품 모델
    // 해시태그는 N:M 관계 테이블로 따로 작성
    return sequelize.define('product',{
      
        parent_cetegory:{ // 제품 카테고리(상위)
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        child_category:{ // 제품 카테고리(하위)
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        product_name:{ // 제품 이름
            type:DataTypes.STRING(100),
            allowNull:false,
            unique:true
        }, 
        product_image:{ // 제품 이미지 경로와 이름
            type:DataTypes.STRING(100),
                // get: function () {
                //     return JSON.parse(this.getDataValue('value'));
                // },
                // set: function (value) {
                //     this.setDataValue('value', JSON.stringify(value));
                // },
            allowNull:false,
            unique:true,
        },
        product_desc:{ // 제품 상세 설명
            type:DataTypes.TEXT,
            allowNull:false,
        },
        suggested_use:{ // 복용법
            type:DataTypes.TEXT,
            allowNull:false,
        },
        warnings:{ // 주의사항
            type:DataTypes.TEXT, 
            allowNull:false,
        },
        servings:{   // 1회 제공량
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        total_servings:{  // 총 제공량
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        // pictogram:{ // 픽토그램
        //     type:DataTypes.STRING(50),
        //     allowNull:true,
        // },
        like:{ // 좋아요 수
            type:DataTypes.INTEGER,
            allowNull:true,
            defaultValue:0 // default 설정이 적용되는지 확인
        },
    },{     
        timestamps: true,
        paranoid:true
    });
};


