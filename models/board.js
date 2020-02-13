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
        useyn:{
            type:DataTypes.BOOLEAN,
            allowNull:true,
            defaultValue:true 
        },
    },{
        timestamps:true,
        paranoid:true
    });
};