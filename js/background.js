//////////////////////////// 动态图标部分 ////////////////////////////////////////////////
var canvas;
var canvasContext;
var gfx;
var animTimer;
var loopTimer;
var iconSrc = "";
var factor = true;
var firstAnimate = true;
var badgeLength = 4;

// 初始化动画
function initAnimate()
{
	iconSrc = "images/icon_19.png";
	
	canvas = document.getElementById("canvas");
	canvasContext = canvas.getContext("2d");
	gfx = document.getElementById("gfx");
	
	gfx.src = iconSrc;

	stopAnimateLoop();
}

// 开始动态图标动作
function startAnimate() {
	return;
	if(Settings.getValue("animateAlert", false)) {
		
		stopAnimateLoop();
		
		if ( isOperation() || firstAnimate ) {
			animTimer = setInterval("doAnimate()", 200);
			setTimeout("stopAnimate()", 2000);
			loopTimer = setTimeout("startAnimate()", 8000);
			
			firstAnimate = false;
		}
		else {
			loopTimer = setTimeout("startAnimate()", 60000);
		}
	}
}

// 停止图标动作
function stopAnimate() {
	if(animTimer != null)
		clearTimeout(animTimer);       
	
	chrome.browserAction.setIcon({path:iconSrc});
	
	factor = true;
}

// 停止动态图标动作
function stopAnimateLoop() {
	if(loopTimer != null)
		clearTimeout(loopTimer);
	stopAnimate();
}

// 开始图标动作
function doAnimate() {

	canvasContext.save();
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	canvasContext.translate(0, 0);

	if (factor)
		canvasContext.drawImage(gfx, 0, 0);
	else
		canvasContext.drawImage(gfx, 19, 19);
	
	factor = !factor;
	
	canvasContext.restore();
	
	chrome.browserAction.setIcon({imageData:canvasContext.getImageData(0, 0, canvas.width, canvas.height)});
}

////////////////////////////////////////////////////////////////////////////////////////

var sockUp = 0;
var sockDown = 0;
var refreshTimer;
var currentStockTitle = "";
var reloadSock = true;
var isWebkitNotify = false;

/* 初始化 */
function init() {
	var uagent = navigator.userAgent.toLowerCase();

	if ( uagent.indexOf("vivaldi") > 0 ) {
		badgeLength = 5;
	}
	
	/* 初始化标题 */
	chrome.browserAction.setTitle({title: "股票提醒助手 3.9.9"});
	
	isWebkitNotify = isWebkitHTMLNotificationsEnabled();
	
	Settings.configCache = {};
		
	loadStocks();
		
	initAnimate();
	
	refreshTimer = window.setTimeout(process, 100);
}

/* 播放提示音 */
function playSound() {
	if(Settings.getValue("soundAlert", true))
	{
		try {
			document.getElementById("notify_sound").currentTime = 0;
			document.getElementById("notify_sound").play();
		}
		catch(e) { console.error(e); }
	}
}

function clearRichNotification(notificationId, callback) {
	if (notificationId) {
		if (!callback) {
			callback = function() {};
		}
		chrome.notifications.clear(notificationId, callback);
	}
}

