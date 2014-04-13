/*
 * SALES
 */

Template.sales.rendered = function () {
	var user = Meteor.user();
	if(user == null){
		Router.go("/");
	}else if(user.profile.role == "staff" || user.profile.role == "user"){
		Meteor.logout(function(cb){
			Router.go("/");
		});
	}else if(user.profile.role == "sales"){
		if(!Session.get("grand_total")){
			Session.set("grand_total", 0);
		}
		if(!Session.get("line_qty")){
			Session.set("line_qty", 0);
		}

		if(!Session.get("getMenu")){
			Session.set("getMenu", "Embroidery");
			$(document.getElementById('service-menu').firstElementChild).find('.menu-item').addClass("menu-selected");
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
		delete Session.keys['itemNum'];
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
		var itemNum = $('#itemNum').text();
		var desc = $('#item').val();
		var color = $('#color').val();
		var s = $('#s').val();
		var m = $('#m').val();
		var l = $('#l').val();
		var xl = $('#xl').val();
		var x2 = $('#x2').val();
		var x3 = $('#x3').val();
		var other = $('#other').val();
		var unitPrice = $('#unitPrice').text();
		var totals = $('#totals').text();
		var service = $('#service').val();

		if(parseInt(qty) > 0){
			Carts.insert(
				{
					username: Meteor.user().username,
					qty: parseInt(qty),
					itemNum: parseInt(itemNum),
					desc: desc,
					color: color,
					s: parseInt(s),
					m: parseInt(m),
					l: parseInt(l),
					xl: parseInt(xl),
					x2: parseInt(x2),
					x3: parseInt(x3),
					other: parseInt(other),
					unitPrice: parseFloat(unitPrice),
					totals: parseFloat(totals),
					service: service,
				}
			);
		}

		delete Session.keys['itemNum'];
		$('#item').val("Select Item");
		Session.set("line_qty", 0);
	},

	'click .delete_order': function (event, template) {
		var cart_id = $(event.currentTarget).closest("tr").find(".cart_id").val();
		
		Carts.remove(
			{
				_id: cart_id
			}
		);
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
				$('#input-row td input').each(function(index){
					var line_qty = parseInt(Session.get("line_qty"));
					line_qty += parseInt($(this).val());
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

		if(parseFloat($('#grand_total').val()) <= 0){
			alert("Please add an item.");
			return false;
		}

		if(data['user_name'] == ""){
			alert("Please input a name.");
			return false;
		}

		if(parseFloat(data['deposit']) < (parseFloat($('#grand_total').val())*0.5)){
			alert("A 50% deposit is required.");
			return false;
		}

		var gen_order_id = "";
		var possible = "0123456789";
		for( var i=0; i < 4; i++ )
	        gen_order_id += possible.charAt(Math.floor(Math.random() * possible.length));

		Orders.insert({
			date: $('#dateToday u').text(),
			order_id: parseInt(gen_order_id),
			invoice: data['invoice'],
			username: Meteor.user().username,
			name: data['user_name'],
			grand_total: parseFloat($('#grand_total').val()),
			service: data['service'],
			status: "Waiting",
			deposit: parseFloat(data['deposit']),
		});

		var findTarget = Services.findOne({service:data['service']});
		Services.update(
			{
				_id:findTarget._id
			},
			{
				$inc: {value: 1}
			}
		);

		var carts = Carts.find({username: Meteor.user().username});
		carts.forEach(function(cart){
			var task_status = "Job Order";
			var index = 0;
			var available = true;
			var color_qty = 0;
			var colors = [];
			var check_inventory = Inventory.findOne({itemNum:cart.itemNum});

			check_inventory.colors.forEach(function(color){
				var q = color.qty;
				if(color.color == cart.color){
					q = color.qty - cart.qty;
					if(q < 0){
						q = 0;
					}
					color_qty += color.qty;
				}
				colors.push(
					{
						color: color.color,
						qty: q,
					}
				)
			});

			Tasks.insert(
				{	
					tags:[task_status, data['service']],
					date: $('#dateToday u').text(),
					invoice: data['invoice'],
					order_id: parseInt(gen_order_id),
					username: Meteor.user().username,
					name: data['user_name'],
					itemNum: cart.itemNum,
					item: cart.desc,
					color: cart.color,
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
					index: index,
					service: data['service'],
					available: available,
				}
			);

			var find_purchase = Purchase.findOne({itemNum:cart.itemNum,color:cart.color});

			if(find_purchase && find_purchase.status == "Need to Order"){
				Purchase.update(
					{
						_id: find_purchase._id,
					},
					{
						$inc: {
							qty: cart.qty,
							s: cart.s,
							m: cart.m,
							l: cart.l,
							xl: cart.xl,
							x2: cart.x2,
							x3: cart.x3,
							other: cart.other,
						}
					}
				);
			}else{
				Purchase.insert(
					{
						tags: ["Need to Order"],
						status: "Need to Order",
						index: 0,
						itemNum: cart.itemNum,
						item: cart.desc,
						color: cart.color,
						qty: cart.qty,
						s: cart.s,
						m: cart.m,
						l: cart.l,
						xl: cart.xl,
						x2: cart.x2,
						x3: cart.x3,
						other: cart.other,
						date: $('#dateToday u').text(),
					}
				);
			}

			Carts.remove({_id: cart._id});

			Session.set("grand_total", 0);
			Session.set("line_qty", 0);
			Session.set("itemNum", "Select Item");


			$('#content-title input').val("");
			$('#content-table tbody input').val("0");
			$('.content-footer-adds div .ta-right').val("0");
			$('#item').val("Select Item");
			$('#deposit').val("0");
		});


		event.preventDefault();
		alert("Order Added!\nOrder ID:"+gen_order_id);
	},

	'change #item': function (event) {
		var find_item = Inventory.findOne({item:$('#item').val()});
		if(find_item){
			Session.set("itemNum", find_item.itemNum);
		}else{
			Session.set("itemNum", "");
		}
	},

	'mouseenter .inventory-box': function (event) {

	},
});

/* --- */

Template.content_sales.order_total = function () {
	var grand_total = 0;

	var carts = Carts.find({username: Meteor.user().username});
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

Template.content_sales.sales_orders = function () {
	if(Session.get("getMenu") == "Orders"){
		return true;
	}
	return false;
};

Template.content_sales.sales_sales = function () {
	if(Session.get("getMenu") == "Sales"){
		return true;
	}
	return false;
};

Template.content_sales.sales_receivable = function () {
	if(Session.get("getMenu") == "Account Receivable"){
		return true;
	}
	return false;
};

Template.content_sales.carts = function () {
	return Carts.find({username:Meteor.user().username, service:Session.get("getMenu")});
};

Template.content_sales.items = function () {
	return Inventory.find({});
};

Template.content_sales.selectItem = function () {
	return Inventory.findOne({itemNum:parseInt(Session.get('itemNum'))});
};

Template.menu_sales.sales_orders_count = function () {
	if(Meteor.user()){
		return _.size(Orders.find({username:Meteor.user().username}).fetch());
	}
};

Template.content_sales.all_sales_orders = function () {
	var find_orders =  Orders.find({username:Meteor.user().username}).fetch();
	$.each(find_orders, function(i, el){
		var status = "Not Started";
		var find_tasks = Tasks.find({username:Meteor.user().username, invoice:el.invoice}).fetch();
		$.each(find_tasks, function(i, el){

			if(status == "Completed"){
				status = "Started";
			}else{
				status = "Not Started";
			}

			if(el.task == "Preparing"){
				status = "Started";
				return true;
			}else if(el.task == "Embroidering" || el.task == "Printing"){
				status = el.task;
				return true;
			}else if(el.task == "Completed"){
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
			return Orders.find({username:Meteor.user().username});
		}
		return Orders.find({username:Meteor.user().username, order_id:Session.get("find_order")});
	}
	return Orders.find({username:Meteor.user().username});
};

Template.content_sales.all_sales_sales = function () {
	return Orders.find({});
};

Template.content_sales.all_sales_receivable = function () {
	return Orders.find({});
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

Handlebars.registerHelper("receivable", function(grand_total, deposit) {
  grand_total = parseFloat(grand_total);
  deposit = parseFloat(deposit);

  return grand_total-deposit;
});