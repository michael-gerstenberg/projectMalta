exports = function(payload) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("rc_collection");
  
  	return collection.find({}).toArray();
};
