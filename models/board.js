// board_name
// baord_desc
module.exports =(sequelize,DataTypes) => {

    return sequelize.define('board',{
        boardname:{
            type:DataTypes.STRING(100),
            allowNull:false,
        },
        desc:{
            type:DataTypes.STRING(500),
            allowNull:true,
        },
    },{
        timestamps:true,
        paranoid:true
    });
};