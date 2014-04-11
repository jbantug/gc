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

	Order_process.remove({});
	Order_process.insert({
		process: "Job Order",
		index: 0,
	});

	Order_process.insert({
		process: "Preparing",
		index: 1,
	});

	Order_process.insert({
		process: "Embroidering",
		index: 2,
	});

	Order_process.insert({
		process: "Printing",
		index: 2,
	});

	Order_process.insert({
		process: "Completed",
		index: 3,
	});

	Purchase_process.remove({});
	Purchase_process.insert({
		process: "Need to Order",
		index: 0,
	});

	Purchase_process.insert({
		process: "Ordered",
		index: 1,
	});

	Purchase_process.insert({
		process: "Delivered",
		index: 2,
	});

	Inventory.remove({});
	Inventory.insert(
		{
			type: "Garment",
			item: "Shirt",
			qty: 0,
			itemNum: 123,
			colors: [
				{
					color: "Red",
					qty: 0,
				},
				{
					color: "Blue",
					qty: 0,
				},
				{
					color: "Green",
					qty: 0,
				},
			],
			unitPrice: 10 
		}
	);
	Inventory.insert(
		{
			type: "Canvas",
			item: "Tarpaulin",
			qty: 0,
			itemNum: 234,
			colors: [
				{
					color: "Red",
					qty: 0,
				},
				{
					color: "Blue",
					qty: 0,
				},
			],
			unitPrice: 50 
		}
	);
	Inventory.insert(
		{
			type: "Garment",
			item: "Leather",
			qty: 0,
			itemNum: 345,
			colors: [
				{
					color: "Red",
					qty: 0,
				},
			],
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
		deposit: 5,
	});

	Tasks.remove({});
	Tasks.insert(
		{
			tags:["Job Order", "Embroidery"],
			date: "01/01/2014",
			order_id: 1234,
			invoice: "12345678",
			username: "user",
			name: "GC User",
			item: "Shirt",
			itemNum: 123,
			color: "Red",
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
			task: "Job Order",
			index: 0,
			service: "Embroidery",
			available: false,
		}
	);

	Carts.remove({});

	Purchase.remove({});
	Purchase.insert(
		{
			tags: ["Need to Order"],
			status: "Need to Order",
			index: 0,
			item: "Shirt",
			itemNum: 123,
			color: "Red",
			qty: 1,
			s: 1,
			m: 0,
			l: 0,
			xl: 0,
			x2: 0,
			x3: 0,
			other: 0,
			date: "01/01/2014",
		}
	);
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

Meteor.publish("order_process", function () {
	return Order_process.find({});
});

Meteor.publish("purchase_process", function () {
	return Purchase_process.find({});
});

Meteor.publish("purchase", function () {
	return Purchase.find({});
});

/*
Meteor.publish("users", function(){
	var user = Meteor.users.findOne(this.userId);
	if(user && user.profile.role === "sales"){
		return Meteor.users.find();
	}else{
		return null;
	}
});
*/

Meteor.methods({
	next_purchase: function (purchase_id, itemNum, new_status, index, status, qty, color) {

		if(status == "Ordered"){
			var colors = [];
			var check_inventory = Inventory.findOne({itemNum:itemNum});
			check_inventory.colors.forEach(function(c){
				var q = c.qty;
				if(c.color == color){
					q = c.qty + qty;
				}
				colors.push(
					{
						color: c.color,
						qty: q,
					}
				)
			});

			Inventory.update(
				{
					itemNum: itemNum
				},
				{
					$inc: {
						qty: qty,
					},
					$set: {
						colors: colors,
					}
				}
			);
		}

		Purchase.update(
			{
				_id: purchase_id,
			},
			{
				$set: {
					tags: [new_status],
					status: new_status,
					index: index,
				}
			}
		);
	},

	update_available: function (str) {
		var query = Tasks.find({tags:{$all:[str]}}, {sort: {date: -1}});
		query.forEach(function(task){
			var check_qty = Inventory.findOne({itemNum:task.itemNum});
			if(check_qty){
				if(check_qty.qty >= task.qty){
					Tasks.update(
						{
							_id: task._id,
						},
						{
							$set:{
								available: true,
							}
						}
					);
				}
			}
		});
	}
});