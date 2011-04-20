var Mysqlclient = require("mysql").Client,
	mysqlclient = new Mysqlclient();
	
exports.connect = function(mysqloptions,callback){

	for (var i in mysqloptions)
		if(mysqloptions.hasOwnProperty(i))
			mysqlclient[i] = mysqloptions[i];		
	
	mysqlclient.connect(function(err,status){
	
		if(!err) callback()
		else throw(err);
	});
};


exports.Model = function(tableName){	
    var mminstance = function(){
		var mi = this;
    	mi._get_defs = function(callback){
    		if(!mi.defs){
    			var query = "select COLUMN_NAME, DATA_TYPE from information_schema.columns where table_name='" +tableName+ "'";
 				mysqlclient.query(query, function(err,defs){
					if(!err)mi.defs = defs;
					callback(err,defs);
				});
    		} else callback(null, mi.defs);
    	};
    	mi._filter_vals = function(instance,defs){
    		var toUpdateVals = {};
			defs.forEach(function(field){
				if(field['COLUMN_NAME']!='id' && field['COLUMN_NAME'] in instance)
					toUpdateVals[field['COLUMN_NAME']] = instance[field['COLUMN_NAME']];
			});    	
			return toUpdateVals;
    	};
    	mi.findWhere = function(obj,callback){
    		var query = "select * from "+ tableName +" WHERE";
    		Object.keys(obj).forEach(function(key,i){
    			var prefix = (i > 0)?" AND ":" ";
    			query = query + prefix + key + "="+ (isNaN(parseInt(obj[key]))?"'":"") + obj[key]+ (isNaN(parseInt(obj[key]))?"'":"");
    		});
    		mysqlclient.query(query,function(err,rows){
    			var irows = rows.map(function(r){return new mi.Instance(r);});
    			callback(err,irows)
    		});
    	};
		mi.retrieve = function(params,callback)
		{
			var params = params || {};
			query='select '+ (params['select']|| ['*']).join(',') + ' FROM '+ tableName;
			
			if('where' in params) 
			{
				query = query + ' WHERE';
				Object.keys(params.where).forEach(function(key,i){
					var prefix = (i > 0)?" AND " : " ";
					query = query + prefix + key + "=" + (isNaN(parseInt(params.where[key]))?"'":"") + params.where[key] + (isNaN(parseInt(params.where[key]))?"'":"");
				});	
			}
		
			if('orderBy' in params) 
			{
			var k = Object.keys(params.orderBy)[0];
				query = query + ' ORDER BY ' + k + ' ' + params.orderBy[k];
			}
			if('limit' in params)
				query = query + ' LIMIT ' + ('offset' in params?params.offset + ', ':'' ) + params.limit;
				
				
			return mysqlclient.query(query,callback);
		};

    	mi.find = function(id,callback){
    		mi.findWhere({id:id},function(err,res){
    			if(res.length>0) return callback(err,res[0]);
    			else return callback(err,null);
    		});
    	};
		mi.addMethod = function(name,func){
			mi.Instance.prototype[name] = func;
		};
    	mi.Instance = function(userObj){
			var instance = this;
			var init = function(vals){
				Object.keys(vals).forEach(function(key){
					instance[key] = vals[key];
				});
			};
			instance._update = function(callback){
				mi._get_defs(function(err,defs){
						var toUpdateVals = mi._filter_vals(instance,defs);
						var query = "UPDATE "+tableName+" SET";
						Object.keys(toUpdateVals).forEach(function(key,i){
							var prefix = (i > 0)?", ":" "; 
							query = query + prefix + key + "='"+ toUpdateVals[key] +"'";
						});						
						query = query+ ' WHERE id=' + instance.id;
						mysqlclient.query(query,function(){
							if(callback) callback.apply(instance,arguments);
						});
					}
				);
			};
			instance._create = function(callback){
				var toUpdateVals = {};
				mi._get_defs(function(err,defs){
						toUpdateVals = mi._filter_vals(instance,defs);
						var query = "INSERT INTO "+tableName+" SET ";
						Object.keys(toUpdateVals).forEach(function(key,i){
							var prefix = (i > 0)?", ":" "; 
							query = query + prefix + key + "='"+ toUpdateVals[key] +"'";
						});						
						mysqlclient.query(query,function(e,status){
							if(status) instance.id = status.insertId || null;
							if(callback) callback.apply(instance,arguments);							
						});
					}
				);
			};
			instance.save = function(callback){
				if('id' in this) this._update(callback);
				else this._create(callback);
			};
            instance['delete'] = function(callback){
                if('id' in this)
                {
                    var query = 'DELETE FROM '+tableName+' WHERE id = '+instance.id;
                    mysqlclient.query(query,callback)
                }
            }; 

			var vals = userObj || {};
    		init(vals);

    	}

    };
    return new mminstance();
};