function QuTuoViewModel() {
    var self = this;
    self.code = ko.observable(1001);
    self.name = ko.observable("张三");

    self.userPOJO = ko.observable();

    self.level = ko.observable();
    self.level_array = ko.observableArray([
        "试用收展员", "收展员一级", "收展员二级", "收展员三级", "收展员四级",
        "收展员五级", "收展员六级", "收展员七级",
        "展业区主任一级", "展业区主任二级", "展业区主任三级", "展业区主任四级",
        "展业区主任五级", "展业区主任六级", "展业区主任七级",
        "高级展业处处经理", "展业课课长", "资深展业课课长", "展业处经理",
        "高级展业课课长", "区部经理", "资深展业处处经理"
    ]);


    self.total_income = ko.observable(0);

    //其他收入占比写死为 10%
    self.other_income_percent = ko.observable(10);

    self.total_performance = ko.observable(0);                                  //总业绩

    self.person = new Person(self.level());

    self.qu = new Group("qu", self.level());
    self.ke = new Group("ke", self.level());
    self.chu = new Group("chu", self.level());
    self.qubu = new Group("qubu", self.level());

//
//    self.userPOJO.subscribe(function (newValue) {
//        console.log("userPOJO in ===========");
//        if (!newValue) {
//            return;
//        }
//        self.person.trainning_allowance = getTrainningAllowance(self);
//    });

    //TODO level变了之后很多东西得重新计算
    self.level.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.person.level(newValue);
        self.qu.level(newValue);
        self.ke.level(newValue);
        self.chu.level(newValue);

//        self.person.initial_commission(getInitialCommission(self.level(), self.person.performance()));
    });

    self.other_income_percent.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue === null || isNaN(newValue)) {
            newValue = 0;
        } else if (newValue >= 100) {
            newValue = 99;
        } else if (newValue < 0) {
            newValue = 0;
        }
        self.other_income_percent(newValue);
    });

}

