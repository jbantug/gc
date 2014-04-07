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
		if(!Session.get("line_qty")){
			Session.set("line_qty", 0);
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
	
	'click #add_order': function (event) {

		var qty = $('#qty').text();
		var itemNum = $('#itemNum').val();
		var desc = $('#desc').text();
		var color = $('#color').text();
		var s = $('#s').value;
		var m = $('#m').value;
		var l = $('#l').value;
		var xl = $('#xl').value;
		var x2 = $('#x2').value;
		var x3 = $('#x3').value;
		var other = $('#other').value;
		var unitPrice = $('#unitPrice').text();
		var totals = $('#totals').text();
		// var totals = qty*unitPrice;
		// totals = totals.toFixed(2);

		// if(qty!="" && itemNum!="" && desc!="" && color!="" && s!="" && m!="" && l!="" && xl!="" && x2!="" && x3!="" && other!="" && unitPrice!="" && totals!=""){
			Carts.insert(
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
		// }else{
		// 	alert("Please complete the order form.");
		// }
	},

	'keydown #search_order': function (event) {
		if((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106) || event.keyCode == 8 || event.keyCode == 190 || event.keyCode == 110){
			setTimeout(function(){
				Session.set("find_order", parseInt($('#search_order').val()));
			}, 1);
		}
	},

	'keydown #input-row input': function (event, template) {
		if((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106) || event.keyCode == 8 || event.keyCode == 190 || event.keyCode == 110){
			Session.set("line_qty", 0);
			setTimeout(function(){
				$('#input-row td').each(function(index){
					var line_qty = parseInt(Session.get("line_qty"));
					line_qty += parseInt($(this).find('input').val());
					Session.set("line_qty", line_qty);
				});
			}, 1);
		}
	},

	'keydown #adds1_val': function (event, template) {
		if((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106) || event.keyCode == 8 || event.keyCode == 190 || event.keyCode == 110){
			setTimeout(function(){
				var grand_total = parseFloat(template.find('#adds2_val').value);
				grand_total += parseFloat(event.target.value);
				Session.set("grand_total", grand_total);
			}, 1);
		}else{
			$('#adds1_val').val("0");
			$('#adds2_val').val("0");
			Session.set("grand_total", 0);
			alert("Not a number");
		}
	},

	'keydown #adds2_val': function (event, template) {
		if((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106) || event.keyCode == 8 || event.keyCode == 190 || event.keyCode == 110){
			setTimeout(function(){
				var grand_total = parseFloat(template.find('#adds1_val').value);
				grand_total += parseFloat(event.target.value);
				Session.set("grand_total", grand_total);
			}, 1);
		}else{
			$('#adds1_val').val("0");
			$('#adds2_val').val("0");
			Session.set("grand_total", 0);
			alert("Not a number");
		}
	},

	'click #content-footer-submit': function (event) {
		data = {};

		$.each($('#wrap').serializeArray(), function(){
			data[this.name] = this.value;
		});


		var gen_order_id = "";
		var possible = "0123456789";
		for( var i=0; i < 4; i++ )
	        gen_order_id += possible.charAt(Math.floor(Math.random() * possible.length));

		Orders.insert({
			date: $('#dateToday u').text(),
			order_id: parseInt(gen_order_id),
			invoice: data['invoice'],
			user_id: Meteor.userId(),
			name: data['user_name'],
			grand_total: parseFloat($('#grand_total').val()),
			service: data['service'],
			status: "Waiting",
		});

		var carts = Carts.find({user_id: Meteor.userId()});
		carts.forEach(function(cart){
			var task_status = "Ordered";
			var check_inventory = Inventory.findOne({itemNum:cart.itemNum});
			if(check_inventory.qty < cart.qty){
				task_status = "Need to Order";
			}else{
				Inventory.update(
					{
						_id:check_inventory._id
					},
					{
						$inc: {qty: -cart.qty}
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
					itemNum: cart.itemNum,
					item: cart.desc,
					qty: cart.qty,
					s: cart.s,
					m: cart.m,
					l: cart.l,
					xl: cart.xl,
					x2: cart.x2,
					x3: cart.x3,
					other: cart.other,
					unitPrice: cart.unitPrice,
					totals: cart.totals,
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

			Carts.remove({_id: cart._id});

			Session.set("grand_total", 0);
			Session.set("line_qty", 0);
			Session.set("itemNum", "Select Item");


			$('#content-title input').val("");
			$('#content-table tbody input').val("0");
			$('.content-footer-adds div input').val("0");
			$('#itemNum').val("Select Item");
		});


		event.preventDefault();
		alert("Order Added!\nOrder ID:"+gen_order_id);
	},

	'change #itemNum': function (event) {
		Session.set("itemNum", $('#itemNum').val());
	},

	'mouseenter .inventory-box': function (event) {

	},
});

/* --- */

Template.content_sales.grand_total = function () {
	var grand_total = 0;

	var carts = Carts.find({user_id: Meteor.userId()});
	carts.forEach(function(cart){
		grand_total += parseFloat(cart.totals);
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

Template.content_sales.carts = function () {
	return Carts.find({user_id: Meteor.userId()});
};

Template.menu_sales.checkUser = function () {
	if(Meteor.user() != null){
		if(Meteor.user().profile.role == "user"){
			return true;
		}
	}
	return false;
};

Template.content_sales.items = function () {
	return Inventory.find({});
};

Template.content_sales.selectItem = function () {
	return Inventory.findOne({itemNum:parseInt(Session.get('itemNum'))});
};

Template.menu_sales.user_orders_count = function () {
	return _.size(Orders.find({user_id:Meteor.userId()}).fetch());
};

Template.content_sales.all_user_orders = function () {
	var status = "Waiting";
	var find_orders =  Orders.find({user_id:Meteor.userId()}).fetch();
	$.each(find_orders, function(i, el){
		var find_tasks = Tasks.find({user_id:Meteor.userId(),invoice:el.invoice}).fetch();
		$.each(find_tasks, function(i, el){
			if(el.task == "Ordered"){
				status = "Starting";
			}else if(el.task != "Need to Order"){
				status = el.task;
			}
		});

		Orders.update(
			{
				_id: el._id,
			},
			{
				$set: {status: status}
			}
		);
	});



	if(Session.get("find_order")){
		if(Session.get("find_order") == ""){
			return Orders.find({user_id:Meteor.userId()});
		}
		return Orders.find({user_id:Meteor.userId(), order_id:Session.get("find_order")});
	}
	return Orders.find({user_id:Meteor.userId()});
};

Template.content_sales.findItem = function () {
	return Inventory.findOne({itemNum:parseInt(Session.get("itemNum"))});
};

Template.content_sales.line_qty = function () {
	return Session.get("line_qty");
};

Template.content_sales.line_total = function () {
	if(Session.get("itemNum")){
		if(Session.get("itemNum") != "Select Item"){
			var find = Inventory.findOne({itemNum:parseInt(Session.get("itemNum"))});
			var line_total = find.unitPrice * parseInt(Session.get("line_qty"));
			return line_total;
		}
	}
};

Template.content_sales.gen_invoice = function () {
	var gen_invoice = "";
	var possible = "0123456789";
	for( var i=0; i < 9; i++ )
        gen_invoice += possible.charAt(Math.floor(Math.random() * possible.length));

	return gen_invoice;
};