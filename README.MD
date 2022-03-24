# Project Malta

__Short Description:__ A tool to easily build your RC summary slides by querying MongoDB Atlas Full Text Search capabilities.

__SA Maintainer__: [Michael Gerstenberg](mailto:michael.gerstenberg@mongodb.com), [Timo Lackmann](mailto:timo.lackmann@mongodb.com), [Philipp Weyer](mailto:philipp.weyer@mongodb.com), [Philipp Waffler](mailto:philipp.waffler@mongodb.com) <br/>

---
## Description
- RCs are stored in an M10 in MongoDB Atlas
- They are accessed via a Realm hosted Web App
- Via an API hosted on Realm the RCs are forwarded to the Google Docs API
- There they are processed into a suitable slide format

---
## Raw Data in MongoDB
The following provides a template of how RCs are stored in MongoDB:
```JSON
{
    "schema_version": 1,
    "rc_identifier": "",
    "valid": {
        "atlas": true,
        "ea": true,
        "community": true
    },
    "product_name": "",
    "rc_extended": {
        "en": {
            "rc_title": "",
            "description": ""
        },
        "de": {
            "rc_title": "",
            "description": ""
        }
    },
    "sources": [{
        "title": "",
        "link": ""
    }, {
        "title": "",
        "link": ""
    }],
    "comments": "",
    "tags": [],
    "ops_dev_sec": ""
}
```
* **rc_identifier**: A unique ID for internal purposes, is comprised out of the official POV proof exercise ID: https://github.com/10gen/pov-proof-exercises/ In case no such ID exists (as the RC itself is not listed in the aforementioned repository) a new MXX id is chosen.
* **valid**: Indicates for which main pillars of the MongoDB value propisition this RC is valid for.
* **product_name**: Indication of which product (more detailed than Atlas, EA, ...) this RC is valid for
* **rc_extended.rc_title**: Contains the short description of the RC from the POV proof exercises: https://github.com/10gen/pov-proof-exercises/
* **rc_extended.description**: Contains the long version of the description
* **sources**: Array, that contains all relevant references that are linked towards the desired RC
* **ops_dev_sec**: Defines which major RC category the RC is going to be listed in within the slides generated

## Next section
