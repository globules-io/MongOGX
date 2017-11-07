// JavaScript Document
if(typeof(OGX) === 'undefined'){
	var OGX = {};
}
OGX.Mongogx = class{
	
	constructor(__database, __collection){
		this.database = null;
		this.config = null;
		this._loadConfig();
		this._initDatabases();		
		if(typeof(__database) !== 'undefined'){
			if(this.setDatabase(__database) && typeof(__collection) !== 'undefined'){
				this.setCollection(__collection);
			}			
		}		
	}
	
	/*DATABASES*/		
	setDatabase(__name){
		if(this.config.db.hasOwnProperty(__name)){
			this.database = __name;
			return true;
		}
		return false;
	}
	
	getDatabases(){
		let names = [];
		for(let a in this.config.db){
			names.push(a);
		}
		return names;
	}
	
	createDatabase(__name){
		if(this.config.db.hasOwnProperty(__name)){	
			return false;
		}
		this.config.db[__name] = new OGX.MongogxDatabase(__name, {});
		return true;
	}
	
	deleteDatabase(__name){
		if(!this.config.db.hasOwnProperty(__name)){	
			return false;
		}
		delete this.config.db[__name];
		return true;
	}
	
	/*COLLECTIONS*/
	setCollection(__name){
		if(this._dbSet()){
			return this.config.db[this.database].setCollection(__name);
		}
		return false;		
	}
	
	getCollection(__name){		
		if(typeof(__name) === 'undefined' && this._isSet()){
			__name = this.config.db[this.database].collection;
		}		
		if(this._dbSet() && this.config.db[this.database].hasCollection(__name)){
			return this.config.db[this.database].getCollection(__name).collection;
		}
		return false;
	}
	
	createCollection(__name){
		if(this._dbSet()){
			let col = this.config.db[this.database].createCollection(__name);
			if(col){
				this.config.db[this.database].collections[__name] = col;
				return true;
			}
		}		
		return false;
	}
	
	deleteCollection(__name){
		if(!this.database){
			return false;
		}
		return this.config.db[this.database].deleteCollection(__name);
	}
	
	/*QUERY/OPERATIONS*/
	insert(){
		if(arguments.length > 1){
			return this.insertMany.apply(null, arguments);
		}
		return this.insertOne(arguments[0]);
	}
	
	insertOne(__object){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().insertOne(__object);
		}
		return false;
	}
	
	insertMany(){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().insertMany.apply(null, parameters);
		}
		return false;
	}	
	
	update(__query, __update){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().update(__query, __update);
		}
		return false;
	}
	
	updateOne(__query, __update){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().updateOne(__query, __update);
		}
		return false;
	}
	
	updateMany(__query, __update){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().updateMany(__query, __update);
		}
		return false;
	}
	
	replaceOne(__query, __object){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().replaceOne(__query, __object);
		}
		return false;
	}
	
	deleteOne(__query){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().deleteOne(__query, __object);
		}
		return false;
	}
	
	deleteMany(__query){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().deleteMany(__query);
		}
		return false;
	}
	
	find(__query, __limit){
		if(this._isSet()){
			let col = this.config.db[this.database].getCollection();
			return this.config.db[this.database].getCollection().find(__query, __limit);
		}
		return false;
	}
	
	/*INTERNAL STUFF*/
	_loadConfig(){
		let conf_default = '{"db":{"mongogx":{"test":{}}}}';
		let conf = localStorage.getItem('mongogx');
		if(conf){
			this.config = JSON.parse(conf);		
		}else{
			this.config = JSON.parse(conf_default);
			localStorage.setItem('mongogx', conf_default);
		}		
	}
	
	_initDatabases(){
		for(let a in this.config.db){
			this.config.db[a] = new OGX.MongogxDatabase(a, this.config.db[a]);
		}		
	}	
	
	_updateDatabase(__name){
		
	}
	
	_updateCollection(__name){
		
	}	
	
	_write(){
		
	}
		
	//db and collections are set
	_dbSet(){
		return (this.database && this.config.db.hasOwnProperty(this.database));
	}	
		
	_isSet(){
		return (this._dbSet() && this.config.db[this.database].collection !== null);
	}
};