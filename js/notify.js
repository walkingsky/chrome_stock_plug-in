var stockInfo = undefined;
var option_url = "options.html";

$(function(){
	var stockInfo = decodeURI(location.search.slice(1));
	$('#message').text(stockInfo);
	var elements = stockInfo.split("|");
	   
	if (elements.length >= 3)
	{
		if (parseInt(elements[2]) == 2)
		{
			$('#message').removeClass('stockup').addClass('stockdown').html("<b>" + elements[0] + "</b> 下破预警价格。");
		}
		else
		{
			$('#message').removeClass('stockdown').addClass('stockup').html("<b>" + elements[0] + "</b> 上穿预警价格。");
		}
	};
	
	$('#btnSettings').click(function() {
		chrome.tabs.create({url: option_url});
	});
	
	$('#btnClose').click(function() {
		window.close();
	});
});
