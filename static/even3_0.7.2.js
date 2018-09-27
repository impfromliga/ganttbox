"use strict";
//TODO: user event types extension
	//DONE?://TODO: циклические ссылки в цепях
	//NOLIB?://TRY: multi-item Even3 optimization //!!! see event.target!
	//DONE: by setEventListener()//TRY: reject by Object.defineProperty() events external reset
		//NOLIB://FIX: alias from touch to mouse - reject multitouch
		//DONE://TODO: combine add & set methods (to function stile usage) 
function Even3(ext){
	var root = '';
    var trees = {'':[{root:function(){throw Error("impossible mistake: Can't run root node")}}]},
        self, state = trees[root], sub = {type:'if', root: root}, bound={left:0,top:0,right:0,bottom:0,width:0,height:0};
    self = function(e){
		if(this!=window) bound = this.getBoundingClientRect();
		//if(/mousemove|touchmove/.test(e&&e.type||'if'))console.log(e.type, state);
        e = e || window.event || {};
        for(var n in ext)
            if((new RegExp(n)).test(e.type)){
                var evt = ext[n](e);
                //console.log('touch evt convert to ->',evt.type);
                route(evt||{type:'if'});
                return;
            }
        route(e || {type:'if'});
    }
    var route = function(e){
		sub.event = sub.event || e; //главное событие если не установлено, то ЭТО главное
        //sub.event.timeStamp = sub.event.timeStamp || (window.performance && window.performance.now());
        sub.X = e.clientX - bound.left || sub.X; sub.Y = e.clientY  - bound.top || sub.Y; //большие координаты по wait не обновляется
        sub.now = e.timeStamp || (window.performance && window.performance.now()); //при wait симулируется //TRY: в каком формате timeStamp?
        sub.time = sub.time || sub.now;	//время предыдущего события если не установлено, то ЭТО предыдущее
        sub.dT = (sub.now - sub.event.timeStamp) || 0; //большая дельта времени от главного события
        sub.dx = e.clientX - bound.left - (sub.x || e.clientX - bound.left);
		sub.dy = e.clientY  - bound.top - (sub.y || e.clientY  - bound.top); //малые d для реального текущ. = от пред.соб.
		if(Number.isNaN(sub.dx))sub.dx = false;		if(Number.isNaN(sub.dy))sub.dy = false; //для псевдо события = false
        sub.dX = (sub.X - sub.event.clientX + bound.left) || 0;	sub.dY = (sub.Y - sub.event.clientY + bound.top) || 0; //большие d для реального = от главн. (иначе =0)
        while(true){//сначало маршрутизируем wait псевдособытия, пока (на некотором >=0 вложении) не останется ни одного конкурирующего wait
            sub.dt = (sub.now - sub.time) || 0;
            for(var buf = [], key, obj, n = 1; obj = state[n] && state[n][0]; n++) //0й индекс родитель, >=1 индексы массывы потомков
                if( (new RegExp(key = Object.keys(obj)[0])).test('if') ){ //обработка только wait событий конкурирующих за время/условия
					sub.dbgKey = key; //передача в обработчик ключа под которым он находиться в вреве
					var newsub = obj[key](sub.event, sub);	//узнаем какой приоритет вернут все wait'ы (вместо wait(e) передаем главн.соб)
					//var newsub = (typeof obj[key] == 'function') ? obj[key](e, sub) : obj[key]; //возврат константы недоступен для wait
                	//sub.x = sub.X; sub.y = sub.Y;	//wait не должен менять дельты, во время wait они должны копиться
                    if(newsub === true) continue;	//этот wait не готов, он ожидает других условий
                    if(newsub === false || newsub === undefined || newsub === null) {state = trees[root]; /*sub = {};*/ break;} //рвем цепь
					if(typeof newsub == 'string') {state = trees[/*root=*/newsub]; return;} //переход в узел по ключу (корень без изменений?)
					if(typeof newsub == 'object') {state = newsub; sub = {}; return;} //переход состояния в узел, root остается без изменений
                	//if(typeof newsub == 'function') {} //не перегружено
                    if(newsub < 0) buf.push({delay: newsub - Math.random(), state: state[n]}); //возврат чисел конкурирует по -значению
                }
            if(!buf.length) break; //ни кто не захотел конкурировать - обрыв события
            var erlyest = buf.reduce(function(a, b){return (a.delay < b.delay) ? a : b}); //кто самый конкурентный?
            state = erlyest.state; //на тот узел делаем переход
			//TODO: обработка 'if' только через конструктор условий
			//TODO: обработчики не возвращают никакой дикой логики (ее возвращает .if() метод объекта функции обработчика)
			//TODO: .if метод может быть объектом с условиями // hndl=f=>();hndl.if = {delay:600,radius:16} //и не нужен конструктор
			//var then = state[Object.keys(state)[0]].then; then&&then(sub.event, sub); //обработка then конкурирующего события	
            sub.time += erlyest.delay; //|| sub.now; //уменьшаем накопленное время, т.к. там может быть под цепочка тоже из wait'ов
            //sub.event = e || sub.event; //сохраняем информацию о выполненном событии (не для wait'ов)
            if(state.length <= 1) state = trees[root]; //тупиковая цепочка, возвращаем состояние на корень Even3
        }
        if(state.length <= 1) state = trees[root]; //тупиковая цепочка, возвращаем состояние на корень Even3
        for(var key, obj, n = 1; obj = state[n] && state[n][0]; n++){
            var regex = new RegExp(key = Object.keys(obj)[0]);
            if(regex.test(e.type)){
				sub.dbgKey = key; //передача в обработчик ключа под которым он находиться в вреве
				var newsub = (typeof obj[key] == 'function') ? obj[key](e, sub) : obj[key]; //может не fn возвращает значение а const
                sub.time = sub.now; //дублируем метку времени события
				//console.log('evt');
                sub.x = sub.X; sub.y = sub.Y; //случилось реальное событие, потому малые координаты устанавливаются равными реальным
                if(newsub === true) continue; //событие ожидает других условий
                if(newsub === false || newsub === null) { state = trees[root]; /*sub = {};*/ return false}; //событие обрывает цепочку
                sub.event = e; //текущее событие становиться главным
				if(typeof newsub == 'string') {state = trees[/*root=*/newsub]; return;} //переход в узел по ключу (корень без изменений?)
                //TODO: событие может вернуть объект newsub... сделаем управляемый переход для граффовой структуры цепочек?
                if(typeof newsub == 'object') {state = newsub; sub = {}; return;} //переход состояния в узел, root остается без изменений
                //if(typeof newsub == 'function') {} //не перегружено
                //if(typeof newsub == 'number') {} //не перегружено
                state = state[n]; //возврат поумолчанию (undefined) - переход внутрь выполнившегося узла
                return false;
            }
        }
    }
    self.set = function(setMode){
		var n = 0|typeof setMode == 'string';
		if(!n) setMode = '';
		//else trees[setMode].push([{root:function(){throw Error("impossible mistake: Can't run root node")}}]); //may need to multi trees set
		for(; n < arguments.length; n++) trees[setMode].push(arguments[n]);
		return self;
	};
    self.add = function(eitem){
		for(var key in eitem){
			console.log(eitem[key])
			key.split('|').forEach(function(e){eitem[key].addEventListener(e, self.bind(eitem[key]))});return self
		}
	};
//	self.If = function(callback,r,t){
//		if(typeof r=='undefined')r=16;	if(typeof t=='undefined')t=400;
//		var f = function(e,s){return t-s.dT+r-Math.hypot(s.dX,s.dY)};
//		f.then = callback;
//		return f;
//	}
	return self;
}

