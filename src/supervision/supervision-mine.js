/**
 * Created by Mattia on 2016/6/12.
 */
// var requestInterfaces=require("../webconfig.js")

import { supervisionRequest } from '../webconfig';
var Vue = require("vue");
import ComHeader from "../components/header.vue";
import ComFooter from "../components/footer.vue";
let headerVm = new Vue({
    el: "header",
    components: {
        ComHeader
    }
});
let footerVm = new Vue({
    el: "footer",
    components: {
        ComFooter
    }
});
let filterVm = new Vue({
    el: "#filterSection",
    data: {
        filterOptions: {
            areaCode: [],
            sourceCode: [],
            // accountablesn:"",
            responsiblesn:""
        },
        dateFilter: [
            {title: "全部", status: true},
            {title: "上周", status: true},
            {title: "本周", status: true},
            {title: "下周", status: true},
            {title: "时段", status: true}
        ],
        dateOptions: {
            show: false,
            type: "date", //date datetime
            value: "2016-6-21",
            begin: "2016-6-20",
            end: "2016-12-25",
            x: 0,
            y: 0,
            range: true,//是否多选
        },
        area: [], source: [],
        stateList: [
            {label: "正常", value: true, feature: "label-success", margin: '50%'},
            {label: "一周内过期", value: true, feature: "label-warning", margin: ''},
            {label: "已过期", value: true, feature: "label-danger", margin: ''},
            {label: "已完成", value: false, feature: "label-default", margin: ''}
        ]
    },
    methods: {
        changeTime: function (ev) {
            // 日期条件选择
            let that = this;
            ev.stopPropagation();
            let curtar = ev.currentTarget;
            let btn = $(curtar)
            let mark = curtar.getAttribute("data-mark");
            if (!btn.hasClass("btn-success")||mark=="custom") {
                $("#datePicker").find(".btn").removeClass("btn-success");
                btn.addClass("btn-success");
               
                switch (mark) {
                    case "all":
                        delete this.filterOptions.searchBeginDate;
                        delete this.filterOptions.searchEndDate;
                        break;
                    case "lastweek":
                        this.filterOptions.searchBeginDate = moment().day(-6).format("YYYY-MM-DD");
                        this.filterOptions.searchEndDate = moment().day(0).format("YYYY-MM-DD");
                        break;
                    case "thisweek":
                        this.filterOptions.searchBeginDate = moment().weekday(1).format("YYYY-MM-DD");
                        this.filterOptions.searchEndDate = moment().day(7).format("YYYY-MM-DD");
                        break;
                    case "nextweek":
                        this.filterOptions.searchBeginDate = moment().day(8).format("YYYY-MM-DD");
                        this.filterOptions.searchEndDate = moment().day(14).format("YYYY-MM-DD");
                        break;
                    case "custom":
                    let start=$("#startDate").val().split("/");
                    let end= $("#endDate").val().split("/");
                    this.filterOptions.searchBeginDate=start[2]+"-"+start[0]+"-"+start[1];
                    this.filterOptions.searchEndDate=end[2]+"-"+end[0]+"-"+end[1];
                    break;
                }  
                resultVm.fetchTransactions(supervisionRequest.searchUrl);
            }
        },
        changeArea: function (index,filter) {
            // console.log(JSON.stringify(this.area.show));return;
             let area = this[filter];
            if (index == 0) {          
                if(area[0].status=="1")return;      //all
                area[0].status = "1";
                for (let i = 1, len = area.length; i < len; i++) {
                    area[i].status = "0";
                }
                this.filterOptions[filter+"Code"] = [];
            } else {
                //other
                let areaCode = this.filterOptions[filter+"Code"];
                area[0].status = "0";
                if (area[index].status == "1") {
                    area[index].status = "0";

                    for (let i in areaCode) {
                        if (areaCode[i] == area[index].diccode) {
                            areaCode.splice(i, 1);
                        }
                    }
                }
                else {
                    area[index].status = "1";
                    areaCode.push(area[index].diccode);
                }
                this.filterOptions[filter+"Code"] = areaCode;
            }
             this[filter]=area;
            //
            resultVm.fetchTransactions(supervisionRequest.searchUrl);
        }

    },
    created: function () {
        let _this = this;
        var urls = {
            'supAreaUrl': supervisionRequest["supAreaUrl"],
            "supSourceUrl": supervisionRequest["supSourceUrl"]
        };
        for (let key in urls) {
            $.ajax({
                type: "get",
                dataType: "json",
                // contentType:"application/json;charset=UTF-8",
                url: urls[key],
                success: function (result, state, jqxhr) {
                    for (let i in result) {
                        result[i].status = "0";
                    }
                    let name = jqxhr.key;
                    let show = [{status: "1", dicname: "全部"}];
                    if (name == "supAreaUrl") {

                        //领域
                        _this.area =show.concat(result);
                    } else {
                        //督办来源
                        _this.source = show.concat(result);
                    }
                },
                error: function (data, state, jqxhr) {
                    console.log(jqxhr.key)
                    console.log(data)
                }
            }).key = key;
        }


    },
    ready: function () {
        // body...
        $("#startDate").daterangepicker({
            singleDatePicker: true,
            showDropdowns: true
        }, function (start, end, label) {
        });
        $("#endDate").daterangepicker({
            singleDatePicker: true,
            showDropdowns: true
        });
    }
});
let sortings = new Array(8);
(function () {
    for (leti = 0; i > 8; i++) {
        sortings[i] = "sorting";
    }
});
for (let i = 0; i < 8; i++)sortings[i] = "sorting";

