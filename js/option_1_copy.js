//var myChart = undefined;
//var option = undefined;
$(document).ready(function() {
    var option = {};
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    // 指定图表的配置项和数据
    

    // 使用刚指定的配置项和数据显示图表。
    //myChart.setOption(option);
    option = get_date('300458',option);
    console.log(option);
    option = mark_point('300458',option);
    myChart.setOption(option);
 });

 function mark_point(stock_code,option){
    console.log(option);
    option['series']['markPoint'] = {
        symbol: "pin",
        data:[
            {name:'买入',value:60,xAxis:'09:50',yAxis:81}, 
            {type:'max',name:'最高'},
            {type:'min',name:'最低'},
            {name:'买入',value:60,xAxis:5,yAxis:81}                        
            
        ]
    };
    return option;
    
 }

 function get_date(stock_code,option){
    $.ajax({
        url:"http://img1.money.126.net/data/hs/time/today/1"+stock_code+".json",
        dataTypey:"json",
        type:"get",
        //async:false,
        success:function(response,status,xhr){
            //console.log('状态为：' + status + ',状态是：' + xhr.statusText);
            //console.log(response);
            var x_Axis=[],y_data=[];
            for ( var data in response.data){               
                temp_string = response.data[data][0];
                console.log(typeof(temp_string));
                x_Axis.push(temp_string.substr(0, 2)+':'+temp_string.substr(2));                
                y_data.push(response.data[data][1]);
                
            }
            option = {
                title: {
                    text: response.name
                },
                tooltip: {},
                legend: {
                    data:['价格']
                },
                xAxis: {
                    data: x_Axis
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        magicType: {type: ['line', 'bar']},
                        restore: {},
                        saveAsImage: {}
                    }
                },                
                yAxis: {
                    type:'value',
                    scale:true
                },
                series: [{
                    name: '价格',
                    smooth: 0.2,
                    type: 'line',
                    data: y_data,
                    markLine:{
                        data:[
                            //{ type:"max",coord:[1,response.yestclose]  ,name:"昨日收盘"}
                            { yAxis:response.yestclose  ,name:"昨日收盘"}
                        ]
                    },
                    markPoint:{
                    },
                }]
            };
            //myChart.setOption(option);
            console.log(option);
            return option;
        }
    });
}



