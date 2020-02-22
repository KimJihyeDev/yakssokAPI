// 채팅 모델
module.exports = (sequelize, DataTypes) => {
    
    return sequelize.define('chat', {
        user:{  // 채팅에 참여한 사람(일단 user테이블과 관계 생성X)
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        chat:{
            type: DataTypes.TEXT,
        },
        
    }, {
        timestamps:true,
        paranoid:true // 삭제 여부 체크
    });
};