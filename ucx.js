"use strict";
function UCx(set){
//TODO: this==Div? create new canvas & appendChild!
//TODO: typeof set=='string' ? set canvas.style.cssText property
//or for(key in set) for(node in key.split('.')) => sub properties set support!
//TODO: typeof set=='object' ? => Destructuring assignment //can set like this: set({canvas:{width:64,height:64}})
//TODO: typeof set=='function' && typeof prop=='function' ? => create c.prop.old = c.prop test it on bind!
//TODO: typeof set=='function' && typeof prop!='function' ? => create getter/setter function
	console.log(this);
	console.log(typeof this == 'string');
	var C=!this||this==window?document.createElement('canvas')
		:typeof this == 'string'?document.querySelector(this)
		:this instanceof HTMLCanvasElement? this: this.canvas;
	console.log(C);
	
	var c = C.getContext('2d');
//	console.log(this);
	c.set = (set,_,$)=>{
		for(var s in set){
			$=s in C?C:c;
			_=typeof set[s]=='function'?set[s].bind($):set[s];
			$[s]=_;
		}
		return c;
	}
	c.full = (set)=>{set&&c.set(set);c.fillRect(0,0,4e3,4e3);return c}
	c.px = (x,y,set)=>{set&&c.set(set);c.fillRect(x,y,1,1);return c}
	c.grid = (w,h,set)=>{set&&c.set(set);for(var p=4e3/w|0,n=-p;n<p;n++)c.strokeRect(n*w+.5,n*h+.5,p*w,p*h);return c}
	c.chess= (w,h,set)=>{set&&c.set(set);for(var p=(2e3/w<<1)+1,q=p*(2e3/h<<1),n=q;n>=0;n-=2)c.fillRect((n%p)*w+.5,(n/p|0)*h+.5,w,h);return c}
	c.pat = (pat,rep)=>c.createPattern((pat||c).canvas,rep||'repeat');
	c.bg = (pat)=>{C.style.background='url('+(pat||c).canvas.toDataURL()+')';return c};
	c.set(UCx.prototype)
	c.fillTextCenter = (str, x, y)=>{c.fillText(str, x - c.measureText(str).width/2, y);return c};
	return c.set(set);
}

//(hi) some complex draw methods:
UCx.prototype.setBgGrid = function(w, h, zoomX, zoomY){
	var X = zoomX|0 || 1, Y = zoomY|0 || zoomX;
	var grid = UCx({width:(w+w)*X, height:(h+h)*Y})	//создать новую расширенную канву с указанными width,height
	.full({fillStyle: '#eee'})								//заполнить ее всю цветом #999
	.chess(w*X, h*Y, {fillStyle: '#ddd'})				//нарисовать на ней квадраты w*h в шахматном порядке
	.grid(w*X, h*Y, {strokeStyle: '#999'})			//нарисовать сетку c шагом w*h
	.full({fillStyle:UCx({width:X, height:Y})			//заполнить ее всю патерном (паттерн создается из новой канвы w*h)
		.px(0, 0,{fillStyle:'#fff'})								//на которой рисуется белая точка в 0,0
		.pat()});												//после чего она преобразовывается в паттерн

	this.bg(grid);	//текущей канве (на которой вызван setBgGrid метод) установить в качестве css background созданную канву grid
	this.canvas.style.backgroundSize = (w+w)*zoomX+'px '+ (h+h)*zoomY + 'px'; //масштабирование если размеры были дробные
	return
}