function Person(level) {
    var self = this;
    self.level = ko.observable(level);
    self.last_performance_level_array = ko.observable(["非绩优", "A1", "A2"]);
    //----------增员情况-------------
    self.is_increasing_num_display = ko.observable(false); //是否显示个人增员规划
    self.outstanding_human_resource = ko.observable();     //绩优增员
    self.diamonds_human_resource = ko.observable();        //钻石增员
    self.standard_human_resource = ko.observable();        //标准增员
    self.human_resource = ko.observable(0);                //个人增员 checked
    self.increasing_num_bonus = ko.observable(0);          //增员奖   checked

    //----------个人产能-------------
    self.caifu_premium = ko.observable();                  //财富天赢保费
    self.yingyue_premium = ko.observable();                //赢越人生保费
    self.shuangfu_premium = ko.observable();               //双福保费
    self.shuangzhi_premium = ko.observable();              //双智保费
    self.other_premium = ko.observable();                  //其他保费

    self.last_performance_level = ko.observable();         //上季度绩优档次


    self.performance = ko.observable(0);                    //新契约业绩

    self.initial_commission = ko.observable(0);             //初佣 ：checked 根据个人职级（各职级标准见计算规则见PPT第2页）和所填写的产能进行计算。
    self.job_allowance = ko.observable(0);                  //岗位津贴
    self.outstanding_allowance = ko.observable(0);          //绩优津贴
    self.trainning_allowance = ko.observable(0);            //训练津贴 ：checked
    self.excess_bonus = ko.observable(0);                   //展业超额奖金
    self.complete_allowance = ko.observable(0);             //达成津贴


//-------------------------compute begin-------------------------------------


    self.human_resource = ko.computed(function () {         //个人增员
        var outstanding_human = self.outstanding_human_resource() || 0;
        var diamonds_human = self.diamonds_human_resource() || 0;
        var standard_human = self.standard_human_resource() || 0;

        var num = Number(outstanding_human) + Number(diamonds_human) + Number(standard_human);
        num = formatNumber(num, true, 0) || 0;
        return num;
    }, this);

    self.increasing_num_bonus = ko.computed(function () {
        var human_resource = self.human_resource() || 0;
        var increasing_num_bonus = human_resource * 14400 * 0.066;

        increasing_num_bonus = formatNumber(increasing_num_bonus, true);
        return increasing_num_bonus;
    }, this);

    self.performance = ko.computed(function () {
        var caifu_premium = Number(self.caifu_premium()) || 0;
        var yingyue_premium = Number(self.yingyue_premium()) || 0;
        var shuangfu_premium = Number(self.shuangfu_premium()) || 0;
        var shuangzhi_premium = Number(self.shuangzhi_premium()) || 0;
        var other_premium = Number(self.other_premium()) || 0;

        //直接相加
//        var performance = caifu_premium + yingyue_premium +
//                shuangfu_premium + shuangzhi_premium +
//                other_premium;
//        


        var performance = (caifu_premium*0.06 + yingyue_premium*0.12 +
                shuangfu_premium*0.55 + shuangzhi_premium*0.22 +
                other_premium*0.22)/0.35;

//        console.log("performance = " + performance)

        var performance = formatNumber(performance, true, 0) || 0;
        return performance;

    }, this);

    self.outstanding_allowance = ko.computed(function () {
        var last_performance_level = self.last_performance_level() || "";
        var performance = self.performance() || 0;
        var outstanding_allowance = getOutstandingAllawance(last_performance_level, performance);
        outstanding_allowance = formatNumber(outstanding_allowance, true, 0) || 0;
        return outstanding_allowance;
    }, this)

    self.trainning_allowance = ko.computed(function () {
        var trainning_allowance = 0;
        var performance = self.performance();
        if (quTuoViewModel && quTuoViewModel.userPOJO()) {
            trainning_allowance = getTrainningAllowance(quTuoViewModel.userPOJO(), performance);
        }
        trainning_allowance = formatNumber(trainning_allowance, true);
        return trainning_allowance;
    }, this);

    self.excess_bonus = ko.computed(function () {
        var excess_bonus = 0;
        var level = self.level();
        var performance = self.performance();

        excess_bonus = getExcessBonus(level, performance);

        excess_bonus = formatNumber(excess_bonus, true);
        return excess_bonus;
    }, this);

    self.complete_allowance = ko.computed(function () {
        var complete_allowance = 0;
        var level = self.level();
        var performance = self.performance()

        complete_allowance = getCompleteAllowance(level, performance);

        complete_allowance = formatNumber(complete_allowance, true);
        return complete_allowance;
    }, this);

    self.job_allowance = ko.computed(function () {
        var job_allowance = 0;
        var level = self.level();
        var performance = self.performance();
        console.log("--------performance = " + performance);

        job_allowance = getJobAllowance(level, performance);

        job_allowance = formatNumber(job_allowance, true);
        return job_allowance;
    }, this);

    self.initial_commission = ko.computed(function () {
        var level = self.level();
        var performance = self.performance();
        var initial_commission = getInitialCommission(level, performance);
        initial_commission = formatNumber(initial_commission, true);
        return initial_commission;

    }, this);

    self.level.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue == "试用收展员") {
            self.is_increasing_num_display(false);
        } else {
            self.is_increasing_num_display(true);

        }
        //如果收展员是试用层级不显示个人增员规划
    });

//-------------------------去除小数 begin--------------------------------
    self.outstanding_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue === null || isNaN(newValue)) {
            newValue = 0;
        }
        self.outstanding_human_resource(newValue);
    });

    self.diamonds_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue === null || isNaN(newValue)) {
            newValue = 0;
        }
        self.diamonds_human_resource(newValue);
    });

    self.standard_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue === null || isNaN(newValue)) {
            newValue = 0;
        }
        self.standard_human_resource(newValue);
    });

    self.caifu_premium.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.caifu_premium(formatNumber(newValue, true));
    });

    self.yingyue_premium.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.yingyue_premium(formatNumber(newValue, true));
    });

    self.shuangfu_premium.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.shuangfu_premium(formatNumber(newValue, true));
    });

    self.shuangzhi_premium.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.shuangzhi_premium(formatNumber(newValue, true));
    });

    self.other_premium.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.other_premium(formatNumber(newValue, true));
    });

//-------------------------去除小数 end --------------------------------






