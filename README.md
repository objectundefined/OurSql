OurSql currently requires node-mysql, which must be initialized separately.  For now, this is to allow easy table-relationships between multiple databases.  Each client represents a database, so if you're only using one database, your mysql configuration will look as follows: 

	Mysqlclient = require("mysql").Client;
	mysqlclient = new Mysqlclient();
	mysqlclient = new Mysqlclient();
	mysqlclient.user = 'db_username';
	mysqlclient.password = 'db_password';
	mysqlclient.database = "db_database";
	mysqlclient.connect();

Next, import OurSql and create models:

	OurSql = require('./OurSql');

	User = new OurSql.Model('Users',mysqlclient);
	Entry = new OurSql.Model('Entries',mysqlclient);
	Tag = new OurSql.Model('Tags',mysqlclient);
	Media = new OurSql.Model('Media',mysqlclient);
	
	User.addMethod('getEntries',function(callback){
		return Entry.findWhere({userId:this.id},callback);
	});