/* 显示提示窗口 */
function notify(stockInfo) {
	if ( Settings.getValue("displayAlert", true) ) {
		var notificationCloseTimeout = 10000;
		try {
			if ( isWebkitNotify ) {
				var url = chrome.extension.getURL("notify.html");
				url += "?" + stockInfo.stockName + "|" + stockInfo.stockCurrPrice + "|" + stockInfo.stockCurrAlertState;
				
				var notification = webkitNotifications.createHTMLNotification(url);

				notification.show();
				setTimeout(function(){
					notification.cancel();
				}, notificationCloseTimeout);
			}
			else {
				var items = [];
				var iconUrl = (stockInfo.stockCurrAlertState == 2) ? "images/stock_down.png" : "images/stock_up.png";
				var title = stockInfo.stockName;
				var message = "当前价格：" + stockInfo.stockCurrPrice;
				
				message +=(stockInfo.stockCurrAlertState == 2)  ? "\r\n股票下破预警价格" : "\r\n股票上穿预警价格";
				
				items.push( {title: "当前价格 " + stockInfo.stockCurrPrice, message: "" });
				items.push( {title: "", message: "预警价格 " + ((stockInfo.stockCurrAlertState == 2) ? stockInfo.stockDownPrice : stockInfo.stockUpPrice) });
				
				var options = {
						type: "list",
						title: title,
						message: message,
						iconUrl: iconUrl,
						items: items
				}
				
				//console.log(options);
				
				chrome.notifications.create("", options, function(notificationId) {
					//if (chrome.extension.lastError) {
					//	console.log(chrome.extension.lastError);
			//}
					if (notificationCloseTimeout != 0) {
						setTimeout(function () {
							if ( arguments.length > 0 ) {
								clearRichNotification(arguments[0]);
								console.log(" timeout = " + arguments[0])
							}
						}, notificationCloseTimeout, notificationId);
					}
				});
			}
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}

/* 刷新股票数据 */
function refreshStocks() {
	if (reloadSock) {
		Settings.configCache = {};
		
		loadStocks();
		
		reloadSock = false;

		/*
		var DOMWindowArray = chrome.extension.getViews();
		for(var i = 0; i < DOMWindowArray.length; i++) {
			if(typeof(DOMWindowArray[i].stockNotifyPopup) !== "undefined") {
				DOMWindowArray[i].createStockDisplayDOM();
				break;
			}
		}
		*/
		
		updateStocks();
		displayStocks();
	}
	else {
		if( isOperation() ){
			updateStocks();
			displayStocks();
		}
	}
}

/* 刷新界面 */
function displayStocks() {
	var n = 0;
	var sTitle = "";
	
	for (var i in stockGetInfos) {
		var stockInfo = stockGetInfos[i];
		displayStock(stockInfo);
	}
	
	for (var i in stockGetInfos) {
		var stockInfo = stockGetInfos[i];
		
		if (n < 5 && stockInfo.stockIndex != Settings.getValue("popupStockPosition", 0)) {
			if ( stockInfo.stockCurrAlertState == 1 ) {
				sTitle += stockInfo.stockName + "▲" + stockInfo.stockCurrPrice + "(" + stockInfo.stockChangeRate +"%) ("+stockInfo.stockProfit+")\r\n";
			}
			else if ( stockInfo.stockCurrAlertState == 2 ) {
				sTitle += stockInfo.stockName + "▼" + stockInfo.stockCurrPrice + "(" + stockInfo.stockChangeRate +"%) ("+stockInfo.stockProfit+")\r\n";
			}
			else {
				sTitle += stockInfo.stockName + " " + stockInfo.stockCurrPrice + "(" + stockInfo.stockChangeRate +"%) ("+stockInfo.stockProfit+")\r\n";
			}
			n++;
		}
	}
	
	chrome.browserAction.setTitle({title: currentStockTitle + "\r\n" + sTitle});
}

/* 显示股票信息 */
function displayStock(stockInfo) {
	// 判断是否要进行报警提示
	if (stockInfo.stockCurrPrice != 0)
	{
		if (parseFloat(stockInfo.stockCurrPrice) > parseFloat(stockInfo.stockUpPrice) && stockInfo.stockUpPrice != 0)
			stockInfo.stockCurrAlertState = 1;
		else if (parseFloat(stockInfo.stockCurrPrice) < parseFloat(stockInfo.stockDownPrice) && stockInfo.stockDownPrice != 0)
			stockInfo.stockCurrAlertState = 2;
		else
			stockInfo.stockCurrAlertState = 0;

		if (stockInfo.stockCurrAlertState != 0 && stockInfo.stockCurrAlertState != stockInfo.stockLastAlertState)
		{
			playSound();
			startAnimate();
			notify(stockInfo);
		}
		stockInfo.stockLastAlertState = stockInfo.stockCurrAlertState;
	}
	if (stockInfo.stockIndex == Settings.getValue("popupStockPosition", 0))
	{
		// 是否显示当前价格
		if (Settings.getValue("showPrice", true) || Settings.getValue("showRange", false)) {
			if (stockInfo.stockOpenPrice != 0) {
				if (parseFloat(stockInfo.stockCurrPrice) >= parseFloat(stockInfo.stockClosePrice))
					chrome.browserAction.setBadgeBackgroundColor({color: [255, 102, 102, 255]});
				else
					chrome.browserAction.setBadgeBackgroundColor({color: [ 51, 204,   0, 255]});
			}
			else{
				chrome.browserAction.setBadgeBackgroundColor({color: [ 51, 51, 51, 255]});
			}

			if ( Settings.getValue("showRange", false) )
			{
				textPrice = stockInfo.stockChangeRate;
			}
			else
			{
				textPrice = stockInfo.stockCurrPrice;
			}

			if ( Settings.getValue("showRight", true) ) 
			{
				if ( textPrice.length > badgeLength )
				{
					textPrice = textPrice.substr(textPrice.length-badgeLength);
				}	
			}
			chrome.browserAction.setBadgeText({text: textPrice});
		}
		else {
			chrome.browserAction.setBadgeText({text: ""});
		}
		
		
		if ( stockInfo.stockCurrAlertState == 1 ) 
			currentStockTitle = stockInfo.stockName + "▲" + stockInfo.stockCurrPrice + "(" + stockInfo.stockChangeRate +"%) ("+stockInfo.stockProfit+") ★";
		else if ( stockInfo.stockCurrAlertState == 2 )  
			currentStockTitle = stockInfo.stockName + "▼" + stockInfo.stockCurrPrice + "(" + stockInfo.stockChangeRate +"%) ("+stockInfo.stockProfit+") ★";
		else
			currentStockTitle = stockInfo.stockName + " " + stockInfo.stockCurrPrice + "(" + stockInfo.stockChangeRate +"%) ("+stockInfo.stockProfit+") ★";
	}
	
	// 刷新界面
	// 2018-12-4 改为由弹窗页面刷新
	/*
	try{
		var DOMWindowArray = chrome.extension.getViews();
		console.log(DOMWindowArray);
		
		for(var i = 0; i < DOMWindowArray.length; i++) {

			console.log("===" + i + "=======");
			console.log(DOMWindowArray[i].displayPopupStock);
			
			if(typeof(DOMWindowArray[i].stockNotifyPopup) !== "undefined") {
				DOMWindowArray[i].displayPopupStock(stockInfo);
				break;
			}
		}
	}
	catch(e) { console.error(e); }
	*/

	
	delete i;
	delete DOMWindowArray;
}

/* 处理进程 */
function process() {

	refreshStocks();
	refreshTimer = window.setTimeout(process, 5000);
}

$(document).ready(function() {
	init();
});
