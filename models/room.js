// 관리자와의 채팅방 모델
module.exports = (sequelize, DataTypes) => {
    
    return sequelize.define('room', {
        title:{
            type:DataTypes.STRING(100),
            allowNull: true,
            defaultValue: '실시간 채팅'
        },
        max:{
            type:DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 2 // 채팅 참여인원
        },
    }, {
        timestamps:true,
        paranoid:true // 삭제 여부 체크
    });
};