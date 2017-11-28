// JavaScript Document
if(typeof(OGX) === 'undefined'){
	var OGX = {};
}
OGX.Mongogx = class{
	
	constructor(__database, __collection, __options){        
        this.data_default = {db:{mongogx:{}}};
		this.database = null;
		this.data = null;
        this.options = null;
        let options_default = {storage:OGX.Mongogx.LOCAL_STORAGE, write_concern:{mode:OGX.Mongogx.WRITE_DIRECT, delay:5}};
        if(typeof(__options) === 'undefined'){
            __options = {};
        }
        for(var a in options_default){
            if(!__options.hasOwnProperty(a)){
                __options[a] = options_default[a];
            }
        }
        this.options = __options;
		this._loadData();
		this._initDatabases();       
		if(typeof(__database) !== 'undefined'){
			if(this.setDatabase(__database) && typeof(__collection) !== 'undefined'){
				this.setCollection(__collection);
			}			
		}        
	}
    
    /*CONSTANTS*/
    static get LOCAL_STORAGE(){
        return 'localStorage';
    }
    
    static get APP_STORAGE(){
        return 'appStorage';    
    }
    
    static get WRITE_DIRECT(){
        return 'writeDirect';    
    }
	
	/*DATABASES*/		
	setDatabase(__name){
		if(this.data.db.hasOwnProperty(__name)){
			this.database = __name;
			return true;
		}
		return false;
	}
	
	getDatabases(){
		let names = [];
		for(let a in this.data.db){
			names.push(a);
		}
		return names;
	}
	
	createDatabase(__name){
		if(this.data.db.hasOwnProperty(__name)){	
			return false;
		}
		this.data.db[__name] = new OGX.MongogxDatabase(__name, {});
		this._write();
		return true;
	}
	
	deleteDatabase(__name){
		if(!this.data.db.hasOwnProperty(__name)){	
			return false;
		}
		delete this.data.db[__name];
		this._write();
		return true;
	}
	
	/*COLLECTIONS*/
	setCollection(__name){
		if(this._dbSet()){
			return this.data.db[this.database].setCollection(__name);
		}
		return false;		
	}
	
	getCollection(__name){		
		if(typeof(__name) === 'undefined' && this._isSet()){
			__name = this.data.db[this.database].collection;
		}		
		if(this._dbSet() && this.data.db[this.database].hasCollection(__name)){
			return this.data.db[this.database].getCollection(__name).collection;
		}
		return false;
	}
	
	createCollection(__name){
		if(this._dbSet()){
			let col = this.data.db[this.database].createCollection(__name);
			if(col){
				this.data.db[this.database].collections[__name] = col;
				return true;
			}
		}		
		return false;
	}
	
	deleteCollection(__name){
		if(!this.database){
			return false;
		}
		let del = this.data.db[this.database].deleteCollection(__name);
		if(del){
			this._write();
			return del;
		}
		return false;
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
			let col = this.data.db[this.database].getCollection();
			let insert = this.data.db[this.database].getCollection().insertOne(__object);            
            if(insert){
                this._write();
                return insert;
            }
		}
		return false;
	}
	
	insertMany(){
		if(this._isSet()){			
			let insert = this.data.db[this.database].getCollection().insertMany.apply(null, parameters);
            if(insert){
                this._write();
                return insert;
            }
		}
		return false;
	}	
	
	update(__query, __update){
		if(this._isSet()){			
			let update = this.data.db[this.database].getCollection().update(__query, __update);
            if(update){
                this._write();
                return update; 
            }
		}
		return false;
	}
	
	updateOne(__query, __update){
		if(this._isSet()){			
			let update = this.data.db[this.database].getCollection().updateOne(__query, __update);
            if(update){
                this._write();
                return update; 
            }
		}
		return false;
	}
	
	updateMany(__query, __update){
		if(this._isSet()){			
			let update = this.data.db[this.database].getCollection().updateMany(__query, __update);
            if(update){
                this._write();
                return update; 
            }
		}
		return false;
	}
	
	replaceOne(__query, __object){
		if(this._isSet()){			
			let replace = this.data.db[this.database].getCollection().replaceOne(__query, __object);
            if(replace){
                this._write();
                return replace; 
            }
		}
		return false;
	}
	
	deleteOne(__query){
		if(this._isSet()){			
			let del = this.data.db[this.database].getCollection().deleteOne(__query);
            if(del){
                this._write();
                return del;  
            }
		}
		return false;
	}
	
	deleteMany(__query){
		if(this._isSet()){		
			let del = this.data.db[this.database].getCollection().deleteMany(__query);
            if(del){				
                this._write();
                return del;  
            }
		}
		return false;
	}
	
	find(__query, __limit){        
		if(this._isSet()){
           return this.data.db[this.database].getCollection().find(__query, __limit);
		}
		return false;
	}
	
	/*INTERNAL STUFF*/
	_loadData(){
        let that = this;
        switch(this.options.storage){
            case OGX.Mongogx.APP_STORAGE:
            this._readFile('mongogx.data', function(){
                that.data = JSON.parse(__data);	
                that._write();
            });            
            break;                
                
            case OGX.Mongogx.LOCAL_STORAGE:
            let data = localStorage.getItem('mongogx');
		    if(data){
                this.data = JSON.parse(data);	                
            }else{
                this.data = JSON.parse(JSON.stringify(this.data_default));
                this._write();
            }
            break;
        }      	
	}   
	
	_initDatabases(){
		for(let a in this.data.db){           
			this.data.db[a] = new OGX.MongogxDatabase(a, this.data.db[a]);             
		}       
	}		
	
	_write(){
        let that = this;
        switch(this.options.storage){
            case OGX.Mongogx.APP_STORAGE:
            setTimeout(function(){                
                that._writeFile('mongogx.data', JSON.stringify(that.data));    
            }, that.options.write_concern.delay);   
            break;
                
            case OGX.Mongogx.LOCAL_STORAGE:
            setTimeout(function(){
                localStorage.setItem('mongogx', JSON.stringify(that.data));   
            }, that.options.write_concern.delay);            
            break;
        }        
	}
		
	//db and collections are set
	_dbSet(){
		return (this.database && this.data.db.hasOwnProperty(this.database));
	}	
		
	_isSet(){
		return (this._dbSet() && this.data.db[this.database].collection !== null);
	}
    
    _writeFile(__filename, __data, __cb){
	    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(__dir){
	        __dir.getFile(__filename, {create:true}, function(__file){            
	            __file.createWriter(function(__fileWriter){
	                //fileWriter.seek(fileWriter.length);         
	                let blob = new Blob([__data], {type:'text/plain'});
	                __fileWriter.write(blob);
	                if(typeof(__cb) !== 'undefined'){
	                    __cb();
	                }
	            });                     
	        });
	    });   
    }

    _readFile(__filename, __cb){       
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory+__filename, function(__ref){
             __ref.file(function(__file){
                let reader = new FileReader();
                reader.onloadend = function(){          
                    __cb(this.result); 
                };
                reader.readAsText(__file);
            });   
        }, this._onReadFail);       
    }

    _onReadFail(__file_error){
        this.data = JSON.parse(JSON.stringify(this.data_default));
        this._writeFile('mongogx.data', JSON.stringify(this.data_default));
    }     
};