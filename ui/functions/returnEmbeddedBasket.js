exports = function(payload) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("basket");
  
  	let arg = JSON.parse(payload.body.text());
    let rcExtendedLang = 'rcs.rc_extended.' + arg.lang;
  	return collection.aggregate([
  	  {'$match': { 'name': arg.name }},
  	  {'$addFields': {
  	    'rcs': {
  	      '$map': {
  	        'input': '$rc_ids',
  	        'as': 'rc_id',
  	        'in': {
  	          '$convert': {
  	            'input': '$$rc_id',
  	            'to': 7
  	          }
  	        }
  	      }
  	    },
  	    'rc_ids': '$$REMOVE'
  	  }},
  	  {'$lookup': {
  	    'from': 'rc_collection',
  	    'localField': 'rcs',
  	    'foreignField': '_id',
  	    'as': 'rcs'
  	  }},
  	  {'$project': {
  	    '_id': 0,
  	    'name': 1,
  	    'lang': 1,
  	    'rcs.rc_identifier': 1,
  	    'rcs.rc_extended': 1,
  	    'rcs.sources': 1,
  	    'rcs.category': '$rcs.ops_dev_sec'
  	  }}
  	])[0];
};
