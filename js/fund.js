$(document).ready(function() {
   init(); 
});

var stopUpdateInfo = false;


function init() {
	var surplus = 0;

	initializeTabs();
	$("#btnLoadFund").click(function() { updateFundPrice(); });
	
	
	initializeFundRow();
	//放在循环里不知道有什么问题没有，但是放在其他地方不起作用。
	$("#fundsTable").tablesorter({
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
			2:{sorter:false},
			3:{ sorter : "digit" },
			4:{ sorter : "digit" },
			5:{ sorter : "digit" },
			6:{ sorter : "digit" },
		}
	});
	$("#btnLoadFund").click(function() { updateFundPrice(); });
	window.setTimeout(updateFundPriceLoop, 5000);
}
function initializeTabs() {
	$("ul.menu li:first").addClass("tabActive").show(); 
	$("#options > div").hide();
	$("#custom-fund-infos").show();
	
	
	$("ul.menu li").click(function() {

		$("ul.menu li").removeClass("tabActive"); 
		$(this).addClass("tabActive");
		$("#options > div").hide();
		
		var activeTab = $(this).find("a").attr("href");
		$(activeTab).fadeIn();
		return false;
	});
}

function newFundRow(fund, activate) {
	var table = $("#fundsTable");
	var row = $("#fundsTable .templateRow").clone();
	
	row.removeClass("templateRow").addClass("tableRow");	
	table.append(row);

	$(".fundCode", row).click(function() {
		openStockPage($(this).text());
	});
	console.log(fund);
	
	if (fund) {
		$(".fundName", row).text(fund.name);
		$(".fundCode", row).html(fund.code);
		$(".fundUnit", row).text(fund.unit);
		$(".fundValue", row).text(fund.value);

		if ( typeof(fund.stockFlag) != "undefined" && fund.stockFlag == 1 ) {
			$(".flag", row).addClass("remove").attr("title", "取消标记置顶");
		}
		else {
			$(".flag", row).addClass("add").attr("title", "标记置顶状态");;
		}
		
		updateFundInfo(row);
	}
	else {
		//$(".dragHandle", row).removeClass("dragHandle").attr("title", "");
	}

	if (activate) {
		$("td:first", row).click();
		$("td:first input", row).select();
	}
}

function initializeFundRow() {
	$("#fundsTable .tableRow").remove();

	$.ajax({
		url:'http://127.0.0.1:8080/fund',
		dataType:'json',
		type:'get',
		success:function(rawData) {
			var fundList = [];
			//console.log(rawData);
			for(var fund in rawData){
				
				if(!(rawData[fund].code in fundList)){
					fundList[rawData[fund].code] ={
						name:rawData[fund].name,
						code:rawData[fund].code,
						platform:rawData[fund].platform,
						value:0,
						unit:0
					}
					//console.log(typeof(fund));					
					if(rawData[fund].buy_sell == '买入' || rawData[fund].buy_sell == '转入' ){
						fundList[rawData[fund].code].value = parseFloat(rawData[fund].unit).toFixed(4) * parseFloat(rawData[fund].net_value).toFixed(4);
						fundList[rawData[fund].code].unit = parseFloat(rawData[fund].unit).toFixed(2);
					}else{
						fundList[rawData[fund].code].value = 0 - parseFloat(rawData[fund].unit).toFixed(4) * parseFloat(rawData[fund].net_value).toFixed(4);
						fundList[rawData[fund].code].unit = 0 - parseFloat(rawData[fund].unit).toFixed(2);
					}					
				}else{
					var a =0,b=0;
					a = fundList[rawData[fund].code].value;
					b = fundList[rawData[fund].code].unit;
					if(rawData[fund].code == "519091"){
						console.log('a:'+a);
						console.log('b:'+b);
					}
					if(rawData[fund].buy_sell == '买入' || rawData[fund].buy_sell == '转入' ){						
						//fundList[rawData[fund].code].value = parseFloat(fundList[rawData[fund].code].value).toFixed(4) + parseFloat(rawData[fund].unit).toFixed(2) * parseFloat(rawData[fund].net_value).toFixed(4);
						//fundList[rawData[fund].code].unit = parseFloat(fundList[rawData[fund].code].unit).toFixed(2) + parseFloat(rawData[fund].unit).toFixed(2);
						a = -((-a) + (-parseFloat(rawData[fund].unit).toFixed(2) * parseFloat(rawData[fund].net_value).toFixed(4)));
						b = -((-b) + (-parseFloat(rawData[fund].unit).toFixed(2)));
						//fundList[rawData[fund].code].value += parseFloat(rawData[fund].unit).toFixed(4) * parseFloat(rawData[fund].net_value).toFixed(4);
						//fundList[rawData[fund].code].unit += parseFloat(rawData[fund].unit).toFixed(2);
					}else{
						//fundList[rawData[fund].code].value = parseFloat(fundList[rawData[fund].code].value).toFixed(4) - parseFloat(rawData[fund].unit).toFixed(2) * parseFloat(rawData[fund].net_value).toFixed(4);
						//fundList[rawData[fund].code].unit = parseFloat(fundList[rawData[fund].code].unit).toFixed(2) - parseFloat(rawData[fund].unit).toFixed(2);
						//fundList[rawData[fund].code].value -= parseFloat(rawData[fund].unit).toFixed(4) * parseFloat(rawData[fund].net_value).toFixed(4);
						//fundList[rawData[fund].code].unit -= parseFloat(rawData[fund].unit).toFixed(2);
						a = a - parseFloat(rawData[fund].unit).toFixed(2) * parseFloat(rawData[fund].net_value).toFixed(4);
						b = b - parseFloat(rawData[fund].unit).toFixed(2);
					}
					fundList[rawData[fund].code].value = a;
					fundList[rawData[fund].code].unit = b;
					if(rawData[fund].code == "519091"){
						console.log('a:'+a);
						console.log(parseFloat(rawData[fund].unit).toFixed(2) * parseFloat(rawData[fund].net_value).toFixed(4));
						console.log('b:'+b);
						console.log(parseFloat(rawData[fund].unit).toFixed(2))
					}
					
				}
				
				fundList[rawData[fund].code].value = Math.floor(fundList[rawData[fund].code].value*10000)/10000;
				fundList[rawData[fund].code].unit = Math.floor(fundList[rawData[fund].code].unit*100)/100;
				 
			}
			console.log(fundList);
			if (undefined != fundList) {
		
				for (var i in fundList) {
					var fund = fundList[i];
					newFundRow(fund, false);
				}
			}
			else
				newFundRow(undefined, true);
		}
	});

	

	$("#fundsTable tr.tableRow:odd").addClass("odd");
	
	$("#fundsTable").tableDnD({
		onDragClass: "myDragClass",
        onDrop: function(table, row) {
            stopUpdateInfo = false;
            $("#fundsTable tr.tableRow:odd").addClass("odd");
            $("#fundsTable tr.tableRow:even").removeClass("odd");
        },
        onDragStart: function(table, row) {
			stopUpdateInfo = true;
		},
        //dragHandle: "dragHandle"
    });
	
	
}


