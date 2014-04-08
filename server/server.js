Meteor.startup(function () {

	Meteor.users.remove({});

	var username = "sales";
	Accounts.createUser({
		username: username,
		password: "asdf",
		profile: {
			name: "GC Sales",
			role: "sales"
		}
	});

	var username2 = "staff";
	Accounts.createUser({
		username: username2,
		password: "asdf",
		profile: {
			name: "GC Staff",
			role: "staff"
		}
	});

	var username3 = "user";
	Accounts.createUser({
		username: username3,
		password: "asdf",
		profile: {
			name: "GC User",
			role: "user"
		},
	});

	Inventory.remove({});
	Inventory.insert(
		{
			type: "Garment",
			item: "Shirt",
			qty: 0,
			itemNum: 123,
			color: "Blue",
			unitPrice: 10 
		}
	);
	Inventory.insert(
		{
			type: "Canvas",
			item: "Tarpaulin",
			qty: 0,
			itemNum: 234,
			color: "Red",
			unitPrice: 50 
		}
	);
	Inventory.insert(
		{
			type: "Garment",
			item: "Leather",
			qty: 0,
			itemNum: 345,
			color: "Green",
			unitPrice: 20 
		}
	);

	Services.remove({});
	Services.insert(
		{
			service: "Embroidery",
			value: 1
		}
	);
	Services.insert(
		{
			service: "Screen Printing",
			value: 0
		}
	);
	Services.insert(
		{
			service: "Promotional",
			value: 0
		}
	);
	Services.insert(
		{
			service: "Business Cards",
			value: 0
		}
	);

	Orders.remove({});
	Orders.insert({
		date: "01/01/2014",
		order_id: 1234,
		invoice: "12345678",
		username: username3,
		name: "GC User",
		grand_total: 10,
		service: "Embroidery",
		status: "Waiting",
	});

	Tasks.remove({});
	Tasks.insert(
		{
			tags:["Need to Order", "Embroidery"],
			date: "01/01/2014",
			invoice: "12345678",
			username: "user",
			name: "GC User",
			itemNum: 123,
			qty: 1,
			s: 1,
			m: 0,
			l: 0,
			xl: 0,
			x2: 0,
			x3: 0,
			other: 0,
			unitPrice: 10,
			totals: 10,
			task: "Need to Order",
			service: "Embroidery",
		}
	);

	Carts.remove({});
});


Meteor.publish("services", function () {
  return Services.find({});
});

Meteor.publish("tasks", function () {
  return Tasks.find({});
});

Meteor.publish("orders", function () {
	return Orders.find({});
});

Meteor.publish("carts", function () {
	return Carts.find({});
});

Meteor.publish("inventory", function () {
	return Inventory.find({});
});

Meteor.publish("users", function(){
	var user = Meteor.users.findOne(this.userId);
	if(user && user.profile.role === "sales"){
		return Meteor.users.find();
	}else{
		return null;
	}
});