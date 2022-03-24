exports = function(payload) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("rc_collection");
  
  	let arg = payload.query.arg;

  	return collection.aggregate(
  	  [{$project: {
        _id: 0
      }}]).toArray();
};
