from __future__ import print_function

import os.path
import settings

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from pymongo import MongoClient
import math

client = MongoClient(MONGODB_CONNECTION_STRING)
coll = client[DATABASE][COLLECTION]

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/presentations']

# The ID of a sample presentation.
RCS_PER_DOCUMENT = 3

class CreateRCDeck():

    slide_ids = []
    table_ids = []
    requests = []

    def __init__(self):

        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        try:
            self.slides_service = build('slides', 'v1', credentials=creds)


#  DO CHANGE THE AGGREGATION HERE

            pipeline = [
                {
                    '$unwind': {
                        'path': '$rc_ids'
                    }
                }, {
                    '$addFields': {
                        'oid': {
                            '$convert': {
                                'input': '$rc_ids', 
                                'to': 'objectId'
                            }
                        }
                    }
                }, {
                    '$lookup': {
                        'from': 'rc_collection', 
                        'localField': 'oid', 
                        'foreignField': '_id', 
                        'as': 'rc_details'
                    }
                }, {
                    '$project': {
                        'name': 1, 
                        'lang': 1, 
                        'details': {
                            '$first': '$rc_details'
                        }
                    }
                }, {
                    '$project': {
                        'name': 1, 
                        'lang': 1, 
                        'schema_version': '$details.schema_version', 
                        'rc_identifier': '$details.rc_identifier', 
                        'valid': '$details.valid', 
                        'product_name': '$details.product_name', 
                        'rc_extended': '$details.rc_extended', 
                        'sources': '$details.sources', 
                        'comments': '$details.comments', 
                        'tags': '$details.tags', 
                        'ops_dev_sec': '$details.ops_dev_sec'
                    }
                }
            ]

            # self.documents = coll.aggregate(pipeline)

            self.documents = coll.find().limit(6)
            self.document_count = coll.count_documents({})
            self.document_count = 6

        except HttpError as err:
            print(err)

    def create_complete_slidedeck(self):
        self.presentation_id = self.create_presentation()
        self.create_slides()
        self.create_tables()
        self.send_request_to_gcp()
        # print(self.presentation_id)

    def create_presentation(self):
        # return "11LAmqqSlfolu2r69wyTcRjwSRpZSk7rKdKJbLQKhyLc"
        body = {
            "title": "RC Slides"
        }
        presentation = self.slides_service.presentations() \
            .create(body=body).execute()
        presentation_id = presentation.get('presentationId')
        print('Created presentation with ID: {0}'.format(
            presentation_id))

        return presentation_id

    def create_slides(self):
        self.generate_slide_ids()
        for slide_id in self.slide_ids:
            self.create_slide(slide_id)

    def create_slide(self, slide_id):
        self.requests.append(
            {
                'createSlide': {
                    'objectId': slide_id,
                    'insertionIndex': '1',
                    'slideLayoutReference': {
                        'predefinedLayout': 'TITLE_ONLY'
                    }
                }
            }
        )

    def calculate_slide_quantity(self):
        return int(math.ceil(self.document_count/RCS_PER_DOCUMENT))

    def generate_slide_ids(self):
        self.slides_quantity = self.calculate_slide_quantity()
        for i in range(self.slides_quantity):
            self.slide_ids.append('slidenr' + str(i))

    def create_tables(self):
        for slide_id in self.slide_ids:
            self.create_table(slide_id)
        self.fill_tables()

    def create_table(self, slide_id):
        table_id = slide_id.replace("slidenr", "tablenr")
        self.table_ids.append(table_id)
        self.requests.append(
            {
                "createTable": {
                        "objectId": table_id,
                        "elementProperties": {
                        "pageObjectId": slide_id,
                    },
                    "rows": RCS_PER_DOCUMENT+1,
                    "columns": 3
                }
            })
        self.requests.append({
                "insertText": {
                    "objectId": table_id,
                    "cellLocation": {
                    "rowIndex": 0,
                    "columnIndex": 0
                    },
                    "text": "RC",
                    "insertionIndex": 0
                }
            })
        self.requests.append({
                "insertText": {
                    "objectId": table_id,
                    "cellLocation": {
                    "rowIndex": 0,
                    "columnIndex": 1
                    },
                    "text": "How does MongoDB help?",
                    "insertionIndex": 0
                }
            })
        self.requests.append({
                "insertText": {
                    "objectId": table_id,
                    "cellLocation": {
                    "rowIndex": 0,
                    "columnIndex": 2
                    },
                    "text": "Sources",
                    "insertionIndex": 0
                }
            })
        self.requests.append({
                "updateTableCellProperties": {
                    "objectId": table_id,
                    "tableRange": {
                    "location": {
                        "rowIndex": 0,
                        "columnIndex": 0
                    },
                    "rowSpan": 1,
                    "columnSpan": 3
                    },
                    "tableCellProperties": {
                    "tableCellBackgroundFill": {
                        "solidFill": {
                        "color": {
                            "rgbColor": {
                            "red": 0.0,
                            "green": 0.0,
                            "blue": 0.9
                            }
                        }
                        }
                    }
                    },
                    "fields": "tableCellBackgroundFill.solidFill.color"
                }
            }
        )

    def fill_tables(self):

        table_counter = 0
        rc_per_table_counter = 1

        for document in self.documents:
            self.requests.append({
                    "insertText": {
                        "objectId": self.table_ids[table_counter],
                        "cellLocation": {
                            "rowIndex": rc_per_table_counter,
                            "columnIndex": 0
                        },
                        "text": document["rc_extended"]["en"]["rc_title"],
                        "insertionIndex": 0
                    }
                })
            self.requests.append({
                    "insertText": {
                        "objectId": self.table_ids[table_counter],
                        "cellLocation": {
                            "rowIndex": rc_per_table_counter,
                            "columnIndex": 1
                        },
                        "text": document["rc_extended"]["en"]["description"],
                        "insertionIndex": 0
                    }
                })


            self.requests.append({
                    "insertText": {
                        "objectId": self.table_ids[table_counter],
                        "cellLocation": {
                            "rowIndex": rc_per_table_counter,
                            "columnIndex": 2
                        },
                        "text": self.return_sources(document["sources"]),
                        "insertionIndex": 0
                    }
                })

            rc_per_table_counter +=1
            if rc_per_table_counter > RCS_PER_DOCUMENT:
                table_counter += 1
                rc_per_table_counter = 1

    def return_sources(self, sources):
        sources_sum = ""
        for source in sources:
            sources_sum += source["title"] + ' (' + source["link"] + ')'
        return sources_sum

    def send_request_to_gcp(self):
        body = {
            'requests': self.requests
        }
        response = self.slides_service.presentations() \
                    .batchUpdate(presentationId=self.presentation_id, body=body).execute()
        create_slide_response = response.get('replies')[0].get('batchUpdate')
            
if __name__ == '__main__':
    presentation = CreateRCDeck()
    presentation.create_complete_slidedeck()