//------------------------compute end----------------------------------------



}

function Group(type, level) {
    var self = this;
    self.type = ko.observable(type);
    self.level = ko.observable(level);

    self.human_resource = ko.observable(0);                //个人增员
    self.outstanding_human_resource = ko.observable();     //绩优增员
    self.diamonds_human_resource = ko.observable();        //钻石增员
    self.standard_human_resource = ko.observable();        //标准增员

    self.manage_allowance = ko.observable(0);               //管理津贴
    self.performance = ko.observable(0);                    //新契约业绩

    self.renjunchanneng = ko.observable();                  //人均产能
    self.guimo_coefficient = ko.observable(1);              //规模提奖系数
    self.renjunchanneng_coefficient = ko.observable(0);     //人均产能提奖系数
    self.huodonglv_coefficient = ko.observable(1.08);       //活动率提奖系数
    self.jixulv_coefficient = ko.observable(1.15);          //继续率调整比例 ，仅对区有意义,其他应该为1

//---------------------compute begin -----------------------------------------



    self.human_resource = ko.computed(function () {
        var outstanding_human = self.outstanding_human_resource() || 0;
        var diamonds_human = self.diamonds_human_resource() || 0;
        var standard_human = self.standard_human_resource() || 0;

        var num = Number(outstanding_human) + Number(diamonds_human) + Number(standard_human);
        num = formatNumber(num, true, 0) || 0;
        return num;
    }, this);

    self.renjunchanneng = ko.computed(function () {
        var channeng = 0;
        var outstanding_human = self.outstanding_human_resource() || 0;
        var diamonds_human = self.diamonds_human_resource() || 0;
        var standard_human = self.standard_human_resource() || 0;

        var human_resource = Number(outstanding_human) + Number(diamonds_human) + Number(standard_human);
        //合格人力 800 ， 钻石人力 8700 ， 绩优人力 14400
        var sum = Number(outstanding_human) * 14400 + Number(diamonds_human) * 8700 + Number(standard_human) * 800;

        if (human_resource > 0) {
            channeng = sum / human_resource || 0;
        }
        channeng = formatNumber(channeng, true, 0) || 0;
        return channeng;
    }, this);

    self.performance = ko.computed(function () {
        var performance = 0;
        var outstanding_human = self.outstanding_human_resource() || 0;
        var diamonds_human = self.diamonds_human_resource() || 0;
        var standard_human = self.standard_human_resource() || 0;

        //合格人力 800 ， 钻石人力 8700 ， 绩优人力 14400
        var performance = Number(outstanding_human) * 14400 + Number(diamonds_human) * 8700 + Number(standard_human) * 800;
        performance = formatNumber(performance, true, 0) || 0;
        return performance;
    }, this);

    self.guimo_coefficient = ko.computed(function () {
        var guimo_coefficient = 1;
        var type = self.type();
        var performance = self.performance();

        guimo_coefficient = getGuimoCoefficient(type, performance);
//        guimo_coefficient = formatNumber(guimo_coefficient, true, 0) || 0;
        return guimo_coefficient;
    }, this);

    self.renjunchanneng_coefficient = ko.computed(function () {
        var renjunchanneng_coefficient = 1;
        var type = self.type();
        var renjunchanneng = self.renjunchanneng();

        console.log("----------- renjunchanneng = " + renjunchanneng);
        renjunchanneng_coefficient = getRenjunchannengCoefficient(type, renjunchanneng);
//        renjunchanneng_coefficient = formatNumber(renjunchanneng_coefficient, true, 0) || 0;
        console.log("11111 renjunchanneng_coefficient = " + renjunchanneng_coefficient)
        return renjunchanneng_coefficient;
    }, this);

    self.manage_allowance = ko.computed(function () {
        var performance = self.performance() || 0;                    //新契约业绩
        var guimo_coefficient = self.guimo_coefficient() || 1;        //规模提奖系数
        var renjunchanneng_coefficient = self.renjunchanneng_coefficient() || 0;//人均产能提奖系数
        var jixulv_coefficient = self.jixulv_coefficient() || 1;      //继续率调整比例

        console.log("guimo_coefficient = " + guimo_coefficient)
        console.log("renjunchanneng_coefficient = " + renjunchanneng_coefficient)

        var coefficient1 = Number(guimo_coefficient) * Number(renjunchanneng_coefficient);
        console.log("coefficient1 = " + coefficient1)
        if (self.type() == "qu" && coefficient1 > 0.07) {
            coefficient1 = 0.07;
        }
        if (self.type() == "ke" && coefficient1 > 0.034) {
            coefficient1 = 0.034;
        }
        if (self.type() == "chu" && coefficient1 > 0.14) {
            coefficient1 = 0.14;
        }

        if (self.type() == "qubu" && coefficient1) {
            //区部没有上限
        }

        var huodonglv_coefficient = self.huodonglv_coefficient() || 1;
        var allowance = performance * coefficient1 * huodonglv_coefficient;

        //区还需要多乘以一个继续率 1.15
        if (self.type() == "qu") {
            allowance = allowance * jixulv_coefficient;
        }

        allowance = formatNumber(allowance, true, 0) || 0;
        return allowance;
    }, this);


//---------------------compute end -----------------------------------------




//---------------------去掉小数 begin -------------------------------------------

    self.outstanding_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue === null || isNaN(newValue)) {
            newValue = 0;
        }
        self.outstanding_human_resource(newValue);
    });

    self.diamonds_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue === null || isNaN(newValue)) {
            newValue = 0;
        }
        self.diamonds_human_resource(newValue);
    });

    self.standard_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        if (newValue === null || isNaN(newValue)) {
            newValue = 0;
        }
        self.standard_human_resource(newValue);
    });

