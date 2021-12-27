$(document).ready(function() {
   init(); 
});

var backgroundPage = null; 
var stopUpdateInfo = false;

function get_today(){
	// 获取当前日期
	var date = new Date();

	// 获取当前月份
	var nowMonth = date.getMonth() + 1;

	// 获取当前是几号
	var strDate = date.getDate();

	// 添加分隔符“-”
	var seperator = "";

	// 对月份进行处理，1-9月在前面添加一个“0”
	if (nowMonth >= 1 && nowMonth <= 9) {
	nowMonth = "0" + nowMonth;
	}

	// 对月份进行处理，1-9号在前面添加一个“0”
	if (strDate >= 0 && strDate <= 9) {
	strDate = "0" + strDate;
	}

	// 最后拼接字符串，得到一个格式为(yyyy-MM-dd)的日期
	var nowDate = date.getFullYear() + seperator + nowMonth + seperator + strDate;
	return nowDate;
}

// 历史图用的数据处理函数 1
function calculateMA(dayCount, data) {
	var result = [];
	for (var i = 0, len = data.values.length; i < len; i++) {
		if (i < dayCount) {
			result.push('-');
			continue;
		}
		var sum = 0;
		for (var j = 0; j < dayCount; j++) {
			sum += data.values[i - j][1];
		}
		result.push(+(sum / dayCount).toFixed(3));
	}
	return result;
}

