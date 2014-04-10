Meteor.subscribe("services");
Meteor.subscribe("tasks");
Meteor.subscribe("orders");
Meteor.subscribe("inventory");
Meteor.subscribe("carts");
// Meteor.subscribe("users");
Meteor.subscribe("order_process");
Meteor.subscribe("purchase_process");
Meteor.subscribe("purchase");

Router.map(function(){
	this.route('login', {path:'/'});
	this.route('sales', {path:'/sales'});
	this.route('user', {path:'/user'});
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
				alert(err.reason);
			}
			else{
				if(Meteor.user() != null){
					if(Meteor.user().profile.role == "staff"){
						Router.go("/staff");
					}else if(Meteor.user().profile.role == "sales"){
						Router.go("/sales");
					}else{
						Router.go("/user");
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
			function(err){
				if(err){
					alert(err.reason);
				}else{
					Router.go("/user");
				}
			}
		);

		return false;
	},
});