/*
var lsn = {
	hvr:function(e,s){console.log('hvr:',s.dbgKey)},
	dn:function(e,s){console.log('dn:',s.dbgKey)},
	drg:function(e,s){var r=16-Math.hypot(s.dX,s.dY);r<0&&console.log('drg:',s.dbgKey);return r},
	mov:function(e,s){console.log('mov:',s.dbgKey);return true},
	drp:function(e,s){console.log('drp:',s.dbgKey)},
	hld:function(e,s){var r=600-s.dT;r<0&&console.log('hld600:',s.dbgKey);return r},
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
setInterval(Even3({
	'touchstart|touchmove|touchend': (e) => {
		var t = e.changedTouches && (e.touches.length == (e.type != 'touchend')) && e.changedTouches[0];
		t.type = e.type;	t.timeStamp = e.timeStamp;	t.target = e.target;
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
			[{'mousemove|touchmove': lsn.hldMov}],		//hold + mouse move
			[{'mouseup|touchend': lsn.hldDrp}]			//hold + mouse up ()
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
				[{'if': lsn.dblHld},					//click + immediately mouse down + delay
					[{'mousemove|touchmove': lsn.dblHldMov}],		//hold + mouse move
					[{'mouseup|touchend': lsn.dblHldDrp}]			//hold + mouse up ()
				]
			]
		]
	]
), 50);
*/