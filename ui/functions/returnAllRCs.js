exports = function(payload) {
  const collection = context.services.get("mongodb-atlas").db("project_malta").collection("rc_collection");
  
  const searchTerm = payload.query.searchTerm;
  const sort = {
    field: payload.query.field,
    direction: parseInt(payload.query.direction)
  };
  
  if (searchTerm == undefined || searchTerm == "") {
    return collection.aggregate([{$sort: {[sort['field']]: sort['direction']}}]).toArray();
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
