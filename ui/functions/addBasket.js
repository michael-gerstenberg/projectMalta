exports = async function (request, response) {
  
  let arg = JSON.parse(request.body.text());

  const query = { name: arg.name };
  const update = { $set: arg};
  const options = { upsert: true };

  await context.services
    .get("mongodb-atlas")
    .db("project_malta")
    .collection("basket")
    .updateOne(query, update, options);
  // 3. Configure the response
  response.setBody("Request was successful");
};