function his_chart(){
	var row = event.target.parentNode.parentNode;
	var stockCode = $(".stockCode", row).text();
	if (stockCode != "") {
		//console.log(stockCode);
		//https://push2his.eastmoney.com/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&fqt=0&end=29991010&klt=101&secid=0.003038&fqt=1&lmt=1000
		
		var today = get_today();
		var stock_code = (stockCode.substring(0,2) == "sz" ? "0":"1") + "." +stockCode.substring(2);
		url = "https://push2his.eastmoney.com/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&fqt=0&end="+today+"&klt=101&secid="+ stock_code+"&fqt=1&lmt=1000";
		//console.log(url);
		$.ajax({
			url:url,
			dataTypey:"json",
			type:"get",
			//async:false,
			//contentType: 'application/json;charset=utf-8',
			success:function(response,status,xhr){
				 

				$.ajax({
					url:'http://127.0.0.1:8080/?code='+stockCode,
					dataType:'json',
					type:'get',
					success:function(rawData) {
					//console.log(rawData);
					const upColor = '#ec0000';
					const upBorderColor = '#8A0000';
					const downColor = '#00da3c';
					const downBorderColor = '#008F28';
						
						//console.log(response);
						let categoryData = [];
						let values = [];
						let volumes = [];
						let buy = [];
						let sell = [];
						let position = [];
						let pointmark = [];

						for (var item in response.data.klines){
							//console.log(response.data.klines[item]);
							var datas = response.data.klines[item].split(',');
							//console.log(datas);
							categoryData.push(datas[0]);
							var jiaoyi = false;
							var buy_num = 0;
							var sell_num = 0;
							var position_num = 0;
							for (var i in rawData.history){
								if (rawData.history[i].date == datas[0]){
									
									if(rawData.history[i].sell_buy == '买入'){
										buy_num += rawData.history[i].num;
									}else{
										sell_num += rawData.history[i].num;
									}
									//console.log(rawData[i].sell_buy);
								}
								pointmark.push({
									name: 'Mark',
									coord: [rawData.history[i].date, rawData.history[i].price],
									value: rawData.history[i].num,
									itemStyle: {
									  color: rawData.history[i].sell_buy == '买入'?'rgb(41,60,85)':'rgb(220,10,10)'
									}
								  });
							}

							for (i in rawData.position){								
								if (rawData.position[i].date == datas[0]){
									position_num = rawData.position[i].num;
								}
							} 


							buy.push([parseInt(item),buy_num,1]);
							sell.push([parseInt(item),sell_num,-1]);
							position.push([parseInt(item),position_num]);
							
							values.push([parseFloat(datas[1]),parseFloat(datas[2]),parseFloat(datas[3]),parseFloat(datas[4])]);
							volumes.push(datas[0]);

						}

						var data = {
							categoryData,
							values,
							volumes,
							buy:buy,
							sell:sell,
							position:position
						}
						console.log(data);

						var option = {
							animation: false,
							legend: {
							bottom: 10,
							left: 'center',
							data: ['K值数据', 'MA5', 'MA10', 'MA20', 'MA30']
							},
							tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'cross'
							},
							borderWidth: 1,
							borderColor: '#ccc',
							padding: 10,
							textStyle: {
								color: '#000'
							},
							position: function (pos, params, el, elRect, size) {
								const obj = {
								top: 10
								};
								obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
								return obj;
							}
							// extraCssText: 'width: 170px'
							},
							axisPointer: {
							link: [
								{
								xAxisIndex: 'all'
								}
							],
							label: {
								backgroundColor: '#777'
							}
							},
							toolbox: {
							feature: {
								dataZoom: {
								yAxisIndex: false
								},
								brush: {
								type: ['lineX', 'clear']
								}
							}
							},
							brush: {
							xAxisIndex: 'all',
							brushLink: 'all',
							outOfBrush: {
								colorAlpha: 0.1
							}
							},
							visualMap: {
							show: false,
							seriesIndex: 5,
							dimension: 2,
							pieces: [
								{
								value: 1,
								color: downColor
								},
								{
								value: -1,
								color: upColor
								}
							]
							},
							grid: [
							{
								left: '10%',
								right: '8%',
								height: '50%'
							},
							{
								left: '10%',
								right: '8%',
								top: '63%',
								height: '16%'
							}
							],
							xAxis: [
							{
								type: 'category',
								data: data.categoryData,
								scale: true,
								boundaryGap: false,
								axisLine: { onZero: false },
								splitLine: { show: false },
								min: 'dataMin',
								max: 'dataMax',
								axisPointer: {
								z: 100
								}
							},
							{
								type: 'category',
								gridIndex: 1,
								data: data.categoryData,
								scale: true,
								boundaryGap: false,
								axisLine: { onZero: false },
								axisTick: { show: false },
								splitLine: { show: false },
								axisLabel: { show: false },
								min: 'dataMin',
								max: 'dataMax'
							}
							],
							yAxis: [
							{
								scale: true,
								splitArea: {
								show: true
								}
							},
							{
								scale: true,
								gridIndex: 1,
								splitNumber: 2,
								axisLabel: { show: false },
								axisLine: { show: false },
								axisTick: { show: false },
								splitLine: { show: false }
							}
							],
							dataZoom: [
							{
								type: 'inside',
								xAxisIndex: [0, 1],
								start: 95,
								end: 100
							},
							{
								show: true,
								xAxisIndex: [0, 1],
								type: 'slider',
								top: '85%',
								start: 95,
								end: 100
							}
							],
							series: [
							{
								name: 'K值数据',
								type: 'candlestick',
								data: data.values,
								itemStyle: {
									color: upColor,
									color0: downColor,
									borderColor: upBorderColor,
									borderColor0: downBorderColor
								},
								tooltip: {
									formatter: function (param) {
										param = param[0];
										return [
										'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
										'开盘: ' + param.data[0] + '<br/>',
										'收盘: ' + param.data[1] + '<br/>',
										'最低: ' + param.data[2] + '<br/>',
										'最高: ' + param.data[3] + '<br/>'
										].join('');
									}
								},
								markPoint: {
       
									//data: pointmark
								}
								
							},
							{
								name: 'MA5',
								type: 'line',
								data: calculateMA(5, data),
								smooth: false,
								lineStyle: {
								opacity: 0.5
								}
							},
							{
								name: 'MA10',
								type: 'line',
								data: calculateMA(10, data),
								smooth: true,
								lineStyle: {
								opacity: 0.5
								}
							},
							{
								name: 'MA20',
								type: 'line',
								data: calculateMA(20, data),
								smooth: true,
								lineStyle: {
								opacity: 0.5
								}
							},
							{
								name: 'MA30',
								type: 'line',
								data: calculateMA(30, data),
								smooth: true,
								lineStyle: {
								opacity: 0.5
								}
							},
							/*
							{
								name: '买入',
								type: 'bar',
								data: data.buy,
								smooth: true,
								lineStyle: {
								opacity: 0.5
								}
							},
							
							{
								name: 'Volume',
								type: 'bar',
								xAxisIndex: 1,
								yAxisIndex: 1,
								data: data.volumes
							},
							*/
							{
								name: '买入',
								type: 'bar',
								xAxisIndex: 1,
								yAxisIndex: 1,
								data: data.buy
							},
							
							{
								name: '卖出',
								type: 'bar',
								xAxisIndex: 1,
								yAxisIndex: 1,
								data: data.sell
							},
							{
								name: '持仓',
								type: 'line',
								xAxisIndex: 1,
								yAxisIndex: 1,
								data: data.position
							}
							]
						};

						var myChart = echarts.init(document.getElementById('main'));
						myChart.setOption(option);
					}
				});
			}
		});	
	}
}


