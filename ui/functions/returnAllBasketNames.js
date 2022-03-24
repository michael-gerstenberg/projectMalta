exports = function(payload) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("basket");
  
  	return collection.find({},{ name: 1, _id:0} ).toArray();
};
