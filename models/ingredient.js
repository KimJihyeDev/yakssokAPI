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
            type:DataTypes.STRING(20),
            allowNull:true,
        },
    },{
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        timestamps:true,
        paranoid:true
    });
};
// products 테이블과 1:N 관계를 맺을 ingredient 테이블