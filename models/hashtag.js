module.exports =(sequelize,DataTypes) => {

    //hashtags 테이블과 맵핑되는 hashtag 모델 정의 
    return sequelize.define('hashtag',{
        tagname:{
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