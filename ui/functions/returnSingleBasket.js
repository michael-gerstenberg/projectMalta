exports = function(payload) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("basket");
  
  	let arg = payload.query.arg;

  	return collection.findOne({'name':arg},{rc_ids:1,lang:1,_id:0});
};
