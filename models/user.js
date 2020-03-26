module.exports = (sequelize,DataTypes) =>{
    // users 테이블과 맵핑되는 user 모델 정의
    return sequelize.define('user', {
        user_id:{ 
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        user_pwd:{
            type: DataTypes.STRING(100), 
            allowNull: true,
        },
        email:{
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true,
        },
    },{
        // temestamps는 테이블에 createdAt, updatedAt컬럼을 자동생성하고
        // 데이터의 생성, 수정 일자를 자동으로 체크해준다.
        // paranoid 는 deletedAt 컬럼을 자동으로 생성하고
        // 컬럼을 삭제시 데이터는 삭제되지 않고 삭제 일시 정보를 기록한다.
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        timestamps: true,
        paranoid: true
    });
};