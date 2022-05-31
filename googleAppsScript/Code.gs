const templateId = "GSLIDE_TEMPLATE_ID";
const postTitle = "Required Capabilities";
const SLIDES = {TITLE: 0, JAMBOARD: 1, DEV: 2, OPS: 3, SEC: 4};
const RC_COLUMNS = {TITLE: 0, WHYANYTHING: 1, WHYMONGODB: 2};
const TEMPLATE_ROW_ID = 1;


function createSlidedeckFromTemplate(title) { 
  var template = DriveApp.getFileById(templateId);
  var userDriveFolder = DriveApp.getRootFolder();
  var newDeckFile = template.makeCopy(title, userDriveFolder);
  return newDeckFile;
}

function applyRCsToSlide(slide, rcs) {
  const table = slide.getTables()[0];
  const templateRow = table.getRow(TEMPLATE_ROW_ID);

  rcs.forEach(rc => {
    var r = table.appendRow();
    r.getCell(RC_COLUMNS.TITLE).getText().setText(rc.details.rc_title);
    r.getCell(RC_COLUMNS.WHYMONGODB).getText().setText(rc.details.description);
  });

  templateRow.remove();
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

function prepareRCList(payload) {
  payload['rcs'].forEach(rc => {
    rc['details'] = rc['rc_extended'][payload.lang];
    delete rc['rc_extended'];
  });

  return payload;
}


function doGet(e) {

  var name = null;
  var lang = null;
  var title = null;

  if (e) {
    const parameters = e.parameters;
    name = parameters['name'];
    lang = parameters['lang'];
    title = parameters['title'];
  }
  if (!name) name = "abc";
  if (!lang) lang = 'en';
  if (!title) title = postTitle;

  

  const options = {
    'method' : 'get',
    'contentType': 'application/json',
  };
  const response = UrlFetchApp.fetch(`BASKETENDPOINT/?name=${name}&lang=${lang}`, options);
  text = response.getContentText();
  var rcContainer = JSON.parse(text);

  rcContainer = prepareRCList(rcContainer)
  newFile = createSlidedeckFromTemplate(title);

  var htmlpage = `<html><head><meta http-equiv="refresh" content="1; URL=${newFile.getUrl()}" /></head><body><center>Redirect to Slide in a sec.</center></body></html>`
  createSlides(newFile, rcContainer.rcs);
  
  return HtmlService.createHtmlOutput(htmlpage);
}