//---------------------去掉小数 end -------------------------------------------




}

//计算初佣 北京
function getInitialCommission(level, performance) {
    console.log("getInitialCommission performance = " + performance);

    var commission = 0;
    var type_1 = ["试用收展员"];
    var type_2 = ["收展员四级", "收展员五级", "收展员六级", "收展员七级"];

    var type_3 = ["收展员三级"];
    var type_4 = ["收展员一级", "收展员二级"];
    var type_5 = [
        "展业区主任一级", "展业区主任二级", "展业区主任三级", "展业区主任四级",
        "展业区主任五级", "展业区主任六级", "展业区主任七级",
        "高级展业处处经理", "展业课课长", "资深展业课课长", "展业处经理",
        "高级展业课课长", "区部经理", "资深展业处处经理"
    ];

    if ($.inArray(level, type_1) > -1) {
        if (performance > 7200) {
            commission = 7200 * 0.2 + (performance - 7200) * 0.25;
        } else {
            commission = performance * 0.2;
        }
    } else if ($.inArray(level, type_2) > -1) {
        commission = performance * 0.25;
    } else if ($.inArray(level, type_3) > -1) {
        commission = performance * 0.27;
    } else if ($.inArray(level, type_4) > -1) {
        commission = performance * 0.28;
    } else if ($.inArray(level, type_5) > -1) {
        commission = performance * 0.30;
    }

    return commission;
}

