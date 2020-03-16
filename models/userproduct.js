// N:M 테이블에 컬럼 추가
module.exports =(sequelize, DataTypes) => {

    return sequelize.define('user_products',{
        like_dislike: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },{
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        timestamps: true,
        paranoid: false
    });
};