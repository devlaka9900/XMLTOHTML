const { firstTagText, countTag, buildHtmlFromXml, getProviderValue } = require("../utils/xmlHelpers"); // import xml helper functions

function analyzeXml(xml) {
  const contentTitle = firstTagText(xml, "h1"); // extract first h1 text
  const urlValue = firstTagText(xml, "url-link"); // extract first url-link text
  const issuedate = firstTagText(xml, "issue-date") || ""; // extract issue date

  const providerValue = getProviderValue(xml); // resolve provider label

  let totalH = 0; // keep total heading count
  for (let i = 1; i <= 10; i++) {
    totalH += countTag(xml, `h${i}`); // count h1 to h10 tags
  }

  const totalLinks = countTag(xml, "url"); // count url tags
  const totalImages = countTag(xml, "img"); // count img tags
  const totalFootnotes = countTag(xml, "footnote"); // count footnote tags

  return {
    contentTitle, // return content title
    urlValue, // return url value
    issuedate, // return issue date
    providerValue, // return provider value
    totalH, // return heading count
    totalLinks, // return link count
    totalImages, // return image count
    totalFootnotes // return footnote count
  };
}

function processXml(xml) {
  const analysis = analyzeXml(xml); // analyze xml for preview data
  const htmlContent = buildHtmlFromXml(xml); // build final html from xml

  return {
    ...analysis, // include all analysis values
    htmlContent // include final generated html
  };
}

module.exports = {
  processXml // export main xml processor
};