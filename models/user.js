module.exports = (sequelize,DataTypes) =>{
    // users 테이블과 맵핑되는 user 모델 정의
    // 테이블명에는 자동으로 s가 붙는다
    return sequelize.define('user',{
        user_id:{
            type:DataTypes.STRING(10),
            allowNull:false,
            unique:true,
        },
        user_pwd:{
            type:DataTypes.STRING(100), // 해시암호화 했으므로 길이에 주의
            allowNull:false,
        },
        email:{
            type:DataTypes.STRING(50),
            allowNull:false,
            unique:true,
        },
        userstate:{ // 가입, 탈퇴 구분
            type:DataTypes.BOOLEAN,
            allowNull:false,
        },
    },{
        // temestamps는 테이블에 createdAt, updatedAt컬럼을 자동생성하고
        // 데이터의 생성, 수정 일자를 자동으로 체크해준다.
        // paranoid 는 deletedAt 컬럼을 자동으로 생성하고
        // 컬럼을 삭제시 데이터는 삭제되지 않고 삭제 일시 정보를 기록한다.
        timestamps:true,
        paranoid:true
    });
};