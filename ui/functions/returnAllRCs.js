exports = function(searchTerm, sort) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("rc_collection");

  if (searchTerm == "") {
    return collection.find({}).toArray();
  } else {
  	return collection.aggregate(
      [{$search: {
         index: 'default',
         text: {
          query: searchTerm,
          path: {
           wildcard: '*'
          },
          fuzzy: {
           maxEdits: 2
          }
         }
      }}, {
        $sort: {
          [sort['field']]: sort['direction'] 
        }
      }]).toArray();
  }
};
