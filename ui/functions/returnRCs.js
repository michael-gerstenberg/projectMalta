exports = function(payload) {
const collection = 
context.services.get("projectMalta").db("project_malta").collection("rc_collection");
  
  	let arg = payload.query.arg;

  	return collection.aggregate(
  	  [{$project: {
        _id: 0
      }}]).toArray();
};
