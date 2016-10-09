function YingXiaoViewModel() {
    var self = this;
    self.userPOJO = ko.observable();
//    self.code = ko.observable(1001);
//    self.name = ko.observable("张三");
    self.level = ko.observable();
    self.begin_level = ko.observable();

    self.total_income = ko.observable(0); //总收入=累计收入+其他收入，
    //累计收入=初佣+续期+训练津贴+增员奖+直接管理津贴+育成利益+经理津贴+增部利益+总监利益
    //其他收入=提供往年占总收入占比，计算公式如下（累计收入*对应占比）/（1-对应占比）
    self.other_income_percent = ko.observable(0); //提供往年占总收入占比
    self.level_array = ko.observableArray(["00", "01", "02", "04", "05", "06", "08", "09", "10", "D1", "D2", "D3"]);
//        self.level_array = ko.observableArray(["[00]", "[02]", "[03]", "[04]", "[05]", "[06]", "[07]", "[08]", "[09]", "[10]",
//        "[17]", "[31]", "[32]", "[33]", "[34]", "[D1]", "[D2]", "[D3]"]);


    self.person = new Person();
    self.group = new Group("group");
    self.part = new Group("part");
//    self.part = new Part();

    self.isPersonDisplay = ko.observable(true);
    self.isGroupDisplay = ko.observable(false);
    self.isPartDisplay = ko.observable(false);
    self.level.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        var fresh_man_array = ["00", "01"];
        var group_permission = ["04", "05", "06"];
        var all_permission = ["08", "09", "10", "D1", "D2", "D3"];
        self.isPersonDisplay = ko.observable(true);
        self.person.trainning_allowance(getTrainningAllowance(self)); //训练津贴

        self.group.level_coefficient(computeManageAllawanceCoefficient(self));

        if ($.inArray(newValue, fresh_man_array) > -1) {
            console.log("fresh_man");
            self.person.is_increasing_num_display(false);
        } else {
            console.log("not fresh_man");
            self.person.is_increasing_num_display(true);
        }

        console.log("level =" + newValue)

        if ($.inArray(newValue, all_permission) > -1) {
            console.log("all");
            self.isGroupDisplay(true);
            self.isPartDisplay(true);
        } else if ($.inArray(newValue, group_permission) > -1) {
            console.log("group");
            self.isGroupDisplay(true);
            self.isPartDisplay(false);
        } else {
            console.log("person only");
            self.isGroupDisplay(false);
            self.isPartDisplay(false);
        }

    });
    self.userPOJO.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.other_income_percent(newValue.other_income_percent);
//        self.person.renewal_commission(newValue.renewal_history); //续佣
        self.person.trainning_allowance(getTrainningAllowance(self)); //训练津贴

//
//        self.group.history_num_1(newValue.history_num_1); //历史数据1
//        self.group.history_num_2(newValue.history_num_2); //历史数据2
//        self.group.history_num_3(newValue.history_num_3); //历史数据3
//        self.group.history_num_4(newValue.history_num_4); //历史数据4
//        self.group.direct_group_num(newValue.direct_group_count); //直接小组数，历史数据获得
//        self.group.indirect_group_num(newValue.indirect_group_count); //间接小组数，历史数据获得
//        self.group.level_coefficient(computeManageAllawanceCoefficient(self));
//        computeManageAllawanceCoefficient(yingXiaoViewModel)

//        self.part.history_num_3(newValue.history_num_3); //历史数据3
//        self.part.history_num_4(newValue.history_num_4); //历史数据4
//        self.part.subordinate_part_num(newValue.subordinate_part_num); //下辖部数量
    });

    self.other_income_percent.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        newValue = newValue.replace("%", "");
        if (newValue == null || isNaN(newValue)) {
            newValue = 0;
        } else if (newValue >= 100) {
            newValue = 99;
        } else if (newValue < 0) {
            newValue = 0;
        }
        self.other_income_percent(newValue);
    });
}

