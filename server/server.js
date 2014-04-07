Meteor.startup(function () {

	var username = "sales439";
	Accounts.createUser({
		username: username,
		password: "asdf",
		profile: {
			name: "GC Sales",
			role: "sales"
		}
	});

	var username2 = "staff439";
	Accounts.createUser({
		username: username2,
		password: "asdf",
		profile: {
			name: "GC Staff",
			role: "staff"
		}
	});

	var username3 = "user439";
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

	Tasks.remove({});
	Tasks.insert(
		{
			tags:[ "Need to Order", "Embroidery"],
			date: "01/01/2014",
			invoice: "123",
			user_id: "2345678901",
			name: "GC Sales",
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
			service: "Embroidery"
		}
	);
	// Tasks.insert(
	// 	{
	// 		tags:[ "Need to Order", "Screen Printing"],
	// 		date: "2014/01/02",
	// 		invoice: "234",
	// 		user_id: "3456789012",
	// 		name: "dandify",
	// 		phone: "234",
	// 		total: 20,
	// 		task: "Need to Order",
	// 		service: "Screen Printing"
	// 	}
	// );
	// Tasks.insert(
	// 	{
	// 		tags:[ "Ordered", "Promotional"],
	// 		order_id: "3456789012",
	// 		date: "2014/01/03",
	// 		invoice: "345",
	// 		user_id: "4567890123",
	// 		name: "heydandi",
	// 		phone: "345",
	// 		task: "Ordered",
	// 		service: "Promotional"
	// 	}
	// );
	// Tasks.insert(
	// 	{
	// 		tags:[ "Embroidering", "Business Cards"],
	// 		order_id: "4567890123",
	// 		date: "2014/01/02",
	// 		invoice: "456",
	// 		user_id: "5678901234",
	// 		name: "Rad Apdal",
	// 		phone: "456",
	// 		task: "Embroidering",
	// 		service: "Business Cards"
	// 	}
	// );
	// Tasks.insert(
	// 	{
	// 		tags:[ "Printing", "Embroidery"],
	// 		order_id: "5678901234",
	// 		date: "2014/01/02",
	// 		invoice: "567",
	// 		user_id: "6789012345",
	// 		name: "dandify",
	// 		phone: "567",
	// 		task: "Printing",
	// 		service: "Embroidery"
	// 	}
	// );
	
	Orders.remove({});
	// Orders.insert({
	// 	{
	// 		"user_id": Meteor.userId();
	// 		"qty": 7,
	// 		"itemNum": 123,
	// 		"desc": "tshirt",
	// 		"color": "red",
	// 		"s": 1,
	// 		"m": 1,
	// 		"l": 1,
	// 		"xl": 1,
	// 		"2x": 1,
	// 		"3x": 1,
	// 		"other": 1,
	// 		"unitPrice": 10.00,
	// 		"totals": 70.00
	// 	}
	// });
});

// Meteor.publish("users", function () {
// 	if(this.userId){
// 		return Meteor.users.find({_id: this.userId});
// 	}else{
// 		this.ready();
// 	}
// });

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