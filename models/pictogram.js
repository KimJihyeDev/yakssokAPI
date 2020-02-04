module.exports =(sequelize,DataTypes) => {

    return sequelize.define('pictogram',{
        // type:{
        //     type:DataTypes.STRING(20), // 픽토그램의 타입(총5가지)
        //     allowNull:false,
        // },
        pictogram_name:{ // 픽토그램 이름
            type:DataTypes.STRING(100),
            allowNull:false,
        },
        image_path:{ // 이미지 경로
            type:DataTypes.STRING(100),
            allowNull:false,
        }
    },{
        timestamps:true,
        paranoid:true
    });
};
// products 테이블과 N:M 관계를 맺을 pictograms 테이블