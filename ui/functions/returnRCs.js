exports = function(payload) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("rc_collection");
  
  	let arg = payload.query.arg;

  	return collection.aggregate(

[{$search: {
 index: 'default',
 text: {
  query: arg,
  path: {
   wildcard: '*'
  },
  fuzzy: {
   maxEdits: 2
  }
 }
}}]
      
      ).toArray();
};
