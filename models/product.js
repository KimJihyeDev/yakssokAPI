module.exports=(sequelize, DataTypes)=>{
    // 테이블과 맵핑되는 제품 모델
    return sequelize.define('product',{
      
        parent_category:{ // 제품 카테고리(상위)
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
        product_image:{ // 제품 이미지 이름
            type:DataTypes.STRING(100),
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
        other_ingredients:{ // 기타성분
            type:DataTypes.TEXT,
            allowNull:false,
        },
        warnings:{ // 주의사항
            type:DataTypes.TEXT, 
            allowNull:false,
        },
        servings:{   // 1회 제공량
            type:DataTypes.STRING(20),
            allowNull:false,
        },
        total_servings:{  // 총 제공량(횟수)
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        like_count:{ // 좋아요
            type:DataTypes.INTEGER,
            allowNull:true,
            defaultValue:0 
        },
        dislike_count:{ // 싫어요
            type:DataTypes.INTEGER,
            allowNull:true,
            defaultValue:0 
        },
        
    },{     
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        timestamps: true,
        paranoid:true
    });
};