//function get_date(stock_code){
function show_chart(){
	var row = event.target.parentNode.parentNode;
	var markPointData = [
		{type:'max',name:'最高'},
		{type:'min',name:'最低'}];
	var stockCode = $(".stockCode", row).text();
	//console.log(stockCode);
	if (stockCode != "") {
		var jiaoyiLog ;		
		var stockBuyNum = $(".stockBuyNum",row).text()*1;

		SettingsDB.getStock(stockCode,function(result){
			var y_data_chigu=[];
			var buy_val=0,sell_val=0;
			jiaoyiLog = result;
			console.log(jiaoyiLog);
			if(jiaoyiLog.length >0)
			{
				for(var jiaoyi in jiaoyiLog){
					if(jiaoyiLog[jiaoyi].value>0)
					{
						buy_val += jiaoyiLog[jiaoyi].value;
						markPointData.push({name:'买入',value:'买入'+jiaoyiLog[jiaoyi].value,xAxis:jiaoyiLog[jiaoyi].time,yAxis:jiaoyiLog[jiaoyi].price});
					}else{
						sell_val += -jiaoyiLog[jiaoyi].value;
						markPointData.push({name:'卖出',value:'卖出'+jiaoyiLog[jiaoyi].value,xAxis:jiaoyiLog[jiaoyi].time,yAxis:jiaoyiLog[jiaoyi].price});
					}
				}
				
			}
			y_data_chigu.push(stockBuyNum);
			y_data_chigu.push(buy_val);
			y_data_chigu.push(sell_val);
			stockCode = stockCode.replace('sh','0');
			stockCode = stockCode.replace('sz','1');
			console.log(markPointData);
	
			$.ajax({
				url:"http://img1.money.126.net/data/hs/time/today/"+stockCode+".json",
				dataTypey:"json",
				type:"get",
				//async:false,
				success:function(response,status,xhr){
					//console.log('状态为：' + status + ',状态是：' + xhr.statusText);
					//console.log(response);
					var x_Axis=[],y_data=[],i=0,y_data_bili=[];
					for ( var data in response.data){               
						temp_string = response.data[data][0];
						//console.log(typeof(temp_string));
						x_Axis.push(temp_string.substr(0, 2)+':'+temp_string.substr(2));                
						y_data.push(response.data[data][1]);
						y_data_bili.push(((response.data[data][1]-response.yestclose)/response.yestclose*100).toFixed(2));
						i ++;						
					}
					while(i<242){
						x_Axis.push("");
						i++;
					}
					var colors = ['#5470C6', '#91CC75', '#EE6666'];
					var option = {
						title: {
							text: response.name
						},
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'cross'
							}
						},
						grid: [
							{
								left: '5%',
								right: '20%',
								//bottom: 20
							},
							{
								left: '85%',
								right: '5%',
								//height: 80,
								//bottom: 10
							}
						],
						xAxis: [
							{
								data: x_Axis
							},
							{
								scale:true,
								//type:'value',
								gridIndex:1,
								//data:y_data_chigu
								data:['持有','买入','卖出']
								
							}
						],
						legend:{
							data:['股价','浮动比','持股数量']
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
						yAxis: [
							{
								type:'value',
								scale:true,
								name:"股价",
								axisLine: {
									show: true,
									lineStyle: {
										color: colors[0]
									}
								},
								axisLabel: {
									formatter: '{value} 元'
								}
							},
							{
								type:'value',
								scale:true,
								name:"浮动比",
								axisLine: {
									show: true,
									lineStyle: {
										color: colors[0]
									}
								},
								axisLabel: {
									formatter: '{value}%'
								}
							},
							{
								//type:'category',
								type:'value',								
								name:"持股数量",
								//offset: 60,
								gridIndex:1,
								axisLine: {
									show: true,
									lineStyle: {
										color: colors[0]
									}
								},
								
							}
						],
						series: [
							{
								name: '股价',
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
									symbol: "pin",
									data:markPointData
								}
							},
							{
								name: '浮动比',								
								type: 'bar',
								yAxisIndex:1,
								xAxisIndex:0,
								data: y_data_bili								
							},
							{
								name: '持股数量',								
								type: 'bar',
								yAxisIndex:2,
								xAxisIndex:1,
								//data: ['持有','买入','卖出']	
								data:y_data_chigu							
							}
						]
					};
					var myChart = echarts.init(document.getElementById('main'));
					myChart.setOption(option);
					
				}
			});



		});		
		
		
		//console.log('股票代码：'+stockCode);		
	}else{
		return;
	}	
	
}


