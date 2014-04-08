/*
 * MODALS
 */

Template.target_modal.events({
	'click .highlight': function (event) {
		event.preventDefault();
		return false;
	},

	'change #target_select': function (event) {
		var select_val = $('#target_select').val();

		if(Session.get("target_id")){
			var findTarget = Tasks.findOne({_id:Session.get("target_id")});
		}else{
			var findTarget = Tasks.findOne({invoice:Session.get("target_invoice")});
		}

		var tag = [select_val, findTarget.service];

		if(findTarget.task == "Need to Order"){
			var check_inventory = Inventory.findOne({itemNum:findTarget.itemNum});
			if(check_inventory.qty < findTarget.qty){
				alert("You don't have enough supply.");
				return false;
			}else{
				Inventory.update(
					{
						_id:check_inventory._id
					},
					{
						$inc: {qty: -findTarget.qty}
					}
				);
			}
		}

		Tasks.update(
			{
				_id:findTarget._id
			},
			{
				$set: {
					task: select_val,
					tags: tag
				}
			}
		);
	},
});

Template.inventory_modal.events({
	'click #add_inventory': function (event) {
		Inventory.insert(
			{
				type: $('#inv_type').val(),
				item: $('#inv_item').val(),
				qty: parseInt($('#inv_qty').val()),
				itemNum: parseInt($('#inv_itemNum').val()),
				color: $('#inv_color').val(),
				unitPrice: parseFloat($('#inv_unitPrice').val()), 
			}
		);
	},
});

Template.target_modal.target_task = function () {
	if(Session.get("target_id")){
		return Tasks.findOne({_id:Session.get("target_id")});
	}
	else if(Session.get("target_invoice")){
		if(Meteor.user().profile.role == "user"){
			return Orders.findOne({invoice:Session.get("target_invoice"), username:Meteor.user().username});
		}
		return Tasks.findOne({invoice:Session.get("target_invoice")});
	}
};

Template.target_modal.check_task = function () {
	if(Session.get("target_invoice")){
		var find =  Tasks.findOne({invoice:Session.get("target_invoice")});
		if(find.task == "Need to Order"){
			return false;
		}
	}	
	return true;
}

Template.target_modal.rendered = function () {
	if(Session.get("target_invoice")){
		var findTarget = Tasks.findOne({invoice:Session.get("target_invoice")});
		var status = findTarget.task;
		$('#target_select').val(status);
	}
};


Template.target_modal.checkUser = function () {
	if(Meteor.user() != null){
		if(Meteor.user().profile.role == "user"){
			return true;
		}
	}
	return false;
};

Template.target_modal.order_task = function () {
	return Tasks.find({username:Meteor.user().username, invoice:Session.get("target_invoice")});
};