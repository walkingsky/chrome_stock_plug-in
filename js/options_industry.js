$(document).ready(function () {
   mainContainer1 = document.getElementById('in_main');
   mainContainer2 = document.getElementById('in_main1');

   var resizeMainContainer = function () {
      mainContainer1.style.width = window.innerWidth + 'px';
      mainContainer1.style.height = window.innerHeight * 1.2 + 'px';
      mainContainer2.style.width = window.innerWidth + 'px';
      mainContainer2.style.height = window.innerHeight * 1.2 + 'px';
   };
   //设置div容器高宽
   resizeMainContainer();
   // 初始化图表
   //var myChart = echarts.init(dom);
   var industryChart1 = echarts.init(mainContainer1);
   var industryChart2 = echarts.init(mainContainer2);

   $(window).on('resize', function () {
      resizeMainContainer();
      industryChart1.resize();
      industryChart2.resize();
   });

	//myChart.setOption(option);
   getIndustry(industryChart1);
   getIndustry(industryChart2,'in');
   var sort = 1 ;
   $("#sort").click(function() { 
      if ($("#sort").html() == '正序'){
         $("#sort").html('倒序');
         sort = 1;
         getIndustry(industryChart1,'increase','desc');
         getIndustry(industryChart2,'in','desc');
      }else{
         $("#sort").html('正序');
         sort = 0;
         getIndustry(industryChart1,'increase');
         getIndustry(industryChart2,'in');
      }
       
   });
});



function getInfo(info, index, kind, sort) {
   return new Promise((resolve, reject) => {
      
      var industryCode = info.f12;
      var industryName = info.f14;
      var industryValue = 0;
      
      //getStocksInfo(industryCode,kind,sort);

      var fid = 'f3'; //默认按涨幅排序
      if (kind != 'increase') {
         fid = 'f62'; //按主力流入净值排序
         industryValue =info.f62;
      }else{
         industryValue = info.f3;
      }
      var po = '1';
      if (sort == 'asc') {
         po = '1';
      } else {
         po = '0';
      }
      try {
         var xhr = new window.XMLHttpRequest();
         //pz=10 可调返回数据量
         xhr.open("GET", "https://push2.eastmoney.com/api/qt/clist/get?fid=" + fid + "&po=" + po + "&pz=10&pn=1&np=1&fltt=2&invt=2&fs=b:" + industryCode + "&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124,f1,f13", true);
         xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
               var json = JSON.parse(xhr.responseText);
               //var json = JSON.parse('{"index":'+index+',"industryCode":'+industryCode+'"stocks":'+xhr.responseText+'}');
               //console.log('{"index":'+index+',"industryCode"::'+industryCode+'","stocks":'+JSON.stringify(json.data.diff)+'}');
               for(var item in json.data.diff){
                  json.data.diff[item].name = json.data.diff[item].f14;
                  if (kind != 'increase') {
                     //fid = 'f62'; //按主力流入净值排序
                     //json.data.diff[item].value = json.data.diff[item].f62;
                     //json.data.diff[item].value_show = json.data.diff[item].f62;
                     json.data.diff[item].value = [json.data.diff[item].f62,json.data.diff[item].f62];
                  }else{
                     //json.data.diff[item].value = json.data.diff[item].f3;
                     //json.data.diff[item].value_show = json.data.diff[item].f3;
                     json.data.diff[item].value = [json.data.diff[item].f3,json.data.diff[item].f3];
                  }
               }  
               //value_show  显示用的真实值   
               //value 图表用的数据，后期会被修改成全部正值          
               json = JSON.parse('{"index":'+index+',"name":"'+industryName+'","value":['+industryValue+','+industryValue+'],"industryCode":"'+industryCode+'","children":'+JSON.stringify(json.data.diff)+'}');
               resolve(json);
            }
            delete xhr;
           
         }
         xhr.send();
      } catch (e) { console.error(e); }

   });
}