function saveOptions()
{	
	var stocks = {};
	var rows = $("#stocksTable .tableRow");
	var stockId = 0;
	var surplus = 0;
	
	for (var i = 0; i < rows.length; i++)
	{
		var row = rows[i];

		var flag = $(".flag", row).hasClass("remove") ? 1 : 0;
		
		var stock = {
			stockName: $(".stockName", row).text(),
			stockCode: $(".stockCode", row).text(),
			stockUpPrice: parseFloat($(".stockUpPrice", row).text()).toFixed(3),
			stockDownPrice: parseFloat($(".stockDownPrice", row).text()).toFixed(3),
			stockBuyPrice:parseFloat($(".stockBuyPrice", row).text()).toFixed(3),
			stockBuyNum:parseFloat($(".stockBuyNum", row).text()).toFixed(),
			stockFlag: flag,
		};
		
		if (stock.stockCode != "")
		{
			stocks[stockId] = stock;
			stockId++;
		}
    }
	
	Settings.setObject("stockListStocks", stocks);
	
	if (rows.length < Settings.getValue("popupStockPosition"))
		Settings.setValue("popupStockPosition", 0);

	//tangxn add
	//surplus = Settings.setValue("surplus",surplus);
	
	backgroundPage.reloadSock = true;
	backgroundPage.refreshStocks();
	
	initializeStockRow();
	
	showMessage("保存成功");
}

function saveStockNote() {
	var stockCode = $("textarea#txtStockNote").attr("tag");
	
	Settings.setValue("note_" + stockCode, $("textarea#txtStockNote").val());
	
	showMessage("保存备注成功");
}

function saveStockJiaoyi() {
	var stockCode = $("#price").attr("tag");
	var kind = $('input[name="jiaoyi"]:checked').val();
	var price = $('#price').val()*1;
	var value = $('#value').val()*1;

	var row = $('tr:contains("'+stockCode+'")');
	var oldValue = $("#stockBuyNum", row).text()*1;	
	//return;
	if (price*1 >0 && value*1 >0)
	{
		if ( kind === 'sell')
		{
			SettingsDB.sell(stockCode,price,value);
			value = oldValue-value;
		}else{
			SettingsDB.buy(stockCode,price,value);
			value = oldValue + value;
		}
		//console.log(value);
		$("#stockBuyNum", row).text(value);
		$(".stockBuyNum", row).html(value);
		showMessage("保存交易成功");
		saveOptions();

	}else showMessage("输入错误");

	
}

var hideMessageTime = -1;

function showMessage(msg) {
	
	$("#message").html(msg).css({ 'top': '-34' }).animate({ 'top': '0' }, 100);
	
	if (hideMessageTime > 0)
		hideMessageTime = 20;
	else
	{
		hideMessageTime = 20;
		window.setTimeout(eraseMessage, 100);
	}
}

function eraseMessage() {
	if (hideMessageTime > 0)
	{
		hideMessageTime--;
		window.setTimeout(eraseMessage, 100);
	}
	else
	{
		$("#message").animate({ 'top': '-34' }, 200);
	}
}

