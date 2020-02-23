module.exports =(sequelize,DataTypes) => {

    return sequelize.define('review',{
        title:{
            type: DataTypes.STRING(100),
            allowNull:false,
        },
        contents:{
            type: DataTypes.STRING(300),
            allowNull: false,
        },
    },{
        timestamps:true,
        paranoid:true
    });
};