//计算训练津贴 北京
function getTrainningAllowance(userPOJO, FYC) {

    var time = userPOJO.begin_time || "";
    var trainning_allowance = 0;
    var year = time.substr(0, 4) || 0;
    var month = time.substr(4, 2) || 0;
    month = 14 - month;
    //TODO判断是否优才
    var isOutstanding = false;
    if (userPOJO.youcai == "是") {
        isOutstanding = true;
    }

    if (((year != 2016) || (year == 2016 && month == 1))) {  //非2016 2-12月   //直接判断不是新人
        return trainning_allowance;
    }

    //北京 非优才
    if (!isOutstanding) {

        //司龄 1 - 3 月
        if (month >= 1 && month <= 3) {
            if (FYC < 2000) {
                trainning_allowance = 0;
            } else if (FYC >= 2000 && FYC < 2800) {
                trainning_allowance = 1000;
            } else if (FYC >= 2800 && FYC < 4300) {
                trainning_allowance = 2000;
            } else if (FYC >= 4300 && FYC < 7200) {
                trainning_allowance = 2200;
            } else if (FYC >= 7200 && FYC < 14000) {
                trainning_allowance = 2800;
            } else if (FYC >= 14000) {
                trainning_allowance = 3600;
            }
        }
        //司龄 4 - 12 月
        if (month >= 4 && month <= 12) {
            if (FYC < 2800) {
                trainning_allowance = 0;
            } else if (FYC >= 2800 && FYC < 7200) {
                trainning_allowance = 1400;
            } else if (FYC >= 7200 && FYC < 14000) {
                trainning_allowance = 2100;
            } else if (FYC >= 14000) {
                trainning_allowance = 3200;
            }
        }
    } else {
        //北京 优才
        //司龄 1 - 3 月
        if (month >= 1 && month <= 3) {
            if (FYC < 2000) {
                trainning_allowance = 0;
            } else if (FYC >= 2000 && FYC < 2800) {
                trainning_allowance = 1000;
            } else if (FYC >= 2800 && FYC < 4300) {
                trainning_allowance = 2000;
            } else if (FYC >= 4300 && FYC < 7200) {
                trainning_allowance = 3300;
            } else if (FYC >= 7200 && FYC < 14000) {
                trainning_allowance = 4200;
            } else if (FYC >= 14000) {
                trainning_allowance = 5400;
            }
        }
        //司龄 4 - 12 月
        if (month >= 4 && month <= 12) {
            if (FYC < 2800) {
                trainning_allowance = 0;
            } else if (FYC >= 2800 && FYC < 4300) {
                trainning_allowance = 1400;
            } else if (FYC >= 4300 && FYC < 7200) {
                trainning_allowance = 2100;
            } else if (FYC >= 7200 && FYC < 14000) {
                trainning_allowance = 3150;
            } else if (FYC >= 14000) {
                trainning_allowance = 4800;
            }
        }

    }

    return trainning_allowance;
}

//计算绩优津贴 北京
//绩优津贴：若“上季度绩优档次”为非绩优，则绩优津贴为0，否则根据绩优档次，按照不同个人总业绩进行比例提取，=总业绩*提奖比例
function getOutstandingAllawance(outstanding_level, performance) {
    var allowance = 0;
    console.log("getOutstandingAllawance in and outstanding_level = " + outstanding_level);
    console.log("getOutstandingAllawance in and performance = " + performance);

    var outstanding_allowance_table = [
        [0, 0],
        [0.028, 0.018],
        [0.053, 0.035],
        [0.070, 0.053],
        [0.077, 0.070]
    ];
    var getX = function (performance) {
        var x = -1;
        if (performance < 4000) {
            x = 0;
        } else if (performance >= 4000 && performance < 7200) {
            x = 1;
        } else if (performance >= 7200 && performance < 10000) {
            x = 2;
        } else if (performance >= 10000 && performance < 17000) {
            x = 3;
        } else if (performance >= 17000) {
            x = 4;
        }
        return x;
    };

    var getY = function (level) {
        var y = -1;
        if (level == "A1") {
            y = 0;
        } else if (level == "A2") {
            y = 1;
        }
        return y;
    };

    var x = getX(performance);
    var y = getY(outstanding_level);
    var rate = 0;

    if (x >= 0 && y >= 0) {
        rate = outstanding_allowance_table[x][y] || 0;
    }

    allowance = performance * rate || 0;
    console.log("outstanding allowance = " + allowance);
    return allowance;
}

