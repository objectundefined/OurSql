OurSql currently requires node-mysql, which must be initialized separately.  For now, this is to allow easy table-relationships between multiple databases.  Each client represents a database, so if you're only using one database, your mysql configuration will look as follows: 

	Mysqlclient = require("mysql").Client;
	mysqlclient = new Mysqlclient();
	mysqlclient = new Mysqlclient();
	mysqlclient.user = 'db_username';
	mysqlclient.password = 'db_password';
	mysqlclient.database = "db_database";
	mysqlclient.connect();

Next, import OurSql and create models.  Models are based upon pre-existing mysql tables in the given mysql database client. You don't need to define properties and types for any pre-existing columns in each table, however you can define relationships between tables by adding methods:

	OurSql = require('./OurSql');

	User = new OurSql.Model('Users',mysqlclient);
	Entry = new OurSql.Model('Entries',mysqlclient);
	Tag = new OurSql.Model('Tags',mysqlclient);
	
	User.addMethod('getEntries',function(callback){
		return Entry.findWhere({userId:this.id},callback);
	});
	User.addMethod('getLastFiveEntries',function(callback){
		return Entry.retrieve({where:{userId:this.id},orderBy:'dateline DESC',limit:5},callback);
	});
	
Now, you can use your object models to perform CRUD operations.  You can either pass an object of key-value pairs when you create the instance, or you can create a blank instance and set values thereafter:

	// Create a brand new User
	
		var jack = new User.Instance({name:'Jack'});	
		jack.age = 25;
		jack.girlfriend = 'Jill';

	// Since jack is an object you just created without first retrieving it from the DB, the save() operation will create a new database entry. 
	
		jack.save();	
	
	// Now, jack will have an ID
	
		jack.id   // returns int 5 

	// Later, you'll want to retrieve jack from the database.

	User.find(5,function(oneUser){
		
		jack = oneUser;
		jack.id   // returns int 5
		jack.girlfriend     // returns str 'Jill'
		jack.getLastFiveEntries(function(entries){
			
			// entries is an array of Entry Instances
			
			entries[0].title = 'NEW TITLE';
			entries[0].save();
			
		})
		
	})