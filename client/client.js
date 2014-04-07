Meteor.subscribe("services");
Meteor.subscribe("tasks");
Meteor.subscribe("orders");
Meteor.subscribe("inventory");
Meteor.subscribe("carts");

Router.map(function(){
	this.route('login', {path:'/'});
	this.route('sales', {path:'/sales'});
	this.route('staff', {path:'/staff'});
	this.route('register', {path:'/register'});
});

Template.login.events({
	'click #login' : function(e,t){
		data = {};
		$.each( $("#login_form").serializeArray(),function(){
			data[this.name] = this.value;
		});

		Meteor.loginWithPassword(data['username'], data['password'], function(err){
			if(err){
				Session.set("login_errors", err.reason);
			}
			else{
				if(Meteor.user() != null){
					if(Meteor.user().profile.role == "staff"){
						Router.go("/staff");
					}else{
						Router.go("/sales");
					}
				}else{
					console.log("no user");
				}
			}
		});

		return false;
	},

	'click #register' : function(e,t){
		Router.go("/register");
		return false;
	},
});

Template.register.events({
	'click #register' : function(e,t){
		data = {};
		$.each( $("#register_form").serializeArray(),function(){
			data[this.name] = this.value;
		});

		Accounts.createUser(
		{
			username: data['username'],
			password: data['password'],
			profile: {
				name: data['username'],
				role: "user",
			}
		}, 
		function(cb){
			if(Meteor.user() != null){
				Router.go("/sales");
			}else{
				console.log("no user");
			}
		});

		
		return false;
	},
});