var resultVm = new Vue({
    el: "#result-section",
    data: {
        ths: [{key: "code", val: '督办编号'},
            {key: "name", val: '督办事项名称'},
            {key: "accountablename", val: '责任领导(A)'},
            {key: "responsiblename", val: '责任人(R)'},
            {key: "estimatedcompletetiontime", val: '计划完成时间'},
            {key: "urgency", val: '紧急程度'},
            {key: "importance", val: '重要程度'},
            {key: "rate", val: '最新进展'}
        ],
        keyItems: {
            sorting: sortings,
            total: [],
            show: [],
            current: 1
        },
        otherItems: {
            sorting: sortings,
            total: [],
            show: [],
            current: 1
        },
        doneItems: {
            sorting: sortings,
            total: [],
            show: [],
            current: 1
        },
        pageSize: 3,

    },
    created: function () {
        let _this = this;
        supervisionRequest.searchUrl += "?page=0" + "&size=100";
        //search for the initialization
        this.fetchTransactions(supervisionRequest.searchUrl);

        //fetch list end

    },
    methods: {
        changePage: function (curr, limit, totalCount, name) {
            let items = this[name + "Items"];
            items.current = curr;
            this.changeHandler(curr, name, items);
        },
        sortColumn: function (n, name) {

            let items = this[name + "Items"];
            let status = items.sorting[n];
            if (status == "sorting_asc") {
                //des sorting
                let sorting = sortings.concat();
                sorting[n] = "sorting_desc";
                items.sorting = sorting;
                let key = this.ths[n].key;
                items.total.sort(function (a, b) {
                    return sorter(b[key], a[key])
                });
                this.changeHandler(items.current, name, items);
            } else {
                //asc sorting
                let sorting = sortings.concat();
                sorting[n] = "sorting_asc";
                items.sorting = sorting;
                let key = this.ths[n].key;
                items.total.sort(function (a, b) {
                    return sorter(a[key], b[key])
                });
                this.changeHandler(items.current, name, items);
            }

            function sorter(a, b) {
                if (/^\d/.test(a) ^ /^\D/.test(b)) return a > b ? 1 : (a == b ? 0 : -1);
                return a > b ? -1 : (a == b ? 0 : 1);
            }

        },
        changeHandler: function (curr, name, items) {
            let pageSize = this.pageSize;
            items.show = items.total.slice((curr - 1) * pageSize, pageSize * (curr));
        },
        fetchTransactions: function (url) {
            // //search for the tablelist
            //  jQuery.support.cors = true;
            let options = {
              
            };
            for (let key in filterVm.filterOptions) {
                options[key] = filterVm.filterOptions[key];
            }
            if (options.areaCode.length == 0) {
                delete options.areaCode;
            }
            else {
                options.areaCode = options.areaCode.join(",");
            }
            options.source=options.sourceCode;
            delete options.sourceCode;
            if (options.source.length == 0) {
                delete options.source;
            }
            else {
                options.source = options.source.join(",");
            }
            options.responsiblesn="20116636";
            let that = this;
            options = JSON.stringify(options);
            $.ajax({
                type: "POST",
                dataType: "json",
                data: options,
                contentType: "application/json",
                url: url,
                success: function (result, state, jqxhr) {
                    let doneList = [], keyList = [], otherList = [];
                    for (let i = 0, len = result.length; i < len; i++) {
                        let item = result[i];
                        if (item.latestTrace) {
                            item.rate = item.latestTrace.rate;
                            item.latestDesc = item.latestTrace.description;
                        } else {
                            item.rate = 0;
                            item.latestDesc = "";
                        }
                        if (item.rate < 25) {
                            item.rateState = "progress-bar-danger";
                        } else if (item.rate < 75) {
                            item.rateState = "progress-bar-warning";
                        } else {
                            item.rateState = "progress-bar-success";
                        }


                        if (item.status == 1) {
                            //已完成
                            doneList.push(item);
                        } else {
                            //未完成
                            let now = new moment(), comDate = new moment(item.estimatedcompletetiontime);
                            let days = comDate.diff(now, "days");
                            if (days > 6 && item.urgency < 4 && item.importance < 4) {
                                //other
                                otherList.push(item);
                            } else {
                                //key
                                keyList.push(item);
                            }
                        }
                    }
                    let res = {doneList: doneList, keyList: keyList, otherList: otherList};
                    let sorting = sortings.concat(), pageSize = that.pageSize;
                    let names = ['key', 'other', 'done'];
                    for (let i in names) {
                        let name = names[i];
                        that[name + 'Items'] = {
                            total: res[name + "List"],
                            show: res[name + "List"].slice(0, pageSize),
                            sorting: sorting,
                            current: 1
                        };

                        let limit = Number(that.pageSize) || 10;
                        var totalCount = Number(that[name + "Items"].total.length);
                        $('#' + name + '-pagination').extendPagination({
                            totalCount: totalCount,
                            // showCount: showCount,
                            limit: limit,
                            name: name,
                            callback: function (curr, limit, totalCount, name) {
                                that.changePage(curr, limit, totalCount, name);
                            }
                        });
                    }

                },
                error: function (data, state, jqxhr) {
                    console.log(data)
                }
            });

            //fetch list end
        },
        newfunc: function () {

        }
    }

    /* body... */
});
