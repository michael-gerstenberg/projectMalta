exports = async function(payload) {
const collection = context.services.get("mongodb-atlas").db("project_malta").collection("basket");
  
  	let arg = payload.query;
    let rcExtendedLang = 'rcs.rc_extended.' + arg.lang;
  	let result = await collection.aggregate([
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
  	  {
  	    '_id': 0,
  	    'name': 1,
  	    'lang': 1,
  	    'rcs': {"$map": {
  	      'input': "$rcs",
  	      'in' : {
  	        'rc_identifier': "$$this.rc_identifier",
  	        'rc_extended': "$$this.rc_extended",
  	        'sources': "$$this.sources",
  	        'category': "$$this.ops_dev_sec"
  	      }
  	    }
  	  }}
  	]).toArray();
  	return result[0];
};
