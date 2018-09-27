var Xdb = function(host, onAddRoot){
	if(host != 'iddb') console.warn('Сетевая БД на данный момент не поддерживается'); //TODO: ws/rtc
	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	if (!indexedDB) window.alert('Ваш браузер не поддерживат стабильную версию IndexedDB. Обновите его');
	const ver = 1;
	var xdb = {
		state:'offline',
		open:function(root,onopen){
			console.log('xdb.open(',root,')');
			if(root.id){//открытие существующего проекта
				indexedDB.open('db',ver).onsuccess=  function(ev){
					var transaction = this.result.transaction(['nodes'], "readwrite");
					var nodes = [];
					transaction.objectStore('nodes').index("parent").openCursor(IDBKeyRange.only(root.id)).onsuccess = function(ev) {
						var cur = ev.target.result;
						if(!cur)return;
						nodes.push(cur.value);
						cur.continue();
					}
					transaction.oncomplete = function(ev){
						console.log('transaction.oncomplete(',ev,')');
						if(typeof onopen == 'function')onopen.call(root,nodes); //если передан колбек вызвать 
					};
				}
			}else{//создание нового проекта
				indexedDB.open('db',ver).onsuccess=  function(ev){
					var transaction = this.result.transaction(['nodes'], "readwrite");
					transaction.objectStore('nodes').add({parent:0,from:root.from,to:root.to,caption:root.caption}).onsuccess = function(ev){
						console.log('db.transaction.add(',root,').onsuccess(',ev.target.result,')');
						root.id = ev.target.result;
						if(!root.parent)onAddRoot(root); //если создан корень сгенерить событие добавления корня
						if(typeof onopen == 'function')onopen.call(root,[]); //если передан колбек вызвать 
					}
				}
			}
		},
		put:function(node,ondone){
			indexedDB.open('db',ver).onsuccess=  function(ev){
				var transaction = this.result.transaction(['nodes'], "readwrite");
				var val = {parent:node.parent,
						   from:node.from,
						   to:node.to,
						   row:node.row,
						   caption:node.caption,
						   description:node.description,
						   style:node.style};
				if(node.id) val.id = node.id;
				transaction.objectStore('nodes').put(val).onsuccess = function(ev){
					console.log('db.transaction.put(',node,').onsuccess(',ev.target.result,')');
					node.id = ev.target.result;
					//if(!node.parent)onAddRoot(node); //если создан корень сгенерить событие добавления корня
					//if(typeof onopen == 'function')onopen.call(node,[]); //если передан колбек вызвать 
				}
			}
		},
		del:function(node){
			if(!node.id) return console.warn('xdb.del({id:undefined,...})');
			else console.log('xdb.del({id:'+node.id+'})')
			indexedDB.open('db',ver).onsuccess=  function(ev){
				var transaction = this.result.transaction(['nodes'], "readwrite");
				var nodes = transaction.objectStore('nodes');
				nodes.openCursor(IDBKeyRange.only(node.id)).onsuccess = function(e) {
					var cur = e.target.result;
					if(!cur) return;
					nodes.delete(cur.primaryKey);
					cur.continue();
				}
			}
		}
	};
	
	var db = indexedDB.open('db', ver); //localbase name 'db', version number
	db.onerror = function(ev){
		xdb.state='error';
		console.warn(db.errorCode,'db.onerror(',ev,')');
	}
    db.onupgradeneeded = function(ev){
		xdb.state='upgrde';
		console.info('db.onupgradeneeded(',ev,')');
        var db = ev.currentTarget.result;
        var nodes = db.createObjectStore('nodes', {keyPath:'id', autoIncrement: true})
        nodes.createIndex('parent', 'parent', { unique: false });
        nodes.createIndex('from', 'from', { unique: false });
        nodes.createIndex('to', 'to', { unique: false });
		//nodes.add({caption:'test', parent: 0, from: -Infinity, to: +Infinity});
	}
	db.onsuccess = function(ev){
		xdb.state='loading';
		console.log('db.onsuccess(',ev,')');
		
		var transaction = this.result.transaction(['nodes'], 'readwrite');
		transaction.onerror = function(ev) {
			xdb.state='error transaction';
			console.log('transaction.onerror(',ev,')')
		};
		transaction.objectStore('nodes').index("parent").openCursor(IDBKeyRange.only(0)).onsuccess = function(ev) {
			var cur = ev.target.result;
			if(!cur)return;
			onAddRoot(cur.value);
			cur.continue();
		}
		transaction.oncomplete = function(ev){
			xdb.state='online';
			console.log('transaction.oncomplete(',ev,')');
		};
	}
	return xdb;
}