function init() {
	var surplus = 0;

	initializeTabs();
	
	$("#div-stock-note").hide();
	$("#stock-note-control").hide();
	$("#div-stock-jiaoyi").hide();
	$("#stock-jiaoyi-control").hide();
	
	backgroundPage = chrome.extension.getBackgroundPage();
	
	if ( backgroundPage.Settings.getValue("displayAlert", true) ) {
		if ( isWebkitHTMLNotificationsEnabled() ) {
			 if ( webkitNotifications.checkPermission() == 0 ) 	$("#displayAlertInput").attr("checked", "checked");
		}
		else {
			$("#displayAlertInput").attr("checked", "checked");
		}
	}

	//tangxn add
	if(/[\d\.]+/.test(backgroundPage.Settings.getValue("surplus"))){
		surplus = backgroundPage.Settings.getValue("surplus",0);
		//var test = backgroundPage.Settings.getValue("displayAlert", true);
		//console.log(surplus);
	}else{
		backgroundPage.Settings.setValue("surplus",surplus);
	}		
	$("#surplusInput").val(surplus);
	
	
	if(backgroundPage.Settings.getValue("soundAlert", true)) {
		$("#soundAlertInput").attr("checked", "checked");
	}
	
//	if(backgroundPage.Settings.getValue("animateAlert", false)) {
//		$("#animateAlertInput").attr("checked", "checked");
//	}
	
	if(backgroundPage.Settings.getValue("showPrice", true)) {
		$("#showPriceInput").attr("checked", "checked");
	}

	if(backgroundPage.Settings.getValue("showRange", false)) {
		$("#showRangeInput").attr("checked", "checked");
	}

	if(backgroundPage.Settings.getValue("showRight", true)) {
		$("#showRightInput").attr("checked", "checked");
	}
	
	if(backgroundPage.Settings.getValue("showPicture", true)) {
		$("#showStockPicture").attr("checked", "checked");
	}
	
	if(backgroundPage.Settings.getValue("showSinaLink", false)) {
		$("#showSinaLinkInput").attr("checked", "checked");
	}

	if(backgroundPage.Settings.getValue("showXueqiuLink", false)) {
		$("#showXueqiuLinkInput").attr("checked", "checked");
	}

	$('.alertRow input[type=checkbox]').change(function(e) {
        var name = e.target.name;
        
        if (name == "displayAlert" && e.target.checked == true) {
        	if ( isWebkitHTMLNotificationsEnabled() ) {
	        	if(webkitNotifications.checkPermission() != 0) {
					webkitNotifications.requestPermission(function() {
						if(webkitNotifications.checkPermission() != 0) {
							e.target.checked = false;
						}
					});
				}
			}
        }
        backgroundPage.Settings.setValue(name, e.target.checked);
        backgroundPage.displayStocks();
        
        showMessage("自动保存成功");
    });

	$("textarea#txtStockNote").autoResize({
		defaultHeight: 88,
		animate: false,
		animateDuration : 300,
		extraSpace : 30,
		limit: 520
	});

	$("#btnNewStock").click(function() { newStockRow(undefined, true); });
	$("#btnLoadStock").click(function() { updateStockPrice(); });
	$("#btnSaveStock").click(function() { saveOptions(); });
	$("#btnBackOptions").click(function() { backOptionsPage(); });
	$("#btnBackOptions2").click(function() { backOptionsPage2(); });
	$("#btnSaveNote").click(function() { saveStockNote(); });
	$("#btnSavejiaoyi").click(function() { saveStockJiaoyi(); });
	$("#btnExportStock").click(function() { exportStock(); });
	$("#btnImportStock").click(function() { importStock(); });
	$("#btnSaveSurplus").click(function(){SaveSurplus();});
	//tangxn add
	$("#btnExportStockHuoban").click(function() { exportStockHuoban(); });
	$("#btnImportStockHuoban").click(function() { importStockHuoban(); });
	//$("#btnBuyStock").click(function() { BuyStock(); });
	//$("#btnSellStock").click(function() { SellStock(); });
	$("#btnCleanjiaoyi").click(function(){SettingsDB.clean();showMessage("交易记录已被清空");});

	
	$("#stocksTable").delegate(".note", "click", function(){ showStockNote(); });
	$("#stocksTable").delegate(".delete", "click", function(){ deleteStockRow(); });
	$("#stocksTable").delegate(".flag", "click", function(){ flagStock(); });
	$("#stocksTable").delegate(".chart", "click", function(){ show_chart(); });
	$("#stocksTable").delegate("#history", "click", function(){ his_chart(); });
	$("#stocksTable").delegate("#jiaoyi", "click", function(){ BuyStock(); });
	
	initializeStockRow();
	//放在循环里不知道有什么问题没有，但是放在其他地方不起作用。
	$("#stocksTable").tablesorter({
		theme : 'blue',
		textExtraction: {
		4: function(node, table, cellIndex) {
			//console.log($(node).find("span").value());
				return $(node).find("span:last").text();
		}
		},
		headers:{
			0:{sorter:false},
			1:{sorter:false},
			15:{sorter:false},
			3:{ sorter : "percent" },
			4:{ sorter : "digit" },
			5:{ sorter : "digit" },
			6:{ sorter : "digit" },
			7:{ sorter : "digit" },
			8:{ sorter : "digit" },
			9:{ sorter : "digit" },
			10:{ sorter : "digit" },
			11:{ sorter : "digit" },
			12:{ sorter : "digit" },
			13:{ sorter : "digit" },
			14:{ sorter : "digit" }
		}
	});
	window.setTimeout(updateStockPriceLoop, 5000);
}
function initializeTabs() {
	$("ul.menu li:first").addClass("tabActive").show(); 
	$("#options > div").hide();
	$("#custom-stock-infos").show();
	
	$("ul.menu li").click(function() {

		$("ul.menu li").removeClass("tabActive"); 
		$(this).addClass("tabActive");
		$("#options > div").hide();
		
		var activeTab = $(this).find("a").attr("href");
		$(activeTab).fadeIn();
		return false;
	});
}
function initializeStockRow() {
	$("#stocksTable .tableRow").remove();
	var stockListStocks = Settings.getObject("stockListStocks");

	if (undefined != stockListStocks) {
		
		for (var i in stockListStocks) {
			var stock = stockListStocks[i];
			newStockRow(stock, false);
		}
	}
	else
		newStockRow(undefined, true);

	$("#stocksTable tr.tableRow:odd").addClass("odd");
	
	$("#stocksTable").tableDnD({
		onDragClass: "myDragClass",
        onDrop: function(table, row) {
            stopUpdateInfo = false;
            $("#stocksTable tr.tableRow:odd").addClass("odd");
            $("#stocksTable tr.tableRow:even").removeClass("odd");
        },
        onDragStart: function(table, row) {
			stopUpdateInfo = true;
		},
        //dragHandle: "dragHandle"
    });
	
	
}
function setAutoComplete(input, row) {
	// http://suggest3.sinajs.cn/suggest/type=&key=flzc&name=gpdm
	input.autocomplete(stockInfos, {
			max: 5,
			minChars: 1,
			matchSubset: true,
			matchContains: true,
			autoFill: false,
			highlight: false,
			width: "118px",
			formatItem: function(item, i, max) { 
				return item.name + '┊' + item.code; 
			}, 
			formatMatch: function(item, i, max) { 
				return item.pyname + item.name + item.code;
			}, 
			formatResult: function(item) { 
				return item.name; 
			} 
		}).result(function(event, item, formatted) { 
			$(".stockName", row).text(item.name);
			$(".stockCode", row).text(item.code);
			updateStockInfo(row);
		}
	); 
}

