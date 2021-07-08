var Huoban = {};
var huobanUrl = "https://app.huoban.com";
var huobanToken = "";
//字段ID ：股票代码
var stockFiledId = 1104001102000000;
//字段ID ：持仓数量
var stockBuyNumFiledId = 2200000088859734;
//字段ID ：股票名称
var stockNameFiledId = 1104001101000000;

//获取股票列表的item list接口url
var apiItemListUrl= "https://api.huoban.com/v2/item/table/2100000009258469/view/0/filter";

if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}
//获取认证信息
chrome.cookies.get({url:huobanUrl, name:'access_token'}, function(cookie){
	console.log(cookie);
	if(cookie)
		huobanToken = "Bearer " + cookie.value;
});

function getStock_test(){
	try {
		var xhr = new window.XMLHttpRequest();
					
		xhr.open("POST", apiItemListUrl, true);
		xhr.setRequestHeader("Authorization",huobanToken);
		xhr.onreadystatechange = function() {
			

			if (xhr.readyState == 4) {
				//console.log(xhr.responseText);
				var huoban = JSON.parse(xhr.responseText);
				//console.log(huoban.filtered);
				var jsonStr = "{";
				//"0":{"stockName":"九鼎投资","stockCode":"sh600053","stockUpPrice":"0.000","stockDownPrice":"0.000","stockBuyPrice":"24.191","stockBuyNum":"300","stockFlag":0},
				if(huoban.filtered > 0){
					 for(var i in huoban.items){
					 	
					 	//console.log(huoban.items[i]);
					 	var name = undefined;
					 	var code = undefined;
					 	var num = undefined;
					 	for(var j in huoban.items[i].fields){
					 		//console.log(j);
					 		if(huoban.items[i].fields[j].field_id == stockNameFiledId){
					 			//console.log("股票名称："+huoban.items[i].fields[j].values[0].value);
					 			//jsonStr += huoban.items[i].fields[j].values[0].value + '","stockCode":"';
					 			name = huoban.items[i].fields[j].values[0].value;
					 		}
					 		if(huoban.items[i].fields[j].field_id == stockFiledId){
					 			//console.log("股票代码："+huoban.items[i].fields[j].values[0].value);
					 			//jsonStr += huoban.items[i].fields[j].values[0].value + '","stockUpPrice":"0.000","stockDownPrice":"0.000","stockBuyPrice":"0.0","stockBuyNum":"';
					 			code = huoban.items[i].fields[j].values[0].value;
					 		}
					 		if(huoban.items[i].fields[j].field_id == stockBuyNumFiledId){
					 			//console.log("持仓数量："+huoban.items[i].fields[j].values[0].value);
					 			//jsonStr += huoban.items[i].fields[j].values[0].value + '","stockFlag":0}';
					 			num = huoban.items[i].fields[j].values[0].value;
					 		}
					 	}
					 	
					 	if(code == undefined || num == '0' || num == undefined){
					 		console.log('error');
					 		jsonStr += "";
					 	}else{
					 		if(i == 0){
						 		jsonStr += '"'+i+'":{"stockName":"';
					 		}else{
						 		jsonStr += ',"'+i+'":{"stockName":"';
						 	}
					 		if(name == undefined){
						 		jsonStr += '","stockCode":"';
					 		}else{
						 		jsonStr += name + '","stockCode":"';
						 	}
						 	jsonStr += code + '","stockUpPrice":"0.000","stockDownPrice":"0.000","stockBuyPrice":"0.0","stockBuyNum":"';
						 	if(num == undefined){
						 		jsonStr += '0","stockFlag":0}';
						 	}else{
						 		jsonStr += num + '","stockFlag":0}';
						 	}

					 	}


					 }
				}

				jsonStr += "}";
				
			}
			
			$("#txtBackup").val(jsonStr);
			delete xhr;
			//自动提交保存
			importStock();
		}
		xhr.send();
	} catch(e) { console.error(e); }
};