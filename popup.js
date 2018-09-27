"use strict";
Pop.CAP = 1, Pop.DTE = 2, Pop.OPT = 4; Pop.DEL = 8;
function Pop(ids){
/*	div:'.GanttBoxPop',
	lblTitle:'.GanttBoxPop__lbl_title',
	lblCaption:'.GanttBoxPop__lbl_caption',
	propCaption:'.GanttBoxPop__prop_caption',
	lblDescription:'.GanttBoxPop__lbl_description',
	propDescription:'.GanttBoxPop__prop_description',
	btnOk:'[class^="GanttBoxPop__btn_ok"],[class*=" GanttBoxPop__btn_ok"]',
	btnCancel:'[class^="GanttBoxPop__btn_cancel"],[class*=" GanttBoxPop__btn_cancel"]'	*/
	var div = (typeof ids.div=='string')? document.querySelector(ids.div): ids.div
	var grp = [];
	document.querySelectorAll('[class^="GanttBoxPop__grp"],[class*=" GanttBoxPop__grp"]').forEach(function(item){
		var mod = item.className.match(/GanttBoxPop__grp_([_a-zA-Z0-9-]*)/);
		if(mod) grp.push({item:item, mod:mod[1].toUpperCase()})
	});
	function pop(res,callback){
		console.log('pop',res.state,'res:',res)
		res.state = res.state || 0;
		grp.forEach(function(el){
			if(res.state & Pop[el.mod]) el.item.classList.remove('hide');
			else el.item.classList.add('hide');
		})
		pop.state = res.state;
		pop.lblTitle.innerHTML = res.lblTitle||'';
		pop.propDescription.value = res.propDescription||'';
		pop.propCaption.value = res.propCaption||'';
		pop.propFrom.value = res.from&&res.from||pop.propFrom.value;
		pop.propTo.value = res.to&&res.to||pop.propTo.value;
		pop.callback = callback;
		div.style.display = 'inherit';
	};
	for(var k in ids)
		if(k!='div')
			pop[k] = (typeof ids[k]=='string')? div.querySelector(ids[k]) :ids[k];
	
	div.onclick = function(ev){
		if(ev.target==this) pop.btnCancel.onclick();
	}
	pop.btnCancel.onclick = function(ev){
		div.style.display = 'none';
		pop.state = NaN;
		pop.callback&&pop.callback('cancel');
	}
	pop.btnDel.onclick = function(ev){
		div.style.display = 'none';
		pop.state = NaN;
		pop.callback&&pop.callback('delete');
	}
	pop.btnOk.onclick = function(ev){
		var res = {
			//state:pop.state,
			caption:pop.propCaption.value,
			description:pop.propDescription.value,
			opt:div.querySelector('[class^="GanttBoxPop__opt"]:checked,[class*=" GanttBoxPop__opt"]:checked').value,
			propFrom:pop.propFrom.value,
			propTo:pop.propTo.value,
		}
		console.log(res);
		div.style.display = 'none';
		pop.state = NaN;
		pop.callback&&pop.callback(res);
	}
//	window.addEventListener('keydown', function(ev){ //scroll by keyboard
//		if(ev.keyCode==13 && !isNaN(pop.state)) pop.btnOk.onclick();
//	});
	return pop;
}