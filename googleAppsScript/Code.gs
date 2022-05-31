const templateId = "GSLIDE_TEMPLATE_ID";
const postTitle = "TITLE";
const SLIDES = {TITLE: 0, JAMBOARD: 1, DEV: 2, OPS: 3, SEC: 4};
const RC_COLUMNS = {TITLE: 0, WHYANYTHING: 1, WHYMONGODB: 2}



function createSlidedeckFromTemplate() { 
  var template = DriveApp.getFileById(templateId);
  var userDriveFolder = DriveApp.getRootFolder();
  var newDeckFile = template.makeCopy(postTitle, userDriveFolder);
  return newDeckFile;
}

function applyRCsToSlide(slide, rcs) {
  table = slide.getTables()[0];
  row = table.getRow(1);

  var cnt = 0
  rcs.forEach(rc => {
    var r = null;
    if (cnt == 0) {
      r = row;

    } else {
      r = table.appendRow();
    }
    r.getCell(RC_COLUMNS.TITLE).getText().setText(rc.details.rc_title);
    r.getCell(RC_COLUMNS.WHYMONGODB).getText().setText(rc.details.description);

    cnt++;
  })
  
}

function createSlides(slidefiles, rcs) {
  var presentation = SlidesApp.openById(slidefiles.getId());
  var slides = presentation.getSlides();

  const devRcs = rcs.filter(rc => rc.category == "dev");
  applyRCsToSlide(slides[SLIDES.DEV], devRcs);

  const opsRcs = rcs.filter(rc => rc.category == "ops");
  applyRCsToSlide(slides[SLIDES.OPS], opsRcs);  

  const secRcs = rcs.filter(rc => rc.category == "sec");
  applyRCsToSlide(slides[SLIDES.SEC], secRcs);
}

function preparePayload(payload) {
  payload['rcs'].forEach(rc => {
    rc['details'] = rc['rc_extended'][payload.lang];
    delete rc['rc_extended'];
  });

  return payload;
}


function doGet(e) {

  const parameters = e.parameters;
  const name = parameters['name'];
  const lang = parameters['lang'];

  const options = {
    'method' : 'get',
    'contentType': 'application/json',
  };
  const response = UrlFetchApp.fetch(`BASKETENDPOINT/?name=${name}&lang=${lang}`, options);
  text = response.getContentText();
  request = JSON.parse(text);

  request = preparePayload(request)
  newFile = createSlidedeckFromTemplate();

  var htmlpage = `<html><head><meta http-equiv="refresh" content="1; URL=${newFile.getUrl()}" /></head><body><center>Redirect to Slide in a sec.</center></body></html>`
  createSlides(newFile, request.rcs);
  
  return HtmlService.createHtmlOutput(htmlpage);
}





