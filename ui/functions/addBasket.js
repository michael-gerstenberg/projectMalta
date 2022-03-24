exports = function(payload) {
  
  let arg = payload.query.arg;

  const collection = context.services.get("mongodb-atlas").db("project_malta").collection("basket");
  const query = { name: arg.name };
  const update = { $set: arg};
  const options = { upsert: true };

  return collection.updateOne(query, update, options);
};
