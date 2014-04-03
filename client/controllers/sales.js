/*
 * SALES
 */

Template.sales.rendered = function () {
	var user = Meteor.user();
	if(user == null){
		Router.go("/");
	}else if(user.profile.role == "staff"){
		Meteor.logout(function(cb){
			Router.go("/");
		});
	}else if(user.profile.role == "sales" || user.profile.role == "user"){
		if(!Session.get("grand_total")){
			Session.set("grand_total", 0);
		}
		Router.go("/sales");
	}
};

Template.menu_sales.services = function () {
	return Services.find({});
};

/* EVENTS */

Template.menu_sales.events({
	'click .highlight': function (event) {
		Session.set("getMenu", event.currentTarget.firstElementChild.innerHTML);
		$('.menu-item').removeClass("menu-selected");
		$(event.currentTarget.firstElementChild).addClass("menu-selected");
	},

	'click .logout': function (event) {
		Session.keys = {};
		Meteor.logout(function(cb){
			Router.go("/");
		});
	}
});

Template.content_sales.events({
	'click .highlight': function (event) {
		var id = $(event.currentTarget).find('.task_invoice').text();
		Session.set("target_invoice", id);
	},
	
	'keydown tbody input': function (event) {
		if(event.keyCode == 13){

			var qty = document.getElementById("qty").value;
			var itemNum = document.getElementById("itemNum").value;
			var desc = document.getElementById("desc").value;
			var color = document.getElementById("color").value;
			var s = document.getElementById("s").value;
			var m = document.getElementById("m").value;
			var l = document.getElementById("l").value;
			var xl = document.getElementById("xl").value;
			var x2 = document.getElementById("x2").value;
			var x3 = document.getElementById("x3").value;
			var other = document.getElementById("other").value;
			var unitPrice = document.getElementById("unitPrice").value;
			var totals = document.getElementById("totals").value;
			// var totals = qty*unitPrice;
			// totals = totals.toFixed(2);

			if(qty!="" && itemNum!="" && desc!="" && color!="" && s!="" && m!="" && l!="" && xl!="" && x2!="" && x3!="" && other!="" && unitPrice!="" && totals!=""){
				Orders.insert(
					{
						user_id: Meteor.userId(),
						qty: parseInt(qty),
						itemNum: parseInt(itemNum),
						desc: desc,
						color: color,
						s: s,
						m: m,
						l: l,
						xl: xl,
						x2: x2,
						x3: x3,
						other: other,
						unitPrice: parseFloat(unitPrice),
						totals: parseFloat(totals)
					}
				);
			}else{
				alert("Please complete the table.");
			}

			event.preventDefault();
		}
	},

	'keyup #adds1_val': function (event, template) {
		if((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106) || event.keyCode == 8 || event.keyCode == 190 || event.keyCode == 110){
			var grand_total = parseFloat(template.find('#adds2_val').value);
			grand_total += parseFloat(event.target.value);
			Session.set("grand_total", grand_total);
		}else{
			$('#adds1_val').val("");
			$('#adds2_val').val("");
			Session.set("grand_total", 0);
			alert("Not a number");
		}
	},

	'keyup #adds2_val': function (event, template) {
		if((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106) || event.keyCode == 8 || event.keyCode == 190 || event.keyCode == 110){
			var grand_total = parseFloat(template.find('#adds1_val').value);
			grand_total += parseFloat(event.target.value);
			Session.set("grand_total", grand_total);
		}else{
			$('#adds1_val').val("");
			$('#adds2_val').val("");
			Session.set("grand_total", 0);
			alert("Not a number");
		}
	},

	'click #content-footer-submit': function (event) {
		data = {};

		$.each($('#wrap').serializeArray(), function(){
			data[this.name] = this.value;
		});

		var orders = Orders.find({user_id: Meteor.userId()});
		orders.forEach(function(order){
			var task_status = "Ordered";
			var check_inventory = Inventory.findOne({itemNum:order.itemNum});
			if(check_inventory.qty < order.qty){
				task_status = "Need to Order";
			}else{
				Inventory.update(
					{
						_id:check_inventory._id
					},
					{
						$inc: {qty: -order.qty}
					}
				);
			}

			Tasks.insert(
				{
					tags:[task_status, data['service']],
					date: $('#dateToday u').text(),
					invoice: data['invoice'],
					user_id: Meteor.userId(),
					name: data['user_name'],
					itemNum: order.itemNum,
					item: order.desc,
					qty: order.qty,
					s: order.s,
					m: order.m,
					l: order.l,
					xl: order.xl,
					x2: order.x2,
					x3: order.x3,
					other: order.other,
					unitPrice: order.unitPrice,
					totals: order.totals,
					task: task_status,
					service: data['service']
				}
			);

			var findTarget = Services.findOne({service:data['service']});
			Services.update(
				{
					_id:findTarget._id
				},
				{
					$inc: {value: 1}
				}
			);

			Orders.remove({_id: order._id});

			Session.set("grand_total", 0);

			$('#content-title input').val("");
			$('#content-table tbody input').val("");
			$('.content-footer-adds div input').val("");
		});


		event.preventDefault();
		alert("Order Added!");
	},

	'blur #itemNum': function (event) {
		Session.set("itemNum", $('#itemNum').val());
	},

	'mouseenter .inventory-box': function (event) {

	},
});

/* --- */

Template.content_sales.grand_total = function () {
	var grand_total = 0;

	var orders = Orders.find({user_id: Meteor.userId()});
	orders.forEach(function(order){
		grand_total += parseFloat(order.totals);
	});

	grand_total += parseFloat(Session.get("grand_total"));

	return grand_total;
}
 
Template.content_sales.dateToday = function () {
	var d = new Date();

	var month = d.getMonth()+1;
	var day = d.getDate();

	var output = (month<10 ? '0' : '') + month + '/' +
	    (day<10 ? '0' : '') + day + '/' + d.getFullYear() ;

	return output;
};

Template.content_sales.embroidery = function () {
	if(Session.get("getMenu") == "Embroidery"){
		return true;
	}
	return false;
};

Template.content_sales.screenPrinting = function () {
	if(Session.get("getMenu") == "Screen Printing"){
		return true;
	}
	return false;
};

Template.content_sales.promotional = function () {
	if(Session.get("getMenu") == "Promotional"){
		return true;
	}
	return false;
};

Template.content_sales.business = function () {
	if(Session.get("getMenu") == "Business Cards"){
		return true;
	}
	return false;
};

Template.content_sales.user_orders = function () {
	if(Session.get("getMenu") == "Orders"){
		return true;
	}
	return false;
};

Template.content_sales.orders = function () {
	return Orders.find({user_id: Meteor.userId()});
};

Template.menu_sales.checkUser = function () {
	if(Meteor.user() != null){
		if(Meteor.user().profile.role == "user"){
			return true;
		}
	}
	return false;
};

Template.menu_sales.user_orders_count = function () {
	return _.size(Tasks.find({user_id:Meteor.userId()}).fetch());
};

Template.content_sales.all_user_orders = function () {
	return Tasks.find({user_id:Meteor.userId()});
};

Template.content_sales.findItem = function () {
	return Inventory.findOne({itemNum:parseInt(Session.get("itemNum"))});
};

Template.target_modal.checkUser = function () {
	if(Meteor.user() != null){
		if(Meteor.user().profile.role == "user"){
			return true;
		}
	}
};
