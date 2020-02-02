module.exports =(sequelize,DataTypes) => {

    return sequelize.define('ingredient',{
        ingredient:{ // 주요 성분
            type:DataTypes.STRING(500),
            allowNull:false,
        },
        per_serving:{ // 1회분 포함량
            type:DataTypes.STRING(20),
            allowNull:false,
        },
        daily_value:{ // %영양소기준치
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        other_ingredients:{ // 기타 성분
            type:DataTypes.TEXT,
            allowNull:false,
        },
    },{
        timestamps:true,
        paranoid:true
    });
};
// products 테이블과 1:N 관계를 맺을 ingredient 테이블