function sortData(data,sort){
   if(sort == 'asc'){
      //pz=20 可调返回数据量
      //console.log(data[19].value);
      for(var i in data){
         data[i].value[0] = data[i].value[0] - data[data.length - 1].value[0]  ;
         //data[i].max = Math.abs(data[i].value[0])>Math.abs( data[data.length - 1].value[0])?Math.abs(data[i].value[0]):Math.abs( data[data.length - 1].value[0]);
         if (data[i].value[1] >0){
            data[i].value[2] = 1; 
            //data[i].color = ['#942e38'];
            data[i].itemStyle = {"borderColor": '#CC3333'};
         }else if(data[i].value[1] <0){
            data[i].value[2] = -1;
            //data[i].color = ['#269f3c'];
            data[i].itemStyle = {"borderColor":  '#339933'};
         }else{
            data[i].value[2] = 0;
            //data[i].color = ['#aaa'];
            data[i].itemStyle = {"borderColor": '#bbb'};
         }
         for (var j in data[i].children) {         
            //pz=10 可调返回数据量
            data[i].children[j].value[0] =  data[i].children[j].value[0] - data[i].children[data[i].children.length - 1].value[0]  ; 
            if (data[i].children[j].value[1] >0){
               data[i].children[j].value[2] = 1; 
            }else if(data[i].children[j].value[1] <0){
               data[i].children[j].value[2] = -1;
            }else{
               data[i].children[j].value[2] = 0;
            }                  
         }
      }
   }else{
      //pz=20 可调返回数据量
      //console.log(data[19].value);
      for(var i in data){
         data[i].value[0] = data[data.length - 1].value[0] - data[i].value[0];
         if (data[i].value[1] >0){
            data[i].value[2] = 1; 
            //data[i].color = ['#942e38'];
            data[i].itemStyle = {"borderColor": '#CC3333'};
         }else if(data[i].value[1] <0){
            data[i].value[2] = -1;
            //data[i].color = ['#269f3c'];
            data[i].itemStyle = {"borderColor":  '#339933'};
         }else{
            data[i].value[2] = 0;
            //data[i].color = ['#aaa'];
            data[i].itemStyle = {"borderColor": '#bbb'};
         }
         for (var j in data[i].children) {         
            //pz=10 可调返回数据量
            data[i].children[j].value[0] = data[i].children[data[i].children.length-1].value[0] - data[i].children[j].value[0];
            if (data[i].children[j].value[1] >0){
               data[i].children[j].value[2] = 1; 
            }else if(data[i].children[j].value[1] <0){
               data[i].children[j].value[2] = -1;
            }else{
               data[i].children[j].value[2] = 0;
            }
         }
      }
   }
   return data;
   //return  JSON.parse('[{"name":"test","value":1,"children":'+JSON.stringify( data)+'}]');
}

function getIndustry(charts,kind = 'increase', sort = 'asc') {
   var fid = 'f3'; //默认按涨幅排序
   if (kind != 'increase') {
      fid = 'f62'; //按主力流入净值排序
   }
   var po = '1';
   if (sort == 'asc') {
      po = '1';
   } else {
      po = '0';
   }
   $.ajax({
      //pz=20 可调返回数据量
      url: 'http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&po=' + po + '&np=1&fltt=2&invt=2&fid=' + fid + '&fs=m:90+t:2+f:!50&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f124,f107,f104,f105,f140,f141,f207,f208,f209,f222',
      dataType: 'json',
      type: 'get',
      success: function (response) {
         //console.log(response.data.diff);
         let promises = response.data.diff.map((item, index) => {
            //console.log(item.f12);
            //let info = {};
            return getInfo(item, index, kind, sort);
         });

         Promise.all(promises).then((allData) => {
            
            //正序的时候也有负值
            //if(sort != 'asc') allData = sortData(allData);
            //console.log(allData);
            allData = sortData(allData,sort);
            //console.log(allData);
            function getLevelOption() {
               return [
                 {
                  
                  itemStyle: {
                     borderColor: '#777',
                     borderWidth: 0,
                     gapWidth: 0
                   },
                   upperLabel: {
                     show: false
                   }
                 },
                 {
                  color: ['#269f3c','#aaa','#942e38' ],
                  colorMappingBy: 'value',
                  itemStyle: {
                     borderColor: '#999',
                     borderWidth: 5,
                     gapWidth: 1
                   },
                   emphasis: {
                     itemStyle: {
                       borderColor: '#ddd'
                     }
                   }
                 },
                 {
                  
                  itemStyle: {
                     borderColor: '#999',
                     borderWidth: 1,
                     gapWidth: 1
                   },
                   emphasis: {
                     itemStyle: {
                       borderColor: '#ddd'
                     }
                   }
                 }

               ];
             }
            charts.setOption(
               (option = {
                 title: {
                   text: kind == 'increase'?'行业分析(涨跌幅)':'行业分析(主力流入净额)',
                   left: 'center'
                 },
                 tooltip: {
                   formatter: function (info) {
                     var value = info.data.value[1];
                     var treePathInfo = info.treePathInfo;
                     var treePath = [];
                     for (var i = 1; i < treePathInfo.length; i++) {
                       treePath.push(treePathInfo[i].name);
                     }
                     return [
                       '<div class="tooltip-title">' +
                         echarts.format.encodeHTML(treePath.join('/')) +
                         '</div>',
                         kind == 'increase'?'涨跌幅:' + echarts.format.addCommas(value) + '%':'流入净额:' + echarts.format.addCommas(value) + '￥'
                     ].join('');
                   }
                 },
                 series: [
                   {
                     name: kind == 'increase'?'行业分析(涨跌幅)':'行业分析(主力流入净额)',
                     type: 'treemap',
                     //visibleMin: 300,
                     visualMin: -1,
                     visualMax: 1,
                     visualDimension: 2,
                     label: {
                       show: true,
                       formatter: '{b}'
                     },
                     upperLabel: {
                       show: true,
                       height: 30
                     },
                     itemStyle: {
                       borderColor: '#fff'
                     },
                     levels: getLevelOption(),
                     data: allData
                   }
                 ]
               })
             );
            // [0, 1, 2]
         }).catch((err) => {
            console.log(err);
         })
      }
   })


}

