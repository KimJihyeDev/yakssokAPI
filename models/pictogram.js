module.exports =(sequelize,DataTypes) => {

    return sequelize.define('pictogram',{
        pictogram_name:{ // 픽토그램 이름
            type:DataTypes.STRING(100),
            allowNull:false,
        },
        image_path:{ // 이미지 경로
            type:DataTypes.STRING(100),
            allowNull:false,
        }
    },{
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        timestamps:true,
        paranoid:true
    });
};
// products 테이블과 N:M 관계를 맺을 pictograms 테이블