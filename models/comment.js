module.exports =(sequelize, DataTypes) => {

    return sequelize.define('comment',{
        contents: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
    },{
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        timestamps:true,
        paranoid:true
    });
};
// review 1 : N의 관계를 맺는 comment