function enterFieldEditMode(cell) {
	var input = $("input", cell);
	var span = $("span", cell);

	if (input.is(":visible") || input.html() == null)
		return;
					
	input.val(span.text());
	input.toggle();
	span.toggle();
	input.focus();
	
	if (input.attr("id") == "stockName")
		setAutoComplete(input, span.parent().parent().parent());
}

function exitFieldEditMode(cell) {
	var input = $("input", cell);
	var span = $("span", cell);
	var newValue = input.val();
	
	input.toggle();
	span.toggle();
	
	if (input.attr("id") != "stockName") {
		span.text(newValue);
	} else {
		var patrn=/^s[hz]{1}[0-9]{6}$/;
		if (patrn.exec(newValue)) {
			var row = span.parent().parent().parent();
			$(".stockCode", row).text(newValue);
			updateStockInfo(row);
		}
	}
	
	if (input.attr("id") != "stockName") {
		updateStockInfo(span.parent().parent().parent());
	}
}

function updateStockInfo(row) {
	if ($(".stockCode", row).text() == "")
		return;

	if (stopUpdateInfo == true)
		return;
	
	$(".stockPrice", row).html("<img alt=\"获取价格中\" src=\"images/loading.gif\" height=\"13px\">");
	getStockInfo($(".stockCode", row).text(), function(stockInfo, stockName) {
		if (stockInfo == undefined) {
			if ( $(".stockName", row).text() == "" ) {
				$(".stockCode", row).text("");
				$(".stockPrice", row).text("获取失败");
			}
		}
		else {
			if ( stockName != undefined ) $(".stockName", row).text(stockName);
			if (stockInfo.stockOpenPrice == 0) {	
				row.removeClass("stockUp").removeClass("stockDown").addClass("stockStop");
			}
			else {
				if (parseFloat(stockInfo.stockChangeAmt) >= 0) {
					row.removeClass("stockStop").removeClass("stockDown").addClass("stockUp");
				}
				else {
					row.removeClass("stockStop").removeClass("stockUp").addClass("stockDown");
				}
				
				stockCurrPrice = parseFloat(stockInfo.stockCurrPrice);
				
				oStockUpPrice = $(".stockUpPrice", row);
				stockUpPrice = parseFloat(oStockUpPrice.text());
				if (stockUpPrice != 0 && stockCurrPrice > stockUpPrice) {
					oStockUpPrice.addClass("stockUp");
				}
				else {
					oStockUpPrice.removeClass("stockUp");
				}
				
				oStockDownPrice = $(".stockDownPrice", row);
				stockDownPrice = parseFloat(oStockDownPrice.text());
				if ( stockDownPrice != 0 && stockCurrPrice < stockDownPrice) {
					oStockDownPrice.addClass("stockDown");
				}
				else {
					oStockDownPrice.removeClass("stockDown");
				}
			}
			
			$(".stockOpenPrice", row).text(stockInfo.stockOpenPrice);
			$(".stockClosePrice", row).text(stockInfo.stockClosePrice);
			$(".stockMaxPrice", row).text(stockInfo.stockMaxPrice);
			$(".stockMinPrice", row).text(stockInfo.stockMinPrice);
			//tangxn add
			$(".stockProfit", row).text(parseFloat((stockInfo.stockCurrPrice - parseFloat($(".stockBuyPrice", row).text()))*parseFloat($(".stockBuyNum", row).text())).toFixed(3));
			
			if (parseFloat(stockInfo.stockOpenPrice) == 0) {
				$(".stockPrice", row).text("0.00");
				$(".stockChangeAmt", row).text("0.00");
				$(".stockChangeRate", row).text("0.00%");
			}
			else {
				$(".stockPrice", row).text(stockInfo.stockCurrPrice);
				
				if (stockInfo.stockChangeRate < 0) {
					$(".stockChangeAmt", row).text(stockInfo.stockChangeAmt);
					$(".stockChangeRate", row).html(stockInfo.stockChangeRate + "%");
				}
				else {
					$(".stockChangeAmt", row).text("+" + stockInfo.stockChangeAmt);
					$(".stockChangeRate", row).html("+" + stockInfo.stockChangeRate + "%");
				}
			}
			//$("#stocksTable").trigger("updateCache");
			//$("#stocksTable").trigger("update");
		}
	});
}

