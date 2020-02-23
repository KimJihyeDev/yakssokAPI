module.exports =(sequelize,DataTypes) => {

    return sequelize.define('comment',{
        contents: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        writer: { // 댓글(대댓글) 작성자
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // 대댓글인 경우, 댓글의 user id
        commenter: { 
            type: DataTypes.INTEGER,
            allowNull:true,
        },
    },{
        timestamps:true,
        paranoid:true
    });
};
// article과 1 : N의 관계를 맺는 comment