/*
 * STAFF
 */

Template.staff.rendered = function () {
	var user = Meteor.user();
	if(user == null || user.profile.role != "staff"){
		Router.go("/");
	}else{
		if(!Session.get("getMenu")){
			Session.set("getMenu", "Job Order");
		}
		Router.go("/staff");
	}

	// $('.inventory_box').popover({
	// 	placement: 'bottom',
	// 	html: 'true',
	// 	content: '<div class="input-group"><input id="inventory_add_val" type="text" class="form-control" placeholder="Add"><span class="input-group-btn"><button id="inventory_add" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-plus"></span></button></span></div>'
	// });

	// $('.inventory_box').on('click', function (e) {
	// 	$('.inventory_box').not(this).popover('hide');
	// });
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

		var id = $(event.currentTarget).find('.task_id').val();
		Session.set("target_id", id);
	},

	'click .inventory_box': function (event) {
		var id = parseInt($(event.currentTarget).find('span').text());
		Session.set("target_itemNum", id);
	},

	// 'click #inventory_add': function (event) {
	// 	var add_val = parseInt($('#inventory_add_val').val());
	// 	if(Session.get("target_itemNum")){
	// 		var findTarget = Inventory.findOne({itemNum: Session.get("target_itemNum")});
	// 		Inventory.update(
	// 			{
	// 				_id: findTarget._id
	// 			},
	// 			{
	// 				$inc: {qty: add_val}
	// 			}
	// 		);
	// 	}
	// },
	
	'click .next_purchase': function (event) {
		var purchase_id = $(event.currentTarget).parent().closest('li').find('.purchase_id').text();
		var find_purchase = Purchase.findOne({_id:purchase_id});
		
		var new_status = Purchase_process.findOne({index:find_purchase.index+1}).process;

		Meteor.call('next_purchase', purchase_id, find_purchase.itemNum, new_status, find_purchase.index+1, find_purchase.status, find_purchase.qty, find_purchase.color);
	},

	'click .next_order': function (event) {
		var task_id = $(event.currentTarget).parent().closest('li').find('.order_task_id').text();
		var find_task = Tasks.findOne({_id:task_id});

		var check_inventory = Inventory.findOne({itemNum:find_task.itemNum})
		if(find_task.task == "Job Order"){
			Inventory.update(
				{
					_id:check_inventory._id
				},
				{
					$inc: {
						qty: -find_task.qty
					},
				}
			);
		}
		
		if(find_task.task == "Preparing"){
			if(find_task.service == "Embroidery"){
				var new_status = "Embroidering";
			}else{
				var new_status = "Printing";
			}
		}else{
			var new_status = Order_process.findOne({index:find_task.index+1}).process;
		}

		Tasks.update(
			{
				_id: find_task._id,
			},
			{
				$set: {
					tags:[new_status, find_task.service],
					task: new_status,
					index: find_task.index+1,
					service: find_task.service,
				}
			}
		);
	}
});

/* --- */

Template.content_staff.all = function () {
	if(Session.get("getMenu") == "All"){
		return true;
	}
	return false;
};

Template.content_staff.job_order = function () {
	if(Session.get("getMenu") == "Job Order"){
		return true;
	}
	return false;
};

Template.content_staff.preparing = function () {
	if(Session.get("getMenu") == "Preparing"){
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

Template.content_staff.completed = function () {
	if(Session.get("getMenu") == "Completed"){
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

Template.content_staff.delivered = function () {
	if(Session.get("getMenu") == "Delivered"){
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

Template.menu_staff.job_order= function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["Job Order"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.preparing = function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["Preparing"]}}).fetch();
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

Template.menu_staff.completed = function () {
	var total = 0;
	var task = Tasks.find({tags:{$all:["Completed"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.need_to_order = function () {
	var total = 0;
	var task = Purchase.find({tags:{$all:["Need to Order"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.ordered = function () {
	var total = 0;
	var task = Purchase.find({tags:{$all:["Ordered"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.menu_staff.delivered = function () {
	var total = 0;
	var task = Purchase.find({tags:{$all:["Delivered"]}}).fetch();
	total = _.size(task);
	return total;
};

Template.content_staff.all_tasks = function () {
	return Tasks.find({}, {sort: {date: -1}});
};

Template.content_staff.job_order_tasks = function () {
	Meteor.call('update_available', "Job Order");
	return Tasks.find({tags:{$all:["Job Order"]}}, {sort: {date: -1}});
};

Template.content_staff.preparing_tasks = function () {
	return Tasks.find({tags:{$all:["Preparing"]}}, {sort: {date: -1}});
};

Template.content_staff.embroidering_tasks = function () {
	return Tasks.find({tags:{$all:["Embroidering"]}}, {sort: {date: -1}});
};

Template.content_staff.printing_tasks = function () {
	return Tasks.find({tags:{$all:["Printing"]}}, {sort: {date: -1}});
};

Template.content_staff.completed_tasks = function () {
	return Tasks.find({tags:{$all:["Completed"]}}, {sort: {date: -1}});
};

Template.content_staff.need_to_order_tasks = function () {
	return Purchase.find({tags:{$all:["Need to Order"]}}, {sort: {date: -1}});
};

Template.content_staff.ordered_tasks = function () {
	return Purchase.find({tags:{$all:["Ordered"]}}, {sort: {date: -1}});
};

Template.content_staff.delivered_tasks = function () {
	return Purchase.find({tags:{$all:["Delivered"]}}, {sort: {date: -1}});
};

Template.content_staff.inventory_items = function () {
	return Inventory.find({});
};

Template.content_staff.order_available = function () {
	return true;
}