function Person() {
    var self = this;

    self.is_increasing_num_display = ko.observable(false);      //是否显示个人增员规划
    self.human_resource = ko.observable(0);                                     //个人增员
    self.outstanding_human_resource = ko.observable();                          //银龙增员
    self.diamonds_human_resource = ko.observable();                             //钻石增员
    self.standard_human_resource = ko.observable();                             //标准增员

    self.caifu_premium = ko.observable();                                       //财富天赢保费
    self.yingyue_premium = ko.observable();                                    //赢越人生保费
    self.shuangfu_premium = ko.observable();                                   //双福保费
//    self.shuangzhi_premium = ko.observable();                                  //双智保费
    self.other_premium = ko.observable();                                      //其他保费


    self.initial_commission = ko.observable(0);                                 //初佣 ： 财富天赢保费*6%+赢越人生保费*12%+双福保费*55%+双智保费*26%+其他保费*22%
    self.renewal_commission = ko.observable(0);                                 //续期 ： 历史数据，2016年初佣
    self.trainning_allowance = ko.observable(0);                                //训练津贴 ：张家口、衡水、承德、邢台按照III类标准，其余按照II类标准，具体标准见训练津贴计算表
    self.increasing_num_bonus = ko.observable(0);                               //增员奖 ： 绩优人力人数*6000*19%+钻石人力人数*3000*18%+标准人力人数*2000*18%


    self.outstanding_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.outstanding_human_resource(formatNumber(newValue, true, 0));
    });
    self.diamonds_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.diamonds_human_resource(formatNumber(newValue, true, 0));
    });
    self.standard_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.standard_human_resource(formatNumber(newValue, true, 0));
    });
    self.human_resource = ko.computed(function () {         //个人增员
        var outstanding_human = self.outstanding_human_resource() || 0;
        var diamonds_human = self.diamonds_human_resource() || 0;
        var standard_human = self.standard_human_resource() || 0;

        var num = outstanding_human + diamonds_human + standard_human;
        num = formatNumber(num, true, 0) || 0;
        return num;
    }, this);
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
//    self.shuangzhi_premium.subscribe(function (newValue) {
//        if (!newValue) {
//            return;
//        }
//        self.shuangzhi_premium(formatNumber(newValue, true));
//    });
    self.other_premium.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.other_premium(formatNumber(newValue, true));
    });
    self.initial_commission.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }

        var commission = formatNumber(newValue, true, 2);
        self.initial_commission(commission);
        if (yingXiaoViewModel) {
            yingXiaoViewModel.group.initial_commission(commission);
            yingXiaoViewModel.part.initial_commission(commission);
        }
        self.trainning_allowance(getTrainningAllowance(yingXiaoViewModel)); //训练津贴
    });
    self.renewal_commission.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.renewal_commission(formatNumber(newValue, true));
    });
    self.trainning_allowance.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.trainning_allowance(formatNumber(newValue, true));
    });
    self.increasing_num_bonus.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.increasing_num_bonus(formatNumber(newValue, true));
    });

    self.initial_commission = ko.computed(function () {
        var caifu_premium = self.caifu_premium() || 0;
        var yingyue_premium = self.yingyue_premium() || 0;
        var shuangfu_premium = self.shuangfu_premium() || 0;
//        var shuangzhi_premium = self.shuangzhi_premium() || 0;
        var other_premium = self.other_premium() || 0;

        var commission = caifu_premium * 0.06 + yingyue_premium * 0.12 +
                shuangfu_premium * 0.55 + other_premium * 0.22;


        var commission = formatNumber(commission, true, 2) || 0;
        if (yingXiaoViewModel) {
            yingXiaoViewModel.group.initial_commission(commission);
            yingXiaoViewModel.part.initial_commission(commission);
        }
        self.trainning_allowance(getTrainningAllowance(yingXiaoViewModel)); //训练津贴

        return commission;
    }, this);

    //增员奖：银龙人力人数*10000*19%+钻石人力人数*4000*19%+标准人力人数*3500*18%
    self.increasing_num_bonus = ko.computed(function () {
        var outstanding_human_resource = self.outstanding_human_resource() || 0;
        var diamonds_human_resource = self.diamonds_human_resource() || 0;
        var standard_human_resource = self.standard_human_resource() || 0;


        var bonus = outstanding_human_resource * 10000 * 0.19 +
                diamonds_human_resource * 4000 * 0.19 +
                standard_human_resource * 3500 * 0.18;

        var bonus = formatNumber(bonus, true) || 0;
        return bonus;
    }, this);
}

