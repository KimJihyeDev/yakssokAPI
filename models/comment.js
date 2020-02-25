module.exports =(sequelize,DataTypes) => {

    return sequelize.define('comment',{
        contents: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
    },{
        timestamps:true,
        paranoid:true
    });
};
// article과 1 : N의 관계를 맺는 comment