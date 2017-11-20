// JavaScript Document
if(typeof(OGX) === 'undefined'){
	var OGX = {};
}
//receives a JSON document with all its collections
OGX.MongogxDatabase = class{	
	
	constructor(__name, __data, __collection_name){		
		this.name = __name;		
		this.collection = null;
		this.collections = __data;
        this._initCollections();
		if(typeof(__collection_name) !== 'undefined'){
			this.setCollection(__collection_name);
		}
	}	
	
	setCollection(__name){
		if(this.collections.hasOwnProperty(__name)){
			this.collection = __name;
			return true;
		}
		return false;
	}
	
	getCollections(){
		let cols = [];
		for(let a in this.collections){
			cols.push(a);
		}
		return cols;
	}
	
	getCollection(__name){
		if(typeof(__name) === 'undefined' && this.collection){
			__name = this.collection;
		}
		if(!this.collections.hasOwnProperty(__name)){
			return false;
		}
		return this.collections[__name];
	}
	
	createCollection(__name){
		if(this.collections.hasOwnProperty(__name)){
			return false;
		}
		this.collections[__name] = new OGX.MongogxCollection(__name, {});
		return this.collections[__name];
	}
	
	deleteCollection(__name){
		if(!this.collections.hasOwnProperty(__name)){
			return false;
		}		
		delete this.collections[a];
	}
	
	hasCollection(__name){
		return this.collections.hasOwnProperty(__name);
	}
	
	_initCollections(){
		for(let a in this.collections){
			this.collections[a] = new OGX.MongogxCollection(a, this.collections[a]);
		}
	}
	
	toJSON(){
		return this.collections;
	}
};
