// title
// contents
// view_count
// commten
module.exports =(sequelize,DataTypes) => {

    return sequelize.define('article',{
        title:{
            type: DataTypes.STRING(100),
            allowNull:false,
        },
        contents:{
            type: DataTypes.STRING(500),
            allowNull:true,
        },
        writer:{
            type: DataTypes.STRING(500),
            allowNull:true,
        },
        view_count:{
            type: DataTypes.INTEGER,
            allowNull:true,
            defaultValue:true 
        },
    },{
        timestamps:true,
        paranoid:true
    });
};