function updateStockPriceLoop(){
	
	if (isOperation())
	{
		updateStockPrice();	
	}
	$("#stocksTable").trigger("updateCache");
	$("#stocksTable").trigger("update");
	//$("#stocksTable").trigger("updateAll");
	var sorting = [[$("#stocksTable").data('sorting'), 0]];
	$("#stocksTable").trigger("sorton", [sorting]);
	$("#stocksTable").trigger("sorton",[sorting]);
	
	
	//先清除事件，再绑定
	$("#stocksTable").undelegate();
	$("#stocksTable").undelegate();
	$("#stocksTable").undelegate();
	$("#stocksTable").undelegate();
	$("#stocksTable").undelegate();

	$("#stocksTable").delegate(".note", "click", function(){ showStockNote(); });
	$("#stocksTable").delegate(".delete", "click", function(){ deleteStockRow(); });
	$("#stocksTable").delegate(".flag", "click", function(){ flagStock(); });
	$("#stocksTable").delegate(".chart", "click", function(){ show_chart(); });
	$("#stocksTable").delegate("#history", "click", function(){ his_chart(); });
	$("#stocksTable").delegate("#jiaoyi", "click", function(){ BuyStock(); });
	window.setTimeout(updateStockPriceLoop, 5000);
}

function updateStockPrice() {
	$("#btnLoadStock").attr("disabled", "disabled"); 
	setTimeout(function() {
		var rows = $("#stocksTable .tableRow");
					
		for (var i = 0; i < rows.length; i++) {
			updateStockInfo($(rows[i]));
		}
		//$("#myTable").tablesorter({ sortList: [[0,0], [1,0]] });
		
		$("#btnLoadStock").attr("disabled", ""); 
	}, 0);
}

function newStockRow(stock, activate) {
	var table = $("#stocksTable");
	var row = $("#stocksTable .templateRow").clone();
	
	row.removeClass("templateRow").addClass("tableRow");	
	table.append(row);

	$("td", row).click(function() {
		enterFieldEditMode(this);
	});
	$("input", row).blur(function() {
		exitFieldEditMode(this.parentNode);
	}).keypress(function() {
		if (event.keyCode == 13) // Enter Key
			$(event.target).blur();
	});
	
	$(".stockCode", row).click(function() {
		openStockPage($(this).text());
	});
	
	if (stock) {
		$(".stockName", row).text(stock.stockName);
		$(".stockCode", row).html(stock.stockCode);
		$(".stockUpPrice", row).text(stock.stockUpPrice);
		$(".stockDownPrice", row).text(stock.stockDownPrice);
		//汤旭宁add
		$(".stockBuyPrice", row).text(stock.stockBuyPrice);
		$(".stockBuyNum", row).text(stock.stockBuyNum);
		$("#stockBuyPrice", row).text(stock.stockBuyPrice);
		$("#stockBuyNum", row).text(stock.stockBuyNum);

		if ( typeof(stock.stockFlag) != "undefined" && stock.stockFlag == 1 ) {
			$(".flag", row).addClass("remove").attr("title", "取消标记置顶");
		}
		else {
			$(".flag", row).addClass("add").attr("title", "标记置顶状态");;
		}
		
		if (Settings.getValue("note_" + stock.stockCode, "") != "") {
			$(".note", row).addClass("pressed");
		}
		updateStockInfo(row);
	}
	else {
		//$(".dragHandle", row).removeClass("dragHandle").attr("title", "");
	}

	if (activate) {
		$("td:first", row).click();
		$("td:first input", row).select();
	}
}

