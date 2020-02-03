module.exports =(sequelize,DataTypes) => {
// 테스트용 테이블
    return sequelize.define('temp',{
        test:{
            type:DataTypes.STRING(100),
            allowNull:true,
        }
    },{
        timestamps:true,
        paranoid:true
    });
};