// JavaScript Document
if(typeof(OGX) === 'undefined'){
	var OGX = {};
}
OGX.MongogxCollection = class{
	
	constructor(__name, __data){
		this.name = __name;
		this.data = __data;
        this._initDocuments();
	}
	
	get collection(){
		let json = [];
		for(let a in this.data){
			json.push(this.data);
		}
		return json;
	}
	
	insert(){
		if(arguments.length > 0){
			return this.insertMany.apply(null, arguments);
		}
		return this.insertOne(arguments[0]);
	}
	
	insertOne(__object){
		if(!__object.hasOwnProperty('_id')){
			__object._id = this._genMongoId();
		}else{
			//to do : better check if id is valid
			if(!__object._id.length === 24){
				return false;
			}
		}
		this.data[__object._id] = __object;
		return __object._id;
	}
	
	insertMany(){
		let ids = [];
		let id;
		for(let a in arguments){
			id = insertOne(a);
			ids.push(id);
		}
		return ids;
	}	
	
	/*
	$currentDate : Sets the value of a field to current date, either as a Date or a Timestamp.
	$inc : 	Increments the value of the field by the specified amount.
	$min : 	Only updates the field if the specified value is less than the existing field value.
	$max : Only updates the field if the specified value is greater than the existing field value.
	$mul : Multiplies the value of the field by the specified amount.
	$rename : Renames a field.
	$set : Sets the value of a field in a document.
	[no support] $setOnInsert : Sets the value of a field if an update results in an insert of a document. Has no effect on update operations that modify existing documents.
	$unset : Removes the specified field from a document.
	*/
	update(__query, __update){
		return this.updateOne(__query, __update);
	}
	
	updateOne(__query, __update){
		let collection = this.find(__query, 1);
		if(collection){			
			return this._update(collection, __update);
		}
		return false;
	}
	
	updateMany(){
		let collection = this.find(__query);
		if(collection){			
			return this._update(collection, __update);
		}
		return false;
	}	
	
	replaceOne(__query, __object){		
		__object._id = this._genMongoId();
		let collection = this.find(__query, 1);
		if(collection){
			for(let _id in collection){
				this.data[__object._id] = __object;
				delete this.data[_id];
				return true;				
			}
		}
		return false;
	}
	
	deleteOne(__query){
		let collection = this.find(__query, 1);
		if(collection){
			for(let _id in collection){			
				delete this.data[_id];
				return true;				
			}
		}
		return false;
	}
	
	deleteMany(__query){
		let matched = 0;
		let collection = this.find(__query);
		if(collection){
			for(let _id in collection){			
				delete this.data[_id];	
				matched++;
			}
		}
		return matched;
	}
	
	//find all documents matchin that query 1st
	find(__query, __limit){	        
		typeof(__limit)==='undefined'?__limit=0:null;
		let match, path, base, matched;
		let docs = {};
		let t = 0;
		//For all docs in this collection
		for(let _id in this.data){
			match = true;	
			matched = false;
			//for all properties in the query			
			for(let prop in __query){
				/**				
				WARNING! MONGODB STOPS AT ARRAY LEVEL
				IF ARRAY, NEXT IS EITHER AN INDEX OR A PROPERTY IN ARRAY TO FIND
				AFTER THAT NO MORE PATH HANDLING				
				So, no more eval here, just build path, if you meet array, this is the choice, then stop.
				If there is shit after any, stop and return that multi nesting find is to do
				If not supported by mongo (it does't seem to be), then let's not do it (doable but slow, recursions of x arrays)				
				*/
				base = this.data[_id];
				path = prop.split('.');		
				if(path.length > 1){
					while(path.length > 0){	
						if(!base.hasOwnProperty(path[0])){
							match = false;
							//console.log('bad path');
							break;
						}				
						if(match){				
							base = base[path[0]];	
							path.shift();			
							if(Array.isArray(base)){				
								//treat it as array only if next is not index and
								//only if fist element of array is an object, otherwise 							
								//if next element of path is a number then it means index								
								if(!isNaN(Number(path[0]))){
									base = base[path[0]];	
									path.shift();									
								}else{
									//next is not a number in the path
									//if end of path, the operation is over a simple array
									if(path.length === 0){
										match = this._handleOp(base, __query[prop]);	
										if(match){
											//no need to go further for this doc	
											matched = true;											
											break;
										}										
									}else{									
										//next property is a property, loop that array
										//run compare for every element
										for(let i = 0; i < base.length; i++){									
											match = this._handleOp(base[i][path[0]], __query[prop]);									
											if(match){
												//no need to go further for this doc	
												matched = true;											
												break;
											}										
										}
										break;	
									}
								}								
							}else{
								//console.log('reduce');								
							}
						}
						if(!match){
							break;
						}
					}
				}else{
					//simple match
					if(!base.hasOwnProperty(prop)){
						//bad path
						match = false;
					}else{
						base = base[prop];			
					}									
				}				
				if(match && !matched){
					match = this._handleOp(base, __query[prop]);
					if(!match){
						break;
					}
				}
			}
			if(match){
				docs[_id] = this.data[_id];
				t++;
				if(__limit > 0 && __limit === t){
					return docs;
				}
			}
		}
		return docs;
	}
	
		
	//Return as array
	toJSON(){
		let json = [];
		for(let a in this.data){
			json.push(this.data[a]);
		}
		return json;
	}	
	
	/*INTERNAL STUFF*/	
	_handleOp(__obj_value, __value){
		let match = true;
		let oper;
		if(typeof(__value) === 'object'){
			for(let op in __value){
				if(op.substr(0,1) === '$'){
					oper = op.substr(1);
					switch(oper){
						case 'eq':
						match = (__obj_value === __value[op]);
						break;	

						case 'neq':
						match = (__obj_value !== __value[op]);
						break;	

						case 'gt':
						match = (__obj_value > __value[op]);
						break;	

						case 'gte':
						match = (__obj_value >= __value[op]);
						break;

						case 'lt':
						match = (__obj_value < __value[op]);
						break;

						case 'lte':
						match = (__obj_value <= __value[op]);
						break;
							
						case 'in':
						if(Array.isArray(__value[op])){
							for(let i = 0; i < __value[op].length; i++){
								match = (__obj_value.indexOf(__value[op][i]) !== -1);
								if(match){
									break;
								}
							}
						}else{
							match = (__obj_value.indexOf(__value[op]) !== -1);	
						}
						break;							
							
						case 'text':						
						match = (__obj_value.indexOf(__value[op]) !== -1);	
						break;
							
						case 'nin':
						//and
						if(Array.isArray(__value[op])){				
							for(let i = 0; i < __value[op].length; i++){
								match = (__obj_value.indexOf(__value[op][i]) === -1);	
								if(!match){
									break;
								}
							}							
						}else{
							match = (__obj_value.indexOf(__value[op]) === -1);	
						}
						break;
							
						case 'regex':
						match = (__value[op].match(__obj_value));	
						break;
							
						case 'mod':
						match = (__obj_value % __value[op][0] === __value[op][1]);
						break;
							
						case 'all':
						//must be array
						if(Array.isArray(__value[op]) && Array.isArray(__obj_value)){		
							let found;
							match = true;
							for(let i = 0; i < __value[op].length; i++){
								found = false;
								for(let j = 0; j < __obj_value.length; j++){
									if(__value[op][i] === __obj_value[j]){
										found = true;
										break;
									}
								}
								if(!found){
									match = false;
									break;
								}
							}
						}						
						break;
							
						case 'size':
						match = (__value[op].length == __obj_value.length);		
						break;
					}
				}
				if(!match){
					break;
				}			
			}
			return match;
		}else{
			//simple compare match
			if(__obj_value === __value){
				return true;
			}
		}	
		return false;
	}

	_update(__collection, __update){
		let match = 0;
		for(let _id in __collection){
			let oper, ev, ev2, pre, pro;
			for(let op in __update){
				if(op.substr(0,1) === '$'){
					oper = op.substr(1);
					for(let prop in __update[op]){
						//eval 
						switch(oper){
							case 'set':
							ev = eval('this.data[_id].'+prop+'='+__update[op][prop]);
							if(typeof(ev) !== 'undefined'){
								match++;		
							}	
							break;	
								
							case 'unset':
							ev = eval('delete this.data[_id].'+prop);
							if(typeof(ev) !== 'undefined'){
								match++;		
							}	
							break;
								
							case 'inc':
							ev = eval('this.data[_id].'+prop+'+='+__update[op][prop]);
							if(typeof(ev) !== 'undefined'){
								match++;						
							}	
							break;	
								
							case 'min':								
							ev = eval('this.data[_id].'+prop);
							if(typeof(ev) !== 'undefined' && ev > __update[op][prop]){
								ev = eval('this.data[_id].'+prop+'='+__update[op][prop]);	
								if(typeof(ev) !== 'undefined'){
									match++;
								}									
							}	
								
							case 'max':								
							ev = eval('this.data[_id].'+prop);
							if(typeof(ev) !== 'undefined' && ev < __update[op][prop]){
								ev = eval('this.data[_id].'+prop+'='+__update[op][prop]);	
								if(typeof(ev) !== 'undefined'){
									match++;
								}
							}
							break;	
								
							case 'mul':								
							ev = eval('this.data[_id].'+prop+'*='+__update[op][prop]);
							if(typeof(ev) !== 'undefined'){
								match++;							
							}	
							break;
								
							case 'rename':	
							//catch last variable of path						
							let pos = prop.lastIndexOf('.');		
							if(pos === -1){
								//single prop
								pre = '';
								pro = prop;
							}else{
								pre = prop.substr(0, pos+1);
								pro = prop.split('.').pop();			
							}
							ev = eval('this.data[_id].'+pre+__update[op][prop]+'=this.data[_id].'+pre+pro);
							ev2 = eval('delete this.data[_id].'+pre+pro);
							if(typeof(ev) !== 'undefined'){
								match++;							
							}	
							break;
						}						
					}
				}
			}
		}
		return match;
	}
    
    _initDocuments(){
        let docs = {};
        for(let a in this.data){           
            docs[this.data[a]._id] = this.data[a];
        }
        this.data = docs;
    }
	
	_genMongoId(){		
		let rnd = Math.floor(new Date().getTime()/1000).toString(16);
		while(rnd.length < 24){
			rnd += Math.floor(Math.random()*10).toString();
		}
		return rnd;		
	}
	
};	
	