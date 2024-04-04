if(typeof(OGX) === 'undefined'){
	var OGX = {};
}
OGX.Mongogx = class{
	
	constructor(__database, __collection, __options){        
        this.data_default = {db:{mongogx:{}}};
		this.database = null;
		this.data = null;
        this.options = null;
        let options_default = {
            storage:OGX.Mongogx.LOCAL_STORAGE, 
            write_concern:{mode:OGX.Mongogx.WRITE_DIRECT, delay:5}, 
            encryption:false, 
            format:OGX.Mongogx.FORMAT_ARRAY, 
            callback:function(){}
        };
        if(typeof(__options) === 'undefined'){
            __options = {};
        }
        for(var a in options_default){
            if(!__options.hasOwnProperty(a)){
                __options[a] = options_default[a];
            }
        }
        this.options = __options;
		this._loadData(__database, __collection);         
	}
    
    /*CONSTANTS*/
    static get LOCAL_STORAGE(){
        return 'localStorage';
    }

    static get SESSION_STORAGE(){
        return 'sessionStorage';
    }
    
    static get APP_STORAGE(){
        return 'appStorage';    
    }
    
    static get WRITE_DIRECT(){
        return 'writeDirect';    
	}
	
	static get ENCRYPTION_AES(){
        return 'AES';    
    }
    
    static get FORMAT_OBJECT(){
        return 0;
    }
    
    static get FORMAT_ARRAY(){
        return 1;
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

    clearCollection(__name){
        if(!this.database){
			return false;
		}
        let clear = this.data.db[this.database].clearCollection(__name);
        if(clear){           
			this._write();
			return true;		
        }
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
            let col = this.data.db[this.database].getCollection().find(__query, __limit);
            if(this.options.format){
                col = this._objToArr(col);
            }
            return col;
		}
		return false;
	}

    findOne(__query){   
        if(this._isSet()){
            let doc = this.data.db[this.database].getCollection().findOne(__query);         
            if(this.options.format){
                doc = this._objToArr(doc)[0];
                return doc;
            }
		}
		return false;
    }     
	
	/*INTERNAL STUFF*/
    _objToArr(__obj){
        let arr = [];
        for(let a in __obj){
            if(__obj.hasOwnProperty(a)){
                arr.push(__obj[a]);
            }            
        }
        return arr;
    }

    _getStorage(__storage){
        let storage;
        switch(__storage){
            case OGX.Mongogx.LOCAL_STORAGE:
            storage = localStorage;
            break;

            case OGX.Mongogx.SESSION_STORAGE:
            storage = sessionStorage;
            break;
        }
        return storage;
    }
    
	_loadData(__database, __collection){
        let that = this;
        switch(this.options.storage){
            case OGX.Mongogx.APP_STORAGE:
            this._readFile('mongogx.data', function(__data){
				if(that.options.encryption){
					__data = that._decrypt(__data);
				}
                that.data = JSON.parse(__data);	
                that._write(); 
                that._initDatabases(__database, __collection);                 
            });            
            break;                
                
            case OGX.Mongogx.LOCAL_STORAGE:
            case OGX.Mongogx.SESSION_STORAGE:
            let storage = this._getStorage(this.options.storage);
            let data = storage.getItem('mongogx');
		    if(data){
				if(that.options.encryption){
					data = that._decrypt(data);
				}
                this.data = JSON.parse(data);	                
            }else{
                this.data = JSON.parse(JSON.stringify(this.data_default));
                this._write();                       
            }
            this._initDatabases(__database, __collection);          
            break;
        }        
	}   
	
	_initDatabases(__database, __collection){
		for(let a in this.data.db){           
			this.data.db[a] = new OGX.MongogxDatabase(a, this.data.db[a]);             
		}  
        if(typeof(__database) !== 'undefined' && __database){            
            if(!this.data.db.hasOwnProperty(__database)){
                this.createDatabase(__database);
            }
            this.setDatabase(__database);
            if(typeof(__collection) !== 'undefined'){
                let col = this.getCollection(__collection);
                if(!col){
                    this.createCollection(__collection);
                }
                this.setCollection(__collection);
            }			
        } 
        if(this.options.storage === OGX.Mongogx.APP_STORAGE){
            this.options.callback();
        }
	}		
	
	_write(){
		let that = this;
		let data = JSON.stringify(that.data);
		if(this.options.encryption){
			data = this._encrypt(data);
		}
        switch(this.options.storage){
            case OGX.Mongogx.APP_STORAGE:
            setTimeout(function(){                
                that._writeFile('mongogx.data', data);    
            }, that.options.write_concern.delay);   
            break;
                
            case OGX.Mongogx.LOCAL_STORAGE:
            case OGX.Mongogx.SESSION_STORAGE:
            let storage = this._getStorage(this.options.storage); 
            setTimeout(function(){
                storage.setItem('mongogx', data);   
            }, that.options.write_concern.delay);            
            break;
        }        
	}

	_encrypt(__json_string){
		switch(this.options.encryption.scheme){
			case OGX.Mongogx.ENCRYPTION_AES:
			return this._encryptAES(__json_string);
		}	
	}

	_encryptAES(__json_string){
		let encrypted = CryptoJS.AES.encrypt(__json_string, this.options.encryption.key, {mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7});
		return encrypted.toString();
	}

	_decrypt(__json_string){
		switch(this.options.encryption.scheme){
			case OGX.Mongogx.ENCRYPTION_AES:
			return this._decryptAES(__json_string);
		}
	}
	
	_decryptAES(__json_string){
		let decrypted = CryptoJS.AES.decrypt(__json_string, this.options.encryption.key, {mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7});
		return decrypted.toString(CryptoJS.enc.Utf8);
	}
		
	//db and collections are set
	_dbSet(){
		return (this.database && this.data.db.hasOwnProperty(this.database));
	}	
		
	_isSet(){
		return (this._dbSet() && this.data.db[this.database].collection !== null);
	}
    
    _writeFile(__filename, __data, __cb){
		if(this.options.encryption){
			__data = this._encrypt(__data);
		}
	    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(__dir){
	        __dir.getFile(__filename, {create:true}, function(__file){            
	            __file.createWriter(function(__fileWriter){  
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
		let that = this;
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory+__filename, function(__ref){
             __ref.file(function(__file){
                let reader = new FileReader();
                reader.onloadend = function(){ 
					let data = this.result;
					if(that.options.encryption){
						data = that._decrypt(data);
					}     
                    __cb(data); 
                };
                reader.readAsText(__file);
            });   
        }, () => this._onReadFail());       
    }

    _onReadFail(__file_error){
		this.data = JSON.parse(JSON.stringify(this.data_default));	
        this._writeFile('mongogx.data', JSON.stringify(this.data));
        this._initDatabases();
    }     
};