function flagStock() {
	var oFlag = ($(event.target));
	if ( oFlag.hasClass("add") ) {
		oFlag.removeClass("add").addClass("remove").attr("title", "取消标记置顶");
		console.log("add");
	} 
	else if ( oFlag.hasClass("remove") ) {
		oFlag.removeClass("remove").addClass("add").attr("title", "标记置顶状态");
		console.log("remove");
	}

	console.log("flag");
}

function showStockNote() {
	var row = $(event.target.parentNode.parentNode);
	
	var stockCode = $(".stockCode", row).text();
	
	if (stockCode != "") {
		$("#noteTitle").text("“" + $(".stockName", row).text() + " | " + stockCode + "” 的备注：");
		
		if ($("textarea#txtStockNote").attr("tag") != stockCode) {
			$("textarea#txtStockNote").val(Settings.getValue("note_" + stockCode, "")).attr("tag", stockCode);
		}
		
		$("textarea#txtStockNote").focus();
	}
	
	$("#stocksTable").hide();
	$("#custom-stock-control").hide();
	$("#div-stock-note").show();
	$("#stock-note-control").show();
}

function backOptionsPage() {
	$("#div-stock-note").hide();
	$("#stock-note-control").hide();
	$("#stocksTable").show();
	$("#custom-stock-control").show();
}
function backOptionsPage2() {
	$("#div-stock-jiaoyi").hide();
	$("#stock-jiaoyi-control").hide();
	$("#stocksTable").show();
	$("#custom-stock-control").show();
}

function deleteStockRow() {
	var row = event.target.parentNode.parentNode;
	
	$(event.target).addClass("pressed");
	
	if (window.confirm("\n确实要删除该股票吗？"))
	{
		$(row).remove();
		$("#btnNewStock").show();
	}
	else
		$(event.target).removeClass("pressed");
}

function exportStock() {
	var stockListStocks = Settings.getObject("stockListStocks");
	var strStockInfo = JSON.stringify(stockListStocks);
	strStockInfo = strStockInfo.replace(/},/g, "},\r\n");
	
	var textarea = $("#txtBackup");
	textarea.val(strStockInfo);
	textarea.focus();
	textarea.select();
	
	showMessage("导出数据成功，请保存");
}

function importStock() {	
	var json = $("#txtBackup").val();
    if (json && json != "")
    {
        try {
			stockInfos = JSON.parse(json);
	
			if (undefined != stockInfos) {
				Settings.setObject("stockListStocks", stockInfos);
				
				Settings.setValue("popupStockPosition", 0);
				
				backgroundPage.reloadSock = true;
				backgroundPage.refreshStocks();
				
				initializeStockRow();
				
				saveOptions();
				
				showMessage("导入成功");
			}
        }
        catch(e) {
			console.log(e);
			showMessage("导入失败，请重试");
		}
    }
}

//tangxn add
//保存余额参数
function SaveSurplus(){
	var surplus = $("#surplusInput").val();
	backgroundPage.Settings.setValue("surplus",surplus);
}

//导出股票设置到表格
function exportStockHuoban(){
	
}

function BuyStock(){
	var row = $(event.target.parentNode.parentNode.parentNode);
	
	var stockCode = $(".stockCode", row).text();
	//console.log(row);
	if (stockCode != "") {
		$("#jiaoyiTitle").text("“" + $(".stockName", row).text() + " | " + stockCode + "” 的交易：");
		
		if ($("#price").attr("tag") != stockCode) {
			$("#price").attr("tag", stockCode);
		}
	}	
	$("#stocksTable").hide();
	$("#custom-stock-control").hide();
	$("#div-stock-jiaoyi").show();
	$("#stock-jiaoyi-control").show();
}


//从表格导入股票参数
function importStockHuoban(){
	getStock_test();
}