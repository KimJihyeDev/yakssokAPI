    // 지역 컴포넌트로 선언(등록한 컴포넌트 내부에서만 사용)
    var ingredient = {
            template: `<div class="form-group row">
                            <div class="col-sm-12">
                                <div class="row">
                                    <label class="col-sm-1 col-form-label" ref="label1">성분명
                                    </label>
                                    <div class="col-md-3"><input type="text" placeholder="성분명"
                                            class="form-control"  ref="ingredient" @change="inputEvent" ></div>
                                    <label class="col-sm-1 col-form-label" ref="label2">함유량</label>
                                    <div class="col-md-3"><input type="text" placeholder="함량"
                                            class="form-control"  ref="amountsPerServing" @change="inputEvent"></div>
                                    <label class="col-sm-1 col-form-labe" ref="label3">영양소 기준치</label>
                                    <div class="col-md-3"><input type="text" placeholder="%영양소기준치"
                                            class="form-control"  ref="dailyValue" @change="inputEvent"></div>
                                </div>
                            </div>
                        </div>
                        `,
            props:[], 
            data(){
                return {
                    childObj:{},
                }
            },
            methods:{
                inputEvent(){
                    
                    console.log(this.$refs.ingredient); // 결과는 input객체. ref가 적용된 태그의 객체가 반환되는 것 같다.
                    // input 태그의 입력값을 알아내려면 value를 사용해야 한다.
                    // this.obj.objNum.ingredient = this.obj.objNum.ingredient.value 
                    this.childObj.ingredient = this.$refs.ingredient.value; // 성분=입력값으로 설정
                    this.childObj.amountsPerServing = this.$refs.amountsPerServing.value; // 성분=입력값으로 설정
                    this.childObj.dailyValue = this.$refs.dailyValue.value; // 성분=입력값으로 설정
                    console.log(`입력값확인= ${this.$refs.ingredient.value}`)
                    // console.log(`타입확인=${this.obj.objNum.ingredient.value}`); // htmlinputelement에서 값을 추출
                    console.log(this.childObj); // 이렇게 할 경우 htmlinputelement객체가 반환된다. 어째서?
                    // console.log(`전송할 객체 확인=${this.obj}`);
                    
                },
                
            },
            created(){
                // this.$on('increase',function(){
                //     this.increase
                // }); // created에 정의해도 되는건가??
                // this.$on('open',function(){
                //     // console.log를 자주 찍도록 하자!!
                //     console.log('부모에서 발생시킨 open 이벤트를 수신처리함');
                //     console.log(this);
                //     alert('open 이벤트를 수신하였습니다.');
                // })
            }

        }
