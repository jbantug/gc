/*
 * MODALS
 */

Template.target_modal.events({
	'change #target_select': function (event) {
		var select_val = $('#target_select').val();
		var findTarget = Tasks.findOne({invoice:Session.get("target_invoice")});
		var tag = [select_val, findTarget.service];

		if(findTarget.task == "Need to Order"){
			var check_inventory = Inventory.findOne({itemNum:findTarget.itemNum});
			if(check_inventory.qty < findTarget.qty){
				alert("You don't have enough supply.");
			}else{
				Inventory.update(
					{
						_id:check_inventory._id
					},
					{
						$inc: {qty: -findTarget.qty}
					}
				);

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
			}
		}

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
	if(Session.get("target_invoice")){
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