//计算超额奖金 北京
function getExcessBonus(level, performance) {
    var bonus = 0;
    var duty_arr = {"试用收展员": 2000, "收展员七级": 3000, "收展员六级": 4000, "收展员五级": 6000
        , "收展员四级": 8000, "收展员三级": 12000, "收展员二级": 18000, "收展员一级": 24000};
    var duty_performance = duty_arr[level] || -1;
    if (duty_performance <= 0 || performance <= duty_performance) {
        return bonus;
    }
    var bonus_rate = 0;

    var excess_rate = performance / duty_performance;

    var bonus_rate_table = [
        [0.03, 0.06, 0.07, 0.08, 0.09, 0.11, 0.13, 0.14],
        [0.035, 0.065, 0.075, 0.085, 0.095, 0.115, 0.135, 0.145],
        [0.04, 0.07, 0.08, 0.09, 0.10, 0.12, 0.14, 0.15],
        [0.045, 0.075, 0.085, 0.095, 0.105, 0.125, 0.145, 0.155],
        [0.05, 0.08, 0.09, 0.10, 0.11, 0.13, 0.15, 0.16]
    ];


    var getX = function (excess_rate) {
        var x = -1;
        if (excess_rate >= 1.0 && excess_rate < 1.2) {
            x = 0;
        } else if (excess_rate >= 1.2 && excess_rate < 1.4) {
            x = 1;
        } else if (excess_rate >= 1.4 && excess_rate < 1.6) {
            x = 2;
        } else if (excess_rate >= 1.6 && excess_rate < 2.0) {
            x = 3;
        } else if (excess_rate >= 2.0) {
            x = 4;
        }
        return x;
    };

    var getY = function (level) {
        var y = -1;
        if (level == "试用收展员") {
            y = 0;
        } else if (level == "收展员七级") {
            y = 1;
        } else if (level == "收展员六级") {
            y = 2;
        } else if (level == "收展员五级") {
            y = 3;
        } else if (level == "收展员四级") {
            y = 4;
        } else if (level == "收展员三级") {
            y = 5;
        } else if (level == "收展员二级") {
            y = 6;
        } else if (level == "收展员一级") {
            y = 7;
        }
        return y;
    };

    var x = getX(excess_rate);
    var y = getY(level);

    if (x < 0 || y < 0) {
        bonus_rate = 0;
    } else {
        bonus_rate = bonus_rate_table[x][y] || 0;
    }

    bonus = (performance - duty_performance) * bonus_rate;

    return bonus;
}

//计算达成奖金 北京
function getCompleteAllowance(level, performance) {
    var allowance = 0;
    var duty_arr = {"收展员七级": 3000, "收展员六级": 4000, "收展员五级": 6000
        , "收展员四级": 8000, "收展员三级": 12000, "收展员二级": 18000, "收展员一级": 24000};
    var duty_performance = duty_arr[level] || -1;
    if (duty_performance <= 0 || performance <= 0) {
        return allowance;
    }
//    var allowance_rate = 0;

    var rate = performance / duty_performance;

    var alloawance_table = [
        [0, 0, 0, 0, 0, 0, 0],
        [80, 100, 160, 210, 310, 470, 620],
        [120, 160, 230, 310, 470, 700, 940],
        [160, 210, 310, 420, 620, 940, 1250],
        [210, 260, 390, 520, 780, 1170, 1560]
    ];


    var getX = function (rate) {
        var x = -1;
        if (rate >= 0.0 && rate < 0.4) {
            x = 0;
        } else if (rate >= 0.4 && rate < 0.6) {
            x = 1;
        } else if (rate >= 0.6 && rate < 0.8) {
            x = 2;
        } else if (rate >= 0.8 && rate < 1.0) {
            x = 3;
        } else if (rate >= 1.0) {
            x = 4;
        }
        return x;
    };

    var getY = function (level) {
        var y = -1;
        if (level == "收展员七级") {
            y = 0;
        } else if (level == "收展员六级") {
            y = 1;
        } else if (level == "收展员五级") {
            y = 2;
        } else if (level == "收展员四级") {
            y = 3;
        } else if (level == "收展员三级") {
            y = 4;
        } else if (level == "收展员二级") {
            y = 5;
        } else if (level == "收展员一级") {
            y = 6;
        }
        return y;
    };

    var x = getX(rate);
    var y = getY(level);

    if (x < 0 || y < 0) {
        allowance = 0;
    } else {
        allowance = alloawance_table[x][y] || 0;
    }

    return allowance;
}

