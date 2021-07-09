

var DB = openDatabase('stockdb','1.0','stock',2*1024*1024);

var SettingsDB = {};
SettingsDB.init = function init(){
	DB.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS jiaoyi (id unique, code, time, value, price)');
	});
};

SettingsDB.clean = function clean(){
	DB.transaction(function(tx){
		tx.executeSql('delete from jiaoyi');
	});
};
SettingsDB.buy = function buy(stock_code,price,value){
	var mDate = new Date();
	var time = (mDate.getHours().toString().length == 1 ? '0'+mDate.getHours() : mDate.getHours());
	time = time + ':'+ (mDate.getMinutes().toString().length == 1 ? '0'+mDate.getMinutes() : mDate.getMinutes());
	DB.transaction(function(tx){
		tx.executeSql('INSERT INTO jiaoyi (code,time,value,price) VALUES( ? ,?,?,? )',[stock_code,time,value*1,price*1]);
	});
};

SettingsDB.sell = function sell(stock_code,price,value){
	var mDate = new Date();
	var time = (mDate.getHours().toString().length == 1 ? '0'+mDate.getHours():mDate.getHours())+':'+mDate.getMinutes();
	DB.transaction(function(tx){
		tx.executeSql('INSERT INTO jiaoyi (code,time,value,price) VALUES( ? ,?,?,? )',[stock_code,time,-(value*1),price*1]);
	});
};

SettingsDB.getStock =  function getStock(stock_code,callBack){
	var result = [];
	DB.transaction( function(tx){
		 tx.executeSql('select * from jiaoyi where code = ?',[stock_code],function(tx,data){
			for(var i=0; i< data.rows.length; i++){
				var row = data.rows.item(i);
				/*
				result[i] = {
					code:row['code'],
					time:row['time'],
					value:row['value'],
					price:row['price']
				}
				*/
				result.push({
					code:row['code'],
					time:row['time'],
					value:row['value'],
					price:row['price']
				});
			}
			callBack(result);
		});
	});
	//return result;
};

SettingsDB.init();