function updateFundInfo(row) {
	if ($(".fundCode", row).text() == "")
		return;

	if (stopUpdateInfo == true)
		return;
	
	$(".fundNetValue", row).html("<img alt=\"获取价格中\" src=\"images/loading.gif\" height=\"13px\">");
	getFundInfo($(".fundCode", row).text(), function(fundInfo, fundName) {
		if (fundInfo == undefined) {
			if ( $(".fundName", row).text() == "" ) {
				$(".fundCode", row).text("");
				$(".fundNetValue", row).text("获取失败");
			}
		}
		else {
			if ( fundInfo != undefined ) $(".fundName", row).text(fundInfo);

			
			$(".fundNetValue", row).text(fundInfo.fundNetValue);
			var value = parseFloat($(".fundUnit", row).text())*fundInfo.fundNetValue;
			$(".fundNowValue", row).text(value.toFixed(2));
			
			//$("#fundsTable").trigger("updateCache");
			//$("#fundsTable").trigger("update");
		}
	});
}

function updateFundPriceLoop(){
	
	if (isOperation()  && $("#custom-fund-infos").is(":visible"))
	{
		updateFundPrice();	
	}
	$("#fundsTable").trigger("updateCache");
	$("#fundsTable").trigger("update");
	//$("#fundsTable").trigger("updateAll");
	var sorting = [[$("#fundsTable").data('sorting'), 0]];
	$("#fundsTable").trigger("sorton", [sorting]);
	$("#fundsTable").trigger("sorton",[sorting]);
	

	window.setTimeout(updateFundPriceLoop, 5000);
}

function updateFundPrice() {
	$("#btnLoadFund").attr("disabled", "disabled"); 
	setTimeout(function() {
		var rows = $("#fundsTable .tableRow");
					
		for (var i = 0; i < rows.length; i++) {
			updateFundInfo($(rows[i]));
		}
		//$("#myTable").tablesorter({ sortList: [[0,0], [1,0]] });
		
		$("#btnLoadFund").attr("disabled", ""); 
	}, 0);
}


function getFundInfo(fundCode, f){
	try {
		var xhr = new window.XMLHttpRequest();					
		
		//xhr.open("GET", "https://hq.sinajs.cn/list=" + fundCode, true);
		//https://qt.gtimg.cn/q=
		xhr.open("GET", "https://fundgz.1234567.com.cn/js/" + fundCode +".js", true)
		//xhr.setRequestHeader("referer","https://quotes.sina.cn");
		xhr.onreadystatechange = function() {
			var fundInfo = undefined;
			var fundName = undefined;
		
			if (xhr.readyState == 4 && xhr.status == '200') {
				//var elements = xhr.responseText.split(/[\(\)]/);
				var elements = xhr.responseText.replace(/jsonpgz\(/,'');
				elements = elements.replace(/\);/,'');

				if(elements.length > 5) {
					elements = JSON.parse(elements);
					//console.log('iiiii');
					try {
						fundInfo = {
							fundNetValue: parseFloat(elements.dwjz).toFixed(4),
							fundRate: parseFloat(elements.gszzl).toFixed(2)
						}
						fundName = elements.name;
					} catch(e) { 
						//console.error(e); 
						//console.log(elements);
					}
				}
				delete elements;
				
				if (typeof f == "function") {
					f(fundInfo, fundName);
				}
				if ( fundInfo == undefined ) delete fundInfo;
			}
			
			delete xhr;
		}
		xhr.send();
	} catch(e) { console.error(e); }
};