//计算岗位/职务津贴 北京
function getJobAllowance(level, performance) {
    console.log("getJobAllowance performance = " + performance);
    var allowance = 0;


    var allowanceArray = [
        //-----------------------------------------------------------
        {"level": "收展员七级", "standard": 500, "allowance": 150},
        {"level": "收展员六级", "standard": 500, "allowance": 300},
        {"level": "收展员五级", "standard": 600, "allowance": 400},
        {"level": "收展员四级", "standard": 800, "allowance": 500},
        {"level": "收展员三级", "standard": 1200, "allowance": 700},
        {"level": "收展员二级", "standard": 1800, "allowance": 1000},
        {"level": "收展员一级", "standard": 2400, "allowance": 1200},
        //-----------------------------------------------------------
        {"level": "展业区主任七级", "standard": 0, "allowance": 800},
        {"level": "展业区主任六级", "standard": 0, "allowance": 1000},
        {"level": "展业区主任五级", "standard": 0, "allowance": 1200},
        {"level": "展业区主任四级", "standard": 0, "allowance": 1400},
        {"level": "展业区主任三级", "standard": 0, "allowance": 1600},
        {"level": "展业区主任二级", "standard": 0, "allowance": 1800},
        {"level": "展业区主任一级", "standard": 0, "allowance": 2000},
        //-----------------------------------------------------------
        {"level": "展业课长", "standard": 0, "allowance": 2000},
        {"level": "高级展业课长", "standard": 0, "allowance": 3000},
        {"level": "资深展业课长", "standard": 0, "allowance": 4000},
        {"level": "展业课课长", "standard": 0, "allowance": 2000},
        {"level": "高级展业课课长", "standard": 0, "allowance": 3000},
        {"level": "资深展业课课长", "standard": 0, "allowance": 4000},
        //-----------------------------------------------------------
        {"level": "展业处经理", "standard": 0, "allowance": 5000},
        {"level": "高级展业处经理", "standard": 0, "allowance": 6000},
        {"level": "资深展业处经理", "standard": 0, "allowance": 7000},
        {"level": "展业处处经理", "standard": 0, "allowance": 5000},
        {"level": "高级展业处处经理", "standard": 0, "allowance": 6000},
        {"level": "资深展业处处经理", "standard": 0, "allowance": 7000},
        //-----------------------------------------------------------
        {"level": "区部经理", "standard": 0, "allowance": 12000},
        {"level": "高级区部经理", "standard": 0, "allowance": 14000},
        {"level": "资深区部经理", "standard": 0, "allowance": 16000},
    ];

    for (var i in allowanceArray) {
        if (allowanceArray[i].level == level) {
            console.log("get job allowance hit level = " + level);
            if (performance >= allowanceArray[i].standard) {
                console.log("达到标准");
                allowance = allowanceArray[i].allowance;

            }
        }
    }

    return allowance;
}


//计算规模系数 北京
function getGuimoCoefficient(type, performance) {
    var coefficient = 1;

    var quCoefficientArray = [1, 1.2, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75];
    var quPerformanceArray = [0, 12000, 18000, 24000, 36000, 48000, 72000, 96000, 120000, 180000, 240000, Infinity];

    var keCoefficientArray = [1, 1.25, 1.45, 1.54, 1.55, 1.60, 1.70, 1.72, 1.74, 1.75, 1.78, 1.80];
    var kePerformanceArray = [0, 35000, 60000, 85000, 110000, 135000, 160000, 185000, 300000, 450000, 600000, 750000, Infinity];

    var chuCoefficientArray = [1.025, 1.225, 1.275, 1.400, 1.500, 1.675, 1.775, 1.800, 1.825, 1.850, 1.875, 1.900];
    var chuPerformanceArray = [0, 100000, 200000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000, 2500000, 3000000, Infinity];

    var qubuCoefficientArray = [0.200, 0.400, 0.500, 0.550, 0.600, 0.625, 0.650, 0.650, 0.675, 0.700];
    var qubuPerformanceArray = [0, 1000000, 3000000, 5000000, 7000000, 9000000, 12000000, 15000000, 20000000, Infinity];


    var coefficientTable = [
        {"type": "qu", "coefficientArray": quCoefficientArray, "performanceArray": quPerformanceArray},
        {"type": "ke", "coefficientArray": keCoefficientArray, "performanceArray": kePerformanceArray},
        {"type": "chu", "coefficientArray": chuCoefficientArray, "performanceArray": chuPerformanceArray},
        {"type": "qubu", "coefficientArray": qubuCoefficientArray, "performanceArray": qubuPerformanceArray}
    ];
    var coefficientArray;
    var performanceArray;
    for (var n in coefficientTable) {
        if (coefficientTable[n].type == type) {
            coefficientArray = coefficientTable[n].coefficientArray;
            performanceArray = coefficientTable[n].performanceArray;
            break;
        }
    }

    if (!coefficientArray || !performanceArray) {
        return coefficient;
    }




    for (var i = 0; i < performanceArray.length - 1; i++) {
        if (performance >= performanceArray[i] && performance < performanceArray[i + 1]) {
            console.log("performanceArray[i] = " + performanceArray[i]);
            console.log("performanceArray[i +1]  = " + performanceArray[i + 1]);

            coefficient = coefficientArray[i];
        }
    }

    return coefficient;

}

