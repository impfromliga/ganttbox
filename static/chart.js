"use strict";
//Date.getFullYear() //yyyy
function Chart(div){
	var zoomX = 30;
	const zoomY = 30;
	const weekdays = 'Пн0Вт0Ср0Чт0Пт0Сб0Вс'.split(0);
	const monthname = 'январь0февраль0март0апрель0май0июнь0июль0август0сентябрь0октябрь0ноябрь0декабрь'.split(0);
	const T_DAY = 864e5, T_WEEK = 7*T_DAY, T_MONTH = 30.5*T_DAY, T_YEAR = 365*T_DAY;
	
	if(typeof div == 'string')	div = document.querySelector(div);
	var dteFrom = div.querySelector('[class^="GanttBoxMnu__dte_from"], [class*=" GanttBoxMnu__dte_from"]');
	var dteTo = div.querySelector('[class^="GanttBoxMnu__dte_to"], [class*=" GanttBoxMnu__dte_to"]');
	var txtSize = div.querySelector('[class^="GanttBoxMnu__txt_size"], [class*=" GanttBoxMnu__txt_size"]');
	var lstRoot = div.querySelector('.GanttBoxMnu__lst_root');
	var lstRootSysLen = lstRoot.querySelector('option[value="-"]').index+1;
	var txtSizeMin = txtSize.getAttribute('data-min') || 7;
	var txtSizeMax = txtSize.getAttribute('data-max') || 365;
	
	var pop = Pop({
		div:'.GanttBoxPop',
		lblTitle:'.GanttBoxPop__lbl_title',
		lblCaption:'.GanttBoxPop__lbl_caption',
		propFrom:'.GanttBoxPop__prop_from',
		propTo:'.GanttBoxPop__prop_to',
		propCaption:'.GanttBoxPop__prop_caption',
		lblDescription:'.GanttBoxPop__lbl_description',
		propDescription:'.GanttBoxPop__prop_description',
		btnOk:'[class^="GanttBoxPop__btn_ok"],[class*=" GanttBoxPop__btn_ok"]',
		btnDel:'[class^="GanttBoxPop__btn_del"],[class*=" GanttBoxPop__btn_del"]',
		btnCancel:'[class^="GanttBoxPop__btn_cancel"],[class*=" GanttBoxPop__btn_cancel"]'
	});

	var chart = this==window?{}:this;
	var ctx = UCx.call(chart.canvas = div.querySelector('[class^="GanttBoxChart__canvas"],[class*=" GanttBoxChart__canvas"]') );
	var hlpArea = div.querySelector('[class^="GanttBoxChart__hlp_area"],[class*=" GanttBoxChart__hlp_area"]');
	
	var _root, _roots = [];
	var _from = new Date();
	var _to = new Date(+_from +T_DAY*30);
	var _size = txtSize.value = txtSize.value|0||30;
	Object.defineProperties(chart,{
		'from':{get:function(){return _from.toISOString().slice(0,10)},
				set:function(x){
					var from = new Date(x);
					//console.log(x);
					if(isNaN(from))return; else _from = from;
					chart.to = chart.to;
				}},
		'to' : {get:function(){return _to.toISOString().slice(0,10)},
				set:function(x){
					var to = new Date(x);
					if(isNaN(to))return;
					console.log(x);
					var fromMin = new Date(+_from + T_DAY*txtSizeMin -T_DAY);
					var toMax = new Date(+_from + T_DAY*txtSizeMax -T_DAY);
					dteTo.setAttribute('min', fromMin.toISOString().slice(0,10));
					dteTo.setAttribute('max', toMax.toISOString().slice(0,10));
					dteTo.value = (_to = new Date( Math.min(Math.max(+to,+fromMin),+toMax) )).toISOString().slice(0,10);
					txtSize.value = _size = (_to - _from)/T_DAY+1.5|0;
				}},
	})
	//ctx.canvas.offsetWidth / txtSize.value
	
	chart.moveBy = function(dX,dY){
		var period = dX/zoomX|0;
		dteFrom.value = (_from = new Date(_from -period*T_DAY)).toISOString().slice(0,10);
		dteTo.value = (_to = new Date(_to -period*T_DAY)).toISOString().slice(0,10);
		chart.draw();
		ctx.canvas.style.left = 0;
		//ctx.canvas.style.top = 0;
	}
	chart.draw = function(){
		//TODO: ruler with month lines on other layer
		zoomX = ctx.canvas.offsetWidth / txtSize.value;
		ctx.setBgGrid(7, 1, zoomX, zoomY);
		var weekday = (_from.getDay()+6)%7; ctx.canvas.style.backgroundPositionX = -weekday*zoomX + 'px';
		var weekpar = (+_from+T_DAY*3)/T_WEEK%2|0;
		var weekday = (_from.getDay()+6)%7; ctx.canvas.style.backgroundPositionX = (-weekpar*7-weekday)*zoomX + 'px';
		var _month = _from.getMonth();
		var _monthBegin = -zoomX;
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		var miniMarkY = zoomX < .6*zoomY ? zoomX: .5*zoomY;
		var dayParUp = zoomX < .6*zoomY ? .1*zoomY|0 : 0;
		for(var left = zoomX/2, date = +_from; left < ctx.canvas.width; left+=zoomX, date+=T_DAY){
			var weekpar = (date+T_DAY*3)/T_WEEK%2|0;
			//if(weekpar)ctx.fillRect(left-zoomX/2+2,zoomY+zoomY+4,zoomX-4,1); //DBG
			var d = new Date(date);
			weekday = (d.getDay()+6)%7;
			var day = d.getDate();
			var dayPar = (1-day&1)*dayParUp;
			ctx.fillStyle = weekday>4?'#930':'#333';
			ctx.font = 'bold '+.8*miniMarkY+'px sans-serif';
			ctx.fillTextCenter(weekdays[weekday],left, zoomY+miniMarkY+miniMarkY);
			ctx.fillStyle = '#000';
			ctx.fillTextCenter(day, left, zoomY+miniMarkY-dayPar);
			var month = d.getMonth();
			if(_month != month)
				ctx.fillRect(drawMonthNGetEnd(),0,1,ctx.canvas.height);
		}
		month++;
		left+=zoomX;
		drawMonthNGetEnd();
		function drawMonthNGetEnd(){
			ctx.font = 'bold '+.63*zoomY+'px sans-serif';
			var monthEnd = left-zoomX/2|0;
			var monthWidth = monthEnd - _monthBegin;
			ctx.strokeStyle = ctx.fillStyle = '#333';
			ctx.strokeRect(_monthBegin+2.5,2.5, monthWidth-4, zoomY-4);
			ctx.fillTextCenter(monthname[_month], (_monthBegin+monthEnd)/2, .76*zoomY);
			_month = month;
			return _monthBegin = monthEnd;
		}
		
		_nodes.forEach(function(node){
			node.draw();
		})
	}
	var _nodes = [];
	chart.Node = function(x, y, w){
		var node = {
			from:-Infinity,
			to:Infinity,
			row:4,
			constructor: chart.Node,
			style:{'fillStyle':"#"+(100+Math.random()*900|0), strokeStyle:'#000'},
			set:function(res){
				for(var k in res){
					if(typeof node[k] != 'function'){
						console.log('set', k, '=', res[k]);
						if(k=='propFrom'){ //valiDATE:
							var d = new Date(res.propFrom);
							if(!isNaN(d)){
								node.from = Math.round(+d/T_DAY)*T_DAY;
								node.to = Math.max(+new Date(node.to),Math.round(+d/T_DAY+1)*T_DAY);
								console.log(node.from,node.to);
							}
						}else if(k=='propTo'){
							var d = new Date(res.propTo);
							if(!isNaN(d)){
								node.to = Math.round(+d/T_DAY+1)*T_DAY;
								node.from = Math.min(+new Date(node.from),Math.round(+d/T_DAY)*T_DAY);
								console.log(node.from,node.to);
							}
						}else if(k=='style'){//копируем стили по значению
							node.style = {};
							for(var k in res.style) node.style[k] = res.style[k];
						}else{
							node[k] = res[k];
						}
					}else console.log('set reject', k);
				}
			}
		};
		Object.defineProperties(node,{
			'left':{
				get:function(){return Math.floor((node.from-_from)/T_DAY)*zoomX},
				set:function(x){
					node.from = +_from +Math.floor(x/zoomX)*T_DAY;
					node.to = Math.max(node.from+T_DAY, node.to);
				}
			},//TODO: min(node.to-T_DAY)
			'right':{
				get:function(){return Math.floor((node.to-_from)/T_DAY)*zoomX},
				set:function(x){node.to = Math.max(node.from+T_DAY,+_from +Math.round(x/zoomX)*T_DAY)}
			},
			'y':{
				get:function(){return node.row*zoomY},
				set:function(y){node.row = Math.floor(y/zoomY)}
			}
		})
		if(typeof x == 'object') node.set(x);
		else{node.left = x;node.right = x;node.y = y;}
		console.log('Node(',x,y,w,') from/to/row:',node.from,node.to,node.row);
		
		node.draw = function(){
			console.log(node.from,node.to,node.row);
			var x = Math.floor(Math.round((node.from - _from)/T_DAY)*zoomX);
			var y = Math.floor(node.row * zoomY);
			var w = Math.floor(Math.round((node.to - node.from)/T_DAY)*zoomX);
			console.log('draw('+x+2,y+2,w-4,zoomY-4+')')
			ctx.fillStyle = node.style.fillStyle;
			ctx.fillRect(x+3,y+2,w-4,zoomY-4);
			ctx.strokeStyle = node.style.strokeStyle;
			ctx.strokeRect(x+3.5,y+2.5,w-5,zoomY-4);
			if(node.caption){
				ctx.fillStyle = '#fff';
				var ratio = ctx.measureText(node.caption).width/w;
				if(ratio<2)
					ctx.fillText(node.caption, x+4,.8*zoomY+y-2,w-4);
				else{
					ctx.fillText(node.caption.slice(0,node.caption.length/ratio+1), x+4,.8*zoomY+y-2,w-4);
					ctx.fillTextCenter('…', x+4+w/2,zoomY+y-2,w-4);
				}
			}
			return node;
		}
		node.clear = function(){
			console.log('node.clear');
			var x = Math.floor(Math.round((node.from - _from)/T_DAY)*zoomX);
			var y = Math.floor(node.row * zoomY);
			var w = Math.floor(Math.round((node.to - node.from)/T_DAY)*zoomX);
			console.log('clear save:', node, 'from,to',node.from,node.to,'_from,_to',+_from,+_to, 'x,y,w:',x,y,w);
			ctx.globalCompositeOperation='destination-out';
			ctx.fillRect(x,y,w,zoomY);
			ctx.globalCompositeOperation='source-over';
		}
		node.getReq = function(req,res){
			req.state = req.state || 0; req.lblTitle = req.lblTitle || '';
			if(!node.caption){
				req.lblTitle+=' <b>Требуется</b> название.'
				req.state|=Pop.CAP;
			}
			var collise = node.collise('ignoreY');//'1D'
			if(collise.length){
				if(res&&res.opt=='parallel'){
					node.y+=zoomY;
					for(var n = 0;n < collise.ignoreY.length && collise.ignoreY[n].y < node.y;n++);
					for(;n < collise.ignoreY.length && collise.ignoreY[n].y == node.y;){
						node.y+=zoomY;
						for(;n < collise.ignoreY.length && collise.ignoreY[n].y < node.y;n++);
					}
					chart.hlp(node);
				}else{
					req.state|=Pop.OPT;
					req.lblTitle+= ' <b>Требуется</b> устранить коллизию, т.к. задача накладывается во времени на уже имеющиеся.'
				}
			}
			req.from=(new Date(node.from+.5*T_DAY)).toISOString().slice(0,10);
			req.to=(new Date(node.to-.5*T_DAY)).toISOString().slice(0,10);
			req.propCaption=node.caption||_nodes.length+1+'. ';
			req.propDescription=node.description;
			return req;
		}
		node.collise = function(flag){
			_nodes.sort(function(a,b){return a.to-b.to});
			var from = node.from, to = node.to, collise = [], ignoreY = [], self = false;
			for(var n = 0; n < _nodes.length && _nodes[n].to <= from; n++);
			if(flag=='firstOne'){
				for(;n < _nodes.length;n++)
					if(_nodes[n].from < to && _nodes[n].y==node.y) return _nodes[n];
				return null;
			}else
				for(;n < _nodes.length;n++)
					if(_nodes[n].from < to)
						if(_nodes[n]==node) self = true;
						else if(_nodes[n].y==node.y) collise.push(_nodes[n]);
						else ignoreY.push(_nodes[n]);
			//return node;
			if(flag=='ignoreY')
				collise.ignoreY = ignoreY.sort(function(a,b){return a.row-b.row});
			collise.self = self;
			return collise;
		}
		var save = null;
		//TODO: chart.save(node);
		node.save = function(){
			console.log('save');
			save = chart.Node(node);
			console.log(node.left, node.right);
			console.log(save.left, save.right);
			return node;
		}
		node.restore = function(){
			console.log('restore');
			if(save){
				node.set(save)
				save = null;
			}
		};
		node.unsave = function(){
			console.log('unsave');
			if(save){
				save.clear();
				save = null;
			}
		}
		return node;
	}
	//TODO: chart.save(node);
	chart.sel = function(x,y){
		return chart.Node(x,y).collise('firstOne');
	}
	chart.hlp = function(nodeOrX, _y, _r){
		if(typeof nodeOrX != 'number'){
			hlpArea.classList.remove('circ');
			hlpArea.style.left = Math.floor(nodeOrX.left) + 'px';
			hlpArea.style.top = Math.floor(nodeOrX.y) + 'px';
			hlpArea.style.width = Math.floor(nodeOrX.right - nodeOrX.left) + 'px';
			hlpArea.style.height = Math.floor(zoomY) + 'px';
		}else{
			hlpArea.classList.add('circ');
			hlpArea.style.left = nodeOrX - _r + 'px';
			hlpArea.style.top = _y - _r + 'px';
			hlpArea.style.width = _r+_r + 'px';
			hlpArea.style.height = _r+_r + 'px';
		}
		hlpArea.style.display = 'inherit';
	}
	chart.set = function(node){
		var res = arguments[1]; //arguments of popup witch pass async by pop callback //null if cancel presed
		var req = {lblTitle:'<h2>Парамметры задания</h2>', state:Pop.DTE};
		if(!_root){
			hlpArea.style.display = 'none';
			pop({lblTitle:'Перед началом работы выберете или создайте новый проект'})
			return;
		}
		if(node.constructor != chart.Node)return console.error('Err chartSet: this not instanceof node');
		console.log('add call, arguments[1]:',res);
		
		if(res==='delete'){
			console.log('delete node')
			node.restore();
			node.clear();
			xdb.del(node);
			_nodes.splice(_nodes.indexOf(node),1);
			return hlpArea.style.display = 'none';
		}else if(res==='cancel'){
			node.restore(); //пытаемся восстановить прежнее состояние задачи если таковое было сохранено
			return hlpArea.style.display = 'none';
		}else if(typeof res == 'object'){
			node.set(res);
			chart.hlp(node);
		}else if(res == 'canDel'){
			req.state = Pop.CAP|Pop.DTE|Pop.DEL;
		}
		
		var req = node.getReq(req,res);
		
		if(!(req.state&~(Pop.DTE|Pop.DEL))){//похоже несоответствия устранены, закрываем диалог
			console.info('USEVE DONE')
			node.unsave(); //если задача сохраняла свое предыдущее положение удалем его (стирается из чарта)
			chartSet(node); //добавив задачу (отредактированную или новую) в чарт
			return hlpArea.style.display = 'none';
		}
		pop(req, chart.set.bind(this,node));
	}
	function chartSet(node){
		if(!~_nodes.indexOf(node)){ //если нода еще не добавлена
			_nodes.push(node);
		}
		node.parent = _root.id;
		xdb.put(node);
		//iddb.set(node);
		console.log("SORTED!")
		_nodes.sort(function(a,b){return a.to-b.to});
		node.draw();
	}
	
//	chart.save = function(root){
//		console.log('chart.save(',root,')');
//		//pop({lblTitle:'Открыв новый график вы потеряете все несохраненные изменения в текущем. Уверены?'})
//	};
//	_root = true;
	var xdb = Xdb('iddb',addRoot);
	function addRoot(root,isSelected){
		console.log('onAddRoot',root);
		_roots.push(root);
		var option = document.createElement("option");
		option.setAttribute('value',option.innerHTML=root.caption);
		lstRoot.add(option);
		if(isSelected) lstRoot.selectedIndex = lstRoot.options.length-1;
	}
	function reloadNodes(nodes){
		console.log('xdb.onopen(',nodes,') loading...');
		_nodes = nodes.map(function(node){return chart.Node(node)});
		_root = this;
		lstRoot.selectedIndex = lstRootSysLen + _roots.indexOf(_root);
		chart.from = _root.from;
		chart.to = _root.to - T_DAY;
		_nodes.sort(function(a,b){return a.to-b.to});
		chart.draw();
	}
	
	
	chart.open = function(root){
		var res = arguments[1]; //arguments of popup witch pass async by pop callback //null if cancel presed
		console.log('chart.open(',root,')');
		var req = {lblTitle:'<h2> Открытие проекта '+(root&&root.caption||'')+'</h2>',state:0};
		
		if(res == 'cancel') return hlpArea.style.display = 'none';
		if(root&&root.id){//open
			//if(!_root || res){//если не открыт текущий проект или если ответ с popup предупреждением был получен
				xdb.open(root,reloadNodes);
				return hlpArea.style.display = 'none';
			//}
		}else{//create
			if(typeof res == 'object') root = chart.Node(res); //обновляем параметры проекта из диалога если был ответ
			if(!root||!root.caption){
				req.state|=Pop.CAP;
				req.lblTitle+=' <b>Требуется</b> уникальное название для нового проекта. (4< символов <50)';
			}else if(!root||_roots.some(function(r){return r.caption == root.caption}) ){
				req.state|=Pop.CAP;
				req.lblTitle+=' <b>Требуется</b> <b style="color:red">уникальное</b> название для нового проекта. (4< символов <50)';
			}
			
			if(!root||!root.from||!root.to){
				req.state|=Pop.DTE;
				req.lblTitle+=' <b>Требуется</b> установка корректных дат.';
			}
			if(typeof res == 'object' && !req.state){//ответ был дан и после валидации ни каких запросов более не требуется - создаем
				xdb.open(root,reloadNodes);
				return hlpArea.style.display = 'none';
			}
		}
		//if(_root)req.lblTitle+='<br><b style="color:red">ВНИМАНИЕ</b> Все несохраненные изменения в текущем проекте будут потеряны! Уверены?'
		if(root){
			req.propCaption=root.caption||'';
			req.propDescription=root.description||'';
			req.from=(new Date(root.from+.5*T_DAY)).toISOString().slice(0,10);
			req.to=(new Date(root.to-.5*T_DAY)).toISOString().slice(0,10);
		}
		pop(req,chart.open.bind(this,root));
	};
	
	txtSize.onkeydown = function(ev){
		if(69==ev.keyCode||188<=ev.keyCode&&ev.keyCode<=191) ev.preventDefault(); //запрещаем вводить экспоненту +/- и точку
		if(36<ev.keyCode&&ev.keyCode<41) ev.stopPropagation(); //стрелки не управляют скролом
	}
	txtSize.onchange = function(){
		var newSize = txtSize.value = Math.min(Math.max(txtSize.value|0,txtSizeMin),txtSizeMax)|0;
		var dtSize = Math.floor(newSize - _size);
		chart.from = (new Date( +_from - Math.floor(dtSize/2-1) * T_DAY - T_DAY) ).toISOString().slice(0,10);
		chart.to = (new Date( +_from + newSize * T_DAY - T_DAY) ).toISOString().slice(0,10);
		chart.draw();
	}
	dteFrom.onchange= function(){
		chart.from = dteFrom.value;
		chart.draw();
	}
	dteTo.onchange= function(){
		chart.to = dteTo.value;
		chart.draw();
	}
	div.querySelectorAll('[class^="GanttBoxMnu__btn_size"], [class*=" GanttBoxMnu__btn_size"]').forEach(function(btn){
		btn.onclick = function(){
			var mul = +(this.getAttribute('data-mul')||1);
			var add = +(this.getAttribute('data-add')||0);
			txtSize.value=Math.min(Math.max(txtSize.value*mul+add,txtSizeMin),txtSizeMax)|0;
			txtSize.onchange();
		}
	});
	lstRoot.onclick = function(){this.value = "-nav"};
	lstRoot.onblur = function(){this.value = _root?_root.caption:"-nav"};
	lstRoot.onchange = function(){
		//TODO: reserve node names
		var caption = this.options[this.selectedIndex].value;
		console.log(caption);
		if(caption == '-new'){
			chart.open();
		}else if(caption == '-save'){
			//chart.save(caption);
		}else if(caption == '-saveAs'){
			//chart.save();
		}else{ //load caption node
			chart.open(_roots[this.selectedIndex-lstRootSysLen]);
		}
		this.value = _root?_root.caption:"-nav"
	}
	window.addEventListener('mousewheel', function(ev){
		txtSize.value -= -2*Math.sign(ev.deltaY);
		txtSize.onchange();
	});
	window.addEventListener('keydown', function(ev){ //scroll by keyboard
		console.log('window.keyCode:',ev.keyCode);
		if(ev.keyCode==37);
		else if(ev.keyCode==38);
		else if(ev.keyCode==39);
		else if(ev.keyCode==40);
		else if(ev.keyCode==187)txtSize.onchange( txtSize.value=Math.min(Math.max(+txtSize.value+1,txtSizeMin),txtSizeMax)|0 );
		else if(ev.keyCode==189)txtSize.onchange( txtSize.value=Math.min(Math.max(txtSize.value-1,txtSizeMin),txtSizeMax)|0 );
	});
	window.onresize = function(){
		ctx.canvas.style.imageRendering = 'pixelated';
		ctx.canvas.width=ctx.canvas.offsetWidth;
		ctx.canvas.height=ctx.canvas.offsetHeight;
		txtSize.onchange();
	}
	window.onresize();
	return chart;
}