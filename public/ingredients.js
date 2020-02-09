    // 지역 컴포넌트로 선언(등록한 컴포넌트 내부에서만 사용)
    var ingredient = {
            template: `<div class="form-group row">
                            <div class="col-sm-12">
                                <div class="row">
                                    <label class="col-sm-1 col-form-label" ref="label1">성분명
                                    </label>
                                    <div class="col-md-3"><input type="text" placeholder="성분명"
                                            class="form-control" ref="ingredient" v-model="ingredient" @change="inputEvent" ></div>
                                    <label class="col-sm-1 col-form-label" ref="label2">함유량</label>
                                    <div class="col-md-3"><input type="text" placeholder="함량"
                                            class="form-control" ref="amountsPerServing" v-model="amountsPerServing" @change="inputEvent"></div>
                                    <label class="col-sm-1 col-form-labe" ref="label3">영양소 기준치</label>
                                    <div class="col-md-3"><input type="number" placeholder="숫자만 입력하세요"
                                            class="form-control" ref="dailyValue" @change="inputEvent"></div>
                                </div>
                            </div>
                        </div>
                        `,
            props:[], 
            data(){
                return {
                    childObj:{},
                    ingredient:'',
                    amountsPerServing:''
                }
            },
            methods:{
                inputEvent(){
                    this.childObj.ingredient = this.$refs.ingredient.value; // 성분=입력값으로 설정
                    this.childObj.amountsPerServing = this.$refs.amountsPerServing.value; 
                    this.childObj.dailyValue = this.$refs.dailyValue.value; 
                    
                },
            },
        }