//计算人均产能提奖系数 北京
function getRenjunchannengCoefficient(type, channeng) {
    var coefficient = 0;

    // var quCoefficientArray = [0, 0.015, 0.02, 0.0313, 0.0338, 0.0358, 0.0378, 0.0388, 0.0393, 0.0398, 0.0403, 0.0408];
    var quCoefficientArray = [0, 0.015, 0.02, 0.03125, 0.03375, 0.03575, 0.03775, 0.03875, 0.03925, 0.03975, 0.04025, 0.04075];
    var quChannengArray = [0, 1500, 2250, 2750, 3250, 3750, 4250, 5250, 7250, 9250, 12500, 16000, Infinity];

    var keCoefficientArray = [0, 0.007, 0.01, 0.0135, 0.0150, 0.0155, 0.0160, 0.0170, 0.01775, 0.0185, 0.01875, 0.019];
    var keChannengArray = [0, 1500, 2250, 2750, 3250, 3750, 4250, 5250, 7250, 9250, 12500, 16000, Infinity];

    var chuCoefficientArray = [0, 0.00420, 0.0044, 0.0055, 0.0060, 0.00625, 0.00650, 0.00675, 0.0070, 0.00725, 0.00750, 0.00775];
    var chuChannengArray = [0, 1500, 2250, 2750, 3250, 3750, 4250, 5250, 7250, 9250, 12500, 16000, Infinity];

    var qubuCoefficientArray = [0, 0.00420, 0.0044, 0.0055, 0.0060, 0.00625, 0.00650, 0.00675, 0.0070, 0.00725];
    var qubuChannengArray = [0, 1500, 2250, 2750, 3250, 3750, 4250, 5250, 7250, 10000, Infinity];


    var coefficientTable = [
        {"type": "qu", "coefficientArray": quCoefficientArray, "channengArray": quChannengArray},
        {"type": "ke", "coefficientArray": keCoefficientArray, "channengArray": keChannengArray},
        {"type": "chu", "coefficientArray": chuCoefficientArray, "channengArray": chuChannengArray},
        {"type": "qubu", "coefficientArray": qubuCoefficientArray, "channengArray": qubuChannengArray}
    ];

    var coefficientArray;
    var channengArray;
    for (var n in coefficientTable) {
        if (coefficientTable[n].type == type) {
            coefficientArray = coefficientTable[n].coefficientArray;
            channengArray = coefficientTable[n].channengArray;
            break;
        }
    }

    if (!coefficientArray || !channengArray) {
        return coefficient;
    }


    console.log("channeng = " + channeng);


    for (var i = 0; i < channengArray.length - 1; i++) {
        if (channeng >= channengArray[i] && channeng < channengArray[i + 1]) {
            console.log("channengArray[i] = " + channengArray[i]);
            console.log("channengArray[i +1]  = " + channengArray[i + 1]);
            console.log("i = " + i);
            coefficient = coefficientArray[i];
            console.log("=== coefficient = " + coefficient);

        }
    }

    return coefficient;

}

//去小数
function formatNumber(num, rounding, digit) {
    digit = digit || 0;
    if (num === null || isNaN(num)) {
        num = 0;
    }

    if (rounding) {             //取两位小数
        num = num + "";
        if (num.indexOf(".") > 0) {
            if (digit == 0) {
                num = num.substring(0, num.indexOf("."));
            } else {
                num = num.substring(0, num.indexOf(".") + digit + 1);
            }

        }
    }

    return Number(num);
}