function Group(type) {
    var self = this;
    self.type = ko.observable(type);                                           //类别，组 或者 部
    self.human_resource = ko.observable(0);                                     //小组规划人力
    self.outstanding_human_resource = ko.observable();                          //绩优人力
    self.diamonds_human_resource = ko.observable();                             //钻石人力
    self.standard_human_resource = ko.observable();                             //标准人力

    self.initial_commission = ko.observable(0);                                 //个人情况中的初佣

    self.manage_allowance = ko.observable(0);                                   //
//    self.educate_benefits = ko.observable(0);                                 //育成利益
    self.FYC_group = ko.observable(0);                                          //小组总FYC : 

    self.level_coefficient = ko.observable(0);                                  //对应分档系数（见管理津贴分档系数表）




    self.human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.human_resource(formatNumber(newValue, true));
    });
    self.outstanding_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.outstanding_human_resource(formatNumber(newValue, true, 0));
    });
    self.diamonds_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.diamonds_human_resource(formatNumber(newValue, true, 0));
    });
    self.standard_human_resource.subscribe(function (newValue) {
        if (!newValue) {
            return;
        }
        self.standard_human_resource(formatNumber(newValue, true, 0));
    });


    self.human_resource = ko.computed(function () {
        var outstanding_human = self.outstanding_human_resource() || 0;
        var diamonds_human = self.diamonds_human_resource() || 0;
        var standard_human = self.standard_human_resource() || 0;

        var num = outstanding_human + diamonds_human + standard_human;
        num = formatNumber(num, true, 0) || 0;
        return num;

    }, this);

    //小组总FYC=组情况中的（银龙人力人数*10000+钻石人力人数*4000+标准人力人数*3500）+个人情况中的初佣
    self.FYC_group = ko.computed(function () {
        var outstanding_human = self.outstanding_human_resource() || 0;
        var diamonds_human = self.diamonds_human_resource() || 0;
        var standard_human = self.standard_human_resource() || 0;
        var initial_commission = self.initial_commission() || 0;


        if (self.type() == "group") {
            var FYC = outstanding_human * 10000 +
                    diamonds_human * 4000 +
                    standard_human * 3500 +
                    initial_commission;
        } else {
            var FYC = outstanding_human * 10000 +
                    diamonds_human * 3500 +
                    standard_human * 3500 +
                    initial_commission;
        }



        FYC = formatNumber(FYC, true, 2) || 0;
        console.log("FYC_group change and FYC = " + FYC);

        if (self.type() == "group") {
            //组管理津贴系数
            self.level_coefficient(computeManageAllawanceCoefficient(FYC, yingXiaoViewModel));
        } else {
            //经理津贴系数
            self.level_coefficient(computeManagerCoefficient(FYC, yingXiaoViewModel));
        }


        return FYC;
    }, this);

    //小组总FYC*对应分档系数（见管理津贴分档系数表）*115%*120%
    self.manage_allowance = ko.computed(function () {
//        console.log("self.FYC_group() = " + self.FYC_group());
//        console.log("self.level_coefficient() = " + self.level_coefficient());
        if (self.type() == "group") {
            //小组总FYC*对应分档系数（见管理津贴分档系数表）*115%*120%
            var allowance = self.FYC_group() * self.level_coefficient() * 1.15 * 1.20;
        } else {
            //部门总FYC*对应分档系数（见经理津贴分档系数表）*1.2*1.2*1.1
            var allowance = self.FYC_group() * self.level_coefficient() * 1.20 * 1.20 * 1.10;
        }


//        console.log("manage_allowance = " + allowance);
        allowance = formatNumber(allowance, true) || 0;
        return allowance;
    }, this);
}

