function insertChart(api,div,option){
	var data = [];
	for (var i = 0; i <= api.data.length - 1; i++) {
		data[data.length] = api.data[i];
	}
	$.getJSON( "https://api2.netpie.io/feed/"+api.name+"?apikey="+api.key+"&granularity="+api.granularity+"&timezone=7&data="+data+"&aggregate="+api.aggregate+"&since="+api.since, function(datajson) { 
		updateChart(div,datajson,option);
	});
}

function updateChart(chartDIV,datajson,option) {

	// var barWidth = {
	// 	minutes : 60,
	// 	hours : 360,
	// 	days : 9000,
	// 	months : 270000,
	// 	years : 3240000
	// }
	var defaultGraph = {lines:{show:true,steps:false},points:{show:true,radius:2}};
	var optionGraph = {};
	var heightGraph = 95;
	var yaxes = []
	var max = 0;
	var min ;
	var color = ['#d40000','#1569ea','#ffcc00']
	if ($("#"+chartDIV).find("#"+chartDIV+"_graph").length > 0){ 
		$("#"+chartDIV).empty();
	}
	if(option === undefined) {
	 	optionGraph = defaultGraph;
	 	heightGraph = heightGraph+5;
	}else{
		if(option.name !== undefined){
			heightGraph = heightGraph - 10;
			$('<div id="'+chartDIV+'_header"><p>'+option.name+'</p></div>').css({
				display : 'inline-block',
				"vertical-align": 'middle',
				width : "100%",
				height:"10%",
				textAlign : "center",
				font: '18px/1.5em "proxima-nova", Helvetica, Arial, sans-serif'
			}).appendTo("#"+chartDIV);
		}
		if(option.xaxis === undefined){
			heightGraph = heightGraph + 5;
		}
		if(option.type !== undefined){
			if(option.type=="bar"){
				delete datajson[datajson.data[0].values[0]];
				optionGraph['bars'] = {
					show: true,
					barWidth: (datajson.data[0].values[1][0]-datajson.data[0].values[0][0])/2,
					align: "center"
				};
			}
			else if(option.type=="step"){
				optionGraph['lines'] = {
					show: true,
					steps : true
				};
			}
			else{
				optionGraph['lines'] = {
					show: true,
					steps : false
				};
			}
		}
		else{
			optionGraph['lines'] = {
				show: true,
				steps : false
			};
		}
		if(option.pointer !== undefined){
			if(option.pointer){
				optionGraph['points'] = {
					show: true,
					radius : 2
				};
			}
			else{
				optionGraph['points'] = {
					show: false,
					radius : 2
				};
			}
		}
		if(option.color !== undefined){
			color = option.color;
		}
	}
	$("#"+chartDIV).css({
		'background-color' : "#E5E4E2",
		height:"100%",
		position:"relative"
	});
	$('<div id="'+chartDIV+'_graph" ></div>').css({
		width: "95%",
		height:heightGraph+"%",
		margin: "auto",
		'background-color' : "",
	}).appendTo("#"+chartDIV);
	// $('<div id="'+chartDIV+'_legend"></div>').css({
	// 	padding: "",
	// 	top : 0,
	// 	height:"5%",
	// 	textAlign : "center",
	// 	position : "relative",
	// }).appendTo("#"+chartDIV);
	var chartdata = [];
	if (datajson) {
		for (var i=0; i<datajson.data.length; i++) {
			// max = 0;
			var s = {data: [], label: datajson.data[i].attr, points:{symbol:"circle"}}
			if (i>0)
				s.yaxis = i+1;
			else 
				s.yaxis = 1;
			var arr = datajson.data[i].values;
			for (var j=0; j<arr.length; j++) {
				s.data.push([ arr[j][0], arr[j][1] ]);
				if(arr[j][1]>max){
					max = arr[j][1];
				}
				if(min === undefined){
					min = arr[j][1];
				}
				if(arr[j][1]<min){
					min = arr[j][1];
				}
			}
			chartdata.push(s);
			if(i>=color.length){
				color[color.length] = "black";
		   	}
		}
	}
	if(option !== undefined){
		if(option.max === undefined){
			max = max+5;
		}
		if(option.min === undefined){
			min = min-5;
		}
	}
	for (var i=0; i<color.length; i++) {
		if(option !== undefined && option.hookyaxis !== undefined && option.hookyaxis==true){
		   	if(i+1 == color.length){
		   		yaxes[yaxes.length] = {	font : {size : 11,style : "",weight : "bold",family : "sans-serif",variant : "small-caps",color : "black"},max:max,min:min};
		   	}
		   	else{
		   		yaxes[yaxes.length] = {show:false,max:max,min:min};
		   	}
		}
		else{
			yaxes[yaxes.length] = {font : {size:11,style:"",weight:"bold",family:"sans-serif",variant:"small-caps",color : color[i]}};
		}
		if(option !== undefined && option.max !== undefined){
			if($.isNumeric(option.max)){
				yaxes[yaxes.length-1].max = option.max;
			}
			if(option.min === undefined){
				yaxes[yaxes.length-1].min = min;
			}
		}
		if( option !== undefined && option.min !== undefined){
			if($.isNumeric(option.min)){
				yaxes[yaxes.length-1].min = option.min;
			}
			if(option.max === undefined){
				yaxes[yaxes.length-1].max = max;
			}
		}
	}
	var plot = $.plot("#"+chartDIV+"_graph", chartdata, {
		legend: {
			show: true,
			noColumns: 5,
			// container: '#'+chartDIV+'_legend',
			labelFormatter : function(label, series) {
			    return '&nbsp;'+label+'&nbsp;&nbsp;';
			}
		},
		series: optionGraph,
		grid : {
			hoverable: true,
			clickable: true
		},
		yaxes: yaxes,
		color : color,
		xaxis : {
			mode : "time",
			timezone : "browser",
			font : {
		      	size : 11,
		      	style : "",
		      	weight : "bold",
		      	family : "sans-serif",
		      	variant : "small-caps",
		      	color : "black"
		   }
		}
	});
	$("<div id='tooltip'></div>").css({
		position: "absolute",
		display: "none",
		border: "1px solid #fdd",
		padding: "2px",
		"background-color": "#fee",
		opacity: 0.80,
		fontFamily:"sans-serif",
		fontSize:11,
		fontWeight:"bold"
	}).appendTo("body");
	$('#'+chartDIV+'_graph').bind("plothover", function (event, pos, item) {
		if ($("#enablePosition:checked").length > 0) {
			var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
			$("#hoverdata").text(str);
		}
		if (true) {
			if (item) {
				var x = item.datapoint[0].toFixed(2),
					y = item.datapoint[1].toFixed(2);
				var newDate = new Date();
				newDate.setTime(x);
				dateString = newDate.toUTCString();
				var tooltiptext = dateString+"<br>"+item.series.label+" = "+y;
				$("#tooltip").html(tooltiptext)
					.css({top: item.pageY+5, left: item.pageX+5})
					.fadeIn(200);
			} else {
				$("#tooltip").hide();
			}
		}
	});
	$('#'+chartDIV+'_graph').bind("plotclick", function (event, pos, item) {
		if (item) {
			$("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
			plot.highlight(item.series, item.datapoint);
		}
	});
	if(option !== undefined) {
		if(option.xaxis !== undefined){
			$('<div id="'+chartDIV+'_x">'+option.xaxis+'</div>').css({
				top : 0,
				width : "100%",
				textAlign : "center",
				height:"5%",
				font: '1em "proxima-nova", Helvetica, Arial, sans-serif'
			}).insertAfter("#"+chartDIV+"_graph");
		}
		if(option.yaxis !== undefined){
			$('<div id="'+chartDIV+'_y">'+option.yaxis+'</div>').css({
				textAlign : "center",
				'-webkit-transform' : 'rotate(270deg)',
             	'-moz-transform' : 'rotate(270deg)',
             	'-ms-transform' : 'rotate(270deg)',
             	'transform' : 'rotate(270deg)',
             	position : "absolute",
             	font: '1em "proxima-nova", Helvetica, Arial, sans-serif'
			}).insertBefore("#"+chartDIV+"_graph");
			var ydivheight = ($("#"+chartDIV).height()/2-$('#'+chartDIV+'_y').height()/2);
			if($("#"+chartDIV).width()<=665){
				$('#'+chartDIV+'_y').css({
					top : ydivheight+"px",
					left : '-10px'
				})
			}
			else if($("#"+chartDIV).width()<=700){
				$('#'+chartDIV+'_y').css({
					top : ydivheight+"px",
					left : '-5px'
				})
			}
			else{
				$('#'+chartDIV+'_y').css({
					top : ydivheight+"px",
				})
			}
		}
	}
	$(window).resize(function(){
		updateChart(chartDIV,datajson,option);
	});
}



