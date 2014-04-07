/*
 * STAFF
 */

Template.staff.rendered = function () {
	var user = Meteor.user();
	if(user == null || user.profile.role != "staff"){
		Router.go("/");
	}else{
		if(!Session.get("getMenu")){
			Session.set("getMenu", "All");
		}
		Router.go("/staff");
	}

	$('.inventory_box').popover({
		placement: 'bottom',
		html: 'true',
		content: '<div class="input-group"><input id="inventory_add_val" type="text" class="form-control" placeholder="Add"><span class="input-group-btn"><button id="inventory_add" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-plus"></span></button></span></div>'
	});

	$('.inventory_box').on('click', function (e) {
		$('.inventory_box').not(this).popover('hide');
	});
};

/* EVENTS */

Template.menu_staff.events({
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

Template.content_staff.events({
	'click .highlight': function (event) {
		var id = $(event.currentTarget).find('.task_invoice').text();
		Session.set("target_invoice", id);
	},

	'click .inventory_box': function () {
		var id = parseInt($(event.currentTarget).find('span').text());
		Session.set("target_itemNum", id);
	},

	'click #inventory_add': function (event) {
		var add_val = parseInt($('#inventory_add_val').val());
		if(Session.get("target_itemNum")){
			var findTarget = Inventory.findOne({itemNum: Session.get("target_itemNum")});
			Inventory.update(
				{
					_id: findTarget._id
				},
				{
					$inc: {qty: add_val}
				}
			);
		}
	},
});

/* --- */

Template.content_staff.all = function () {
	if(Session.get("getMenu") == "All"){
		return true;
	}
	return false;
};

Template.content_staff.need_to_order = function () {
	if(Session.get("getMenu") == "Need to Order"){
		return true;
	}
	return false;
};

Template.content_staff.ordered = function () {
	if(Session.get("getMenu") == "Ordered"){
		return true;
	}
	return false;
};

Template.content_staff.embroidering = function () {
	if(Session.get("getMenu") == "Embroidering"){
		return true;
	}
	return false;
};

Template.content_staff.printing = function () {
	if(Session.get("getMenu") == "Printing"){
		return true;
	}
	return false;
};

Template.content_staff.for_delivery = function () {
	if(Session.get("getMenu") == "For Delivery"){
		return true;
	}
	return false;
};

Template.content_staff.inventory = function () {
	if(Session.get("getMenu") == "Inventory"){
		return true;
	}
	return false;
};


Template.menu_staff.all = function () {
	var total = 0;
	var task = Tasks.find({}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.need_to_order = function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["Need to Order"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.ordered = function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["Ordered"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.embroidering = function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["Embroidering"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.printing = function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["Printing"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.for_delivery = function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["For Delivery"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.content_staff.all_tasks = function () {
	return Tasks.find({}, {sort: {date: -1}});
};

Template.content_staff.need_to_order_tasks = function () {
	return Tasks.find({tags:{$all:["Need to Order"]}}, {sort: {date: -1}});
};

Template.content_staff.ordered_tasks = function () {
	return Tasks.find({tags:{$all:["Ordered"]}}, {sort: {date: -1}});
};

Template.content_staff.embroidering_tasks = function () {
	return Tasks.find({tags:{$all:["Embroidering"]}}, {sort: {date: -1}});
};

Template.content_staff.printing_tasks = function () {
	return Tasks.find({tags:{$all:["Printing"]}}, {sort: {date: -1}});
};

Template.content_staff.for_delivery_tasks = function () {
	return Tasks.find({tags:{$all:["For Delivery"]}}, {sort: {date: -1}});
};

Template.content_staff.inventory_items = function () {
	return Inventory.find({});
};