//计算训练津贴
function getTrainningAllowance(yingXiaoViewModel) {
//    institution, time, performance
//    var institution = yingXiaoViewModel.userPOJO().institution;
//    var time = yingXiaoViewModel.userPOJO().institution;
//    var performance = yingXiaoViewModel.userPOJO().institution;

    var time = "20161021";
    var performance = 2300;

    var allowance = 0;
//    var time_arr = time.split("/") || [];
//    console.log("time_arr = " + time_arr);
    var year = Number(time.substr(0, 4)) || 0;
    var month = Number(time.substr(4, 2)) || 0;
    var type = 0;

    //加上下面一句
    month = 14 - month;


//
//    console.log("year = " + year);
//    console.log("time = " + time);
//    console.log("institution = " + institution);
//    console.log("performance = " + performance);

    if (performance <= 0 || year != 2016) {
        return allowance;
    }

    //优才计划
    if (type == 1) {
        console.log("优才计划")
        if (month >= 1 && month <= 3) {
            console.log("month >= 1 && month <= 3")

            if (performance < 700) {
                allowance = 0;
            } else if (performance >= 700 && performance < 1000) {
                allowance = 1000;
            } else if (performance >= 1000 && performance < 1500) {
                allowance = 2000;
            } else if (performance >= 1500 && performance < 2500) {
                allowance = 3300;
            } else if (performance >= 2500 && performance < 5000) {
                allowance = 4200;
            } else if (performance >= 5000) {
                allowance = 5400;
            }
        } else if (month >= 4 && month <= 12) {
            console.log("month >= 4 && month <= 12");

            if (performance < 1000) {
                allowance = 0;
            } else if (performance >= 1000 && performance < 1500) {
                allowance = 1400;
            } else if (performance >= 1500 && performance < 2500) {
                allowance = 2100;
            } else if (performance >= 2500 && performance < 5000) {
                allowance = 3150;
            } else if (performance >= 5000) {
                allowance = 4800;
            }
        }
    } else if (type == 2) {
        console.log("FNA")
        if (month >= 1 && month <= 3) {
            console.log("month >= 1 && month <= 3")

            if (performance < 600) {
                allowance = 0;
            } else if (performance >= 600 && performance < 700) {
                allowance = 0;
            } else if (performance >= 700 && performance < 900) {
                allowance = 1000;
            } else if (performance >= 900 && performance < 1000) {
                allowance = 1000;                                                  
            } else if (performance >= 1000 && performance < 1500) {
                allowance = 2000;
            } else if (performance >= 1500 && performance < 2500) {
                allowance = 2200;
            } else if (performance >= 2500 && performance < 5000) {
                allowance = 2800;
            } else if (performance >= 5000) {
                allowance = 3600;
            }
        } else if (month >= 4 && month <= 12) {
            console.log("month >= 4 && month <= 12");
            if (performance < 1000) {
                allowance = 0;
            } else if (performance >= 1000 && performance < 2500) {
                allowance = 1400;
            } else if (performance >= 2500 && performance < 5000) {
                allowance = 2100;
            } else if (performance >= 5000) {
                allowance = 3200;
            }
        }
    } else if (type == 3) {
        console.log("NA")
        if (month >= 1 && month <= 3) {
            console.log("month >= 1 && month <= 3")

            if (performance < 600) {
                allowance = 0;
            } else if (performance >= 600 && performance < 700) {
                allowance = 600;
            } else if (performance >= 700 && performance < 900) {
                allowance = 600;                                                
            } else if (performance >= 900 && performance < 1000) {
                allowance = 1000;
            } else if (performance >= 1000 && performance < 1500) {
                allowance = 1200;
            } else if (performance >= 1500 && performance < 2500) {
                allowance = 1400;
            } else if (performance >= 2500 && performance < 5000) {
                allowance = 1700;
            } else if (performance >= 5000) {
                allowance = 1700;                                               
            }
        } else if (month >= 4 && month <= 12) {
            console.log("month >= 4 && month <= 12");
            allowance = 0;
        }
    }
    console.log("return allowance;" + allowance);
    return allowance;
}


function computeManageAllawanceCoefficient(FYC, yingXiaoViewModel) {
    if (yingXiaoViewModel == null) {
        return 0;
    }


    var x = getXForManageAllawanceCoefficient(FYC);
    var y = getYForManageAllawanceCoefficient(yingXiaoViewModel.level());
//
//    console.log("computeManageAllawanceCoefficient in");
//    console.log("x = " + x);
//    console.log("y = " + y);



    var coefficient = 0;
    var coefficient_table = [
        [0.09, 0.10, 0.11, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12],
        [0.16, 0.17, 0.18, 0.19, 0.19, 0.19, 0.19, 0.19, 0.19],
        [0.18, 0.19, 0.20, 0.21, 0.21, 0.21, 0.21, 0.21, 0.21],
        [0.20, 0.21, 0.22, 0.24, 0.24, 0.24, 0.24, 0.24, 0.24],
        [0.22, 0.23, 0.24, 0.28, 0.28, 0.28, 0.28, 0.28, 0.28]
    ];
    if (x < 0 || y < 0) {
        return coefficient;
    } else {
        coefficient = coefficient_table[x][y] || 0;
        return coefficient;
    }
}

