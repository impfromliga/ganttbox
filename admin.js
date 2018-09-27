"use strict";
onload = function(ev){
var chart = new Chart('.GanttBox');

var lsn = {
	hvr:function(e,s){console.log('hvr:',s.dbgKey)},
	dn:function(e,s){console.log('dn:',s.dbgKey)},
	drg:function(e,s){var r=16-Math.hypot(s.dX,s.dY);r<0&&console.log('drg:',s.dbgKey);return r},
	mov:function(e,s){console.log('mov:',s.dbgKey);return true},
	drp:function(e,s){console.log('drp:',s.dbgKey)},
	hld:function(e,s){var r=600-s.dT;r<0&&console.log('hld600+'+-(r|0)+':',s.dbgKey);return r},
	hldUp:function(e,s){console.log('hldUp:',s.dbgKey)},
	hldDrg:function(e,s){var r=16-Math.hypot(s.dX,s.dY);r<0&&console.log('hldDrg:',s.dbgKey);return r},
	hldMov:function(e,s){console.log('hldMov:',s.dbgKey);return true},
	hldDrp:function(e,s){console.log('hldDrp:',s.dbgKey)},
	up:function(e,s){console.log('up:',s.dbgKey)},
	clk:function(e,s){var r=300-s.dT;r<0&&console.log('clk300:',s.dbgKey);return r},
	dblDn:function(e,s){console.log('dblDn:',s.dbgKey)},
	dblClk:function(e,s){console.log('dblClk:',s.dbgKey)},
	dblDrg:function(e,s){var r=16-Math.hypot(s.dX,s.dY);r<0&&console.log('dblDrg:',s.dbgKey);return r},
	dblMov:function(e,s){console.log('dblMov:',s.dbgKey);return true},
	dblDrp:function(e,s){console.log('dblDrp:',s.dbgKey)},
	dblHld:function(e,s){var r=600-s.dT;r<0&&console.log('dblHld600:',s.dbgKey);return r},
	dblHldMov:function(e,s){console.log('dblHldMov:',s.dbgKey);return true},
	dblHldDrp:function(e,s){console.log('dblHldDrp:',s.dbgKey)},
}
//Отпусканние мыши после короткого нажатия (неназначено - сброс выделения):
lsn.up=function(e,s){
	console.log('up:',s.dbgKey);
	chart.hlp(0,0,0);
	s.clkX = s.X; s.clkY = s.Y; //сохраним в объект координаты где была отпущена мышь (для использования в lsn.clk)
}

//Быстрые свайпы без удержания
lsn.mov = function(ev,s){
	chart.hlp(0,0,0);
	console.log('mov:',s.dbgKey)
	if(s.dT < 500 && Math.hypot(s.dX, s.dY) < 250)
		chart.canvas.style.left = s.dX +'px';
	else{
		chart.moveBy(s.dX, s.dY);
		s.event = ev;//
	}
	return true;
}
lsn.drp = function(ev,s){chart.moveBy(s.dX, s.dY)}

//Анимация удержания клика:
lsn.hld = function(ev,s){
	var r=600-s.dT;
	if(r<500)chart.hlp(s.X,s.Y, Math.max(15,50*Math.sqrt(r/500)));
	if(r>0)return true; else console.log('hld600+'+-(r|0)+':',s.dbgKey);
	return r;
}
//Отпускание после долгого удержания со смещением и без (сброс выделения):
lsn.hldDrp = lsn.hldUp = function(ev,s){
	chart.hlp(0,0,0);
}

//Отпусканние мыши после короткого нажатия с паузой 300 гарантирующей что не происходит двойной клик:
lsn.dblDn = function(e,s){
	console.log('dblDn:',s.dbgKey);
	chart.hlp(s.clkX,s.clkY, 15);
}
lsn.dblClk = function(e,s){
	console.log('dblClk:',s.dbgKey);
	//s.X/Y в случае смещения в промежуток после отпускания и до 300мс паузы указывает на последнюю mousemov (это норма! т.к. это тоже можно перегрузить), для получения изначальных координат "клика" нужно запоминать их вручную в передаваемом s-объекте //TODO: авто запоминание?
	var node = chart.sel(s.clkX,s.clkY);
	if(node) chart.set(node,'canDel');
	else{
		console.log('ДаблКлик в молоко',s.clkX,s.clkY);
		chart.hlp(0,0,0);
	}
}
//Протяжка диапазона, создание и добавление задачи:
lsn.dblDrg = function(ev,s){ //Установка начала диапазона при начале смещения
	var r=16-Math.hypot(s.dX,s.dY);if(r>0)return true; else console.log('dblDrg:',s.dbgKey);
	var x = s.X-s.dX, y = s.Y-s.dY;
	var node = chart.sel(x,y);
	console.log(s.node);
	if(!node){
		chart.hlp(s.node = chart.Node(x,y));
		s.whichBound = Math.sign(s.dX);
		return r;
	}
	s.node = node.save(); //передаем задачу с сохранением его текущего состояния (для восстановления по Cancel);
	var left = node.left, size = node.right - left;
	s.whichBound = ((x-left)*3/size|0)-1; //вычисление треть попадания клика (для перемещения соответствующей границы или обоих)
	return r;
}
lsn.dblMov = function(ev,s){ //Установка конца диапазона на текущее смещение
	console.log('dblMov:',s.dbgKey);
	//console.log('whichBound',s.whichBound)
	if(s.whichBound == 1){
		s.node.right = s.X;
	}else if(s.whichBound == -1){
		s.node.left = s.X;
	}else{
		var left = s.node.left, size = s.node.right - left;
		s.node.left = s.X - size/2;
		s.node.right = s.node.left + size;
		s.node.y = s.Y;
	}
	chart.hlp(s.node);
	return true;
}
//Добавление новой задачи в выбранном диапазоне:
lsn.dblDrp = function(ev,s){
	console.log('dblDrp:',s.dbgKey);
	chart.set(s.node);
	//return false;
}


//Конфигурация роутера событий:
setInterval(Even3({
	'touchstart|touchmove|touchend': (e) => {
		var t = e.changedTouches && (e.touches.length == (e.type != 'touchend')) && e.changedTouches[0];
		t.type = e.type;	t.timeStamp = e.timeStamp;	//t.target = e.target; //target одного пальца уже есть
		e.preventDefault();
		return t;
	}
})
.add({'mouseup|mousemove|mousedown|touchstart|touchmove|touchend':chart.canvas})
.set(
	[{'mousemove': lsn.hvr}],							//just moving mouse without clicking
	[{'mousedown|touchstart': lsn.dn},					//leading mouse down
		[{'if': lsn.drg},								//swipe = mouse down + immediately mouse move
			[{'mousemove|touchmove': lsn.mov}],			//continue dragging
			[{'mouseup|touchend': lsn.drp}]				//droping
		],
		[{'if': lsn.hld},								//hold = mouse down + dalay
			[{'mouseup|touchend': lsn.hldUp}],			//hold + mouse up ()
			[{'if': lsn.hldDrg},
				[{'mousemove|touchmove': lsn.hldMov}],		//hold + mouse move
				[{'mouseup|touchend': lsn.hldDrp}]			//hold + mouse up ()
			]
		],
		[{'mouseup|touchend': lsn.up},					//mouse down + immediately mouse up
			[{'if': lsn.clk}],						//click with guarantee that double can't happen
			//TODO: [{'if': {delay:200,gra:16}},
			[{'mousedown|touchstart': lsn.dblDn},		//click + immediately mouse down
				[{'mouseup|touchend': lsn.dblClk}],	//double-click = click + immediately mouse down + immediately mouse up
				[{'if': lsn.dblDrg},								//swipe = mouse down + immediately mouse move
					[{'mousemove|touchmove': lsn.dblMov}],		//hold + mouse move
					[{'mouseup|touchend': lsn.dblDrp}]				//droping
				],
//				[{'if': lsn.dblHld},					//click + immediately mouse down + delay
//					[{'mousemove|touchmove': lsn.dblHldMov}],		//hold + mouse move
//					[{'mouseup|touchend': lsn.dblHldDrp}]			//hold + mouse up ()
//				]
			]
		]
	]
),50)
}