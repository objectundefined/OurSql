--Introdiuction--

OurSql generates live database objects that respond similarly to the ActiveRecord pattern, however it does not support model creation, table generation, etc.  As a result, OurSql is geared primarily toward those who are working with pre-existing MySql databases, or those who are willing to create tables from scratch.  The only requirement is that every table initialized by OurSql must have an auto-increment, unique field named 'id'.

To install OurSql, it is recommended that you install NPM and run the command:
	
	$ npm install oursql

--Model Creation--

Import OurSql, connect to the database, and create models.  Models are based upon pre-existing mysql tables in the given mysql database client. You don't need to define properties and types for any pre-existing columns in each table, however you can define relationships between tables by adding methods:

	var	OurSql = require('oursql'),
	sqloptions = {user:'dbuser',password:'dbpassword',database:'blog',host:'localhost')

	OurSql.connect(sqloptions, function(){

		// SYNTAX: Object = new OurSql.Model(TableName,mysqlclient)
		
		User = new OurSql.Model('Users',mysqlclient);
		Entry = new OurSql.Model('Entries',mysqlclient);
		Tag = new OurSql.Model('Tags',mysqlclient);
		
		User.addMethod('getEntries',function(callback){
			return Entry.findWhere({userId:this.id},callback);
		});
		User.addMethod('getLastFiveEntries',function(callback){
			return Entry.retrieve({where:{userId:this.id},orderBy:'dateline DESC',limit:5},callback);
		});
	
	});	

--Model Usage--

Now, you can use your object models to perform CRUD operations.  You can either pass an object of key-value pairs when you create the instance, or you can create a blank instance and set values thereafter:

	// Create a brand new User
	
		var jack = new User.Instance({name:'Jack'});	
		jack.age = 25;
		jack.girlfriend = 'Jill';

	// Since jack is an object you just created without first retrieving it from the DB, 
	// the save() operation will create a new database entry. 
	
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
			
		});
		
		jack.delete(); //supports callback to determine success or failure
		
	})