function getXForManageAllawanceCoefficient(FYC_group) {

//    console.log("FYC_group = " + FYC_group);

    var x = -1;
    if (FYC_group < 7000) {
        x = 0;
    } else if (FYC_group >= 7000 && FYC_group < 15000) {
        x = 1;
    } else if (FYC_group >= 15000 && FYC_group < 25000) {
        x = 2;
    } else if (FYC_group >= 25000 && FYC_group < 40000) {
        x = 3;
    } else if (FYC_group >= 40000) {
        x = 4;
    }
    return x;
}

function getYForManageAllawanceCoefficient(level) {
    var y = -1;
//    console.log("level = " + level)
    switch (level) {
        case "04":
            y = 0;
            break
        case "05":
            y = 1;
            break;
        case "06":
            y = 2;
            break;

        case "08":
            y = 3;
            break;
        case "09":
            y = 4;
            break;
        case "10":
            y = 5;
            break;

        case "D1":
            y = 6;
            break;
        case "D2":
            y = 7;
            break;
        case "D3":
            y = 8;
            break

        default:
            y = -1;
    }
    return y;
}



function computeManagerCoefficient(FYC, yingXiaoViewModel) {
    if (yingXiaoViewModel == null) {
        return 0;
    }


    var x = getXForManagerCoefficient(FYC);
    var y = getYForManagerCoefficient(yingXiaoViewModel.level());

//    console.log("computeManagerCoefficient in");
//    console.log("x = " + x);
//    console.log("y = " + y);



    var coefficient = 0;
    var coefficient_table = [
        [0.025, 0.03, 0.035, 0.035, 0.035, 0.035],
        [0.0425, 0.0475, 0.0525, 0.0525, 0.0525, 0.0525],
        [0.0450, 0.0500, 0.0550, 0.0550, 0.0550, 0.0550],
        [0.0475, 0.0525, 0.0575, 0.0575, 0.0575, 0.0575],
        [0.0500, 0.0550, 0.0600, 0.0600, 0.0600, 0.0600],
        [0.0525, 0.0575, 0.0625, 0.0625, 0.0625, 0.0625],
        [0.0550, 0.0600, 0.0650, 0.0650, 0.0650, 0.0650]
    ];
    if (x < 0 || y < 0) {
        return coefficient;
    } else {
        coefficient = coefficient_table[x][y] || 0;
        return coefficient;
    }
}

function getXForManagerCoefficient(FYC_part) {

    console.log("FYC_part = " + FYC_part);

    var x = -1;
    if (FYC_part < 60000) {
        x = 0;
    } else if (FYC_part >= 60000 && FYC_part < 150000) {
        x = 1;
    } else if (FYC_part >= 150000 && FYC_part < 250000) {
        x = 2;
    } else if (FYC_part >= 250000 && FYC_part < 350000) {
        x = 3;
    } else if (FYC_part >= 350000 && FYC_part < 450000) {
        x = 4;
    } else if (FYC_part >= 450000 && FYC_part < 550000) {
        x = 5;
    } else if (FYC_part >= 550000) {
        x = 6;
    }
    return x;
}

function getYForManagerCoefficient(level) {
    var y = -1;
    switch (level) {
        case "08":
            y = 0;
            break
        case "09":
            y = 1;
            break;
        case "10":
            y = 2;
            break;
        case "D1":
            y = 3;
            break;
        case "D2":
            y = 4;
            break;
        case "D3":
            y = 5;
            break;
        default:
            y = -1;
    }
    return y;
}



function formatNumber(num, rounding, digit) {
    digit = digit || 0;
    if (num === null || isNaN(num)) {
        num = 0;
    }

    if (rounding) {             //取两位小数
        num = num + "";
        if (num.indexOf(".") > 0) {
            if (digit == 0) {
//                console.log("222222222digit = " + digit)
                num = num.substring(0, num.indexOf("."));
            } else {
//                console.log("11111111digit = " + digit)
                num = num.substring(0, num.indexOf(".") + digit + 1);
            }

        }
    }

    return Number(num);
}