function cleanText(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ") // replace named nbsp
    .replace(/\u00A0/g, " "); // replace unicode nbsp
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;") // escape ampersand
    .replace(/"/g, "&quot;") // escape double quote
    .replace(/</g, "&lt;") // escape less than
    .replace(/>/g, "&gt;"); // escape greater than
}

function unwrapKnownInlineTags(html) {
  return html
    .replace(/<\/?span\b[^>]*>/gi, "") // remove span tags but keep content
    .replace(/&nbsp;/gi, " ") // remove named nbsp
    .replace(/\u00A0/g, " "); // remove unicode nbsp
}

function removeUnwantedAttributes(html) {
  return html
    .replace(/\s+id="[^"]*"/gi, "") // remove id attributes
    .replace(/\s+rule="[^"]*"/gi, "") // remove rule attributes
    .replace(/\s+num="[^"]*"/gi, "") // remove num attributes
    .replace(/\s+orgsrc="[^"]*"/gi, ""); // remove orgsrc attributes
}

function normalizeHtmlMarkup(html) {
  return html
    .replace(/<html\s*\/>/gi, "") // remove self closing html tags
    .replace(/<\/?html\b[^>]*>/gi, "") // remove html wrapper tags
    .replace(/<\/?body\b[^>]*>/gi, "") // remove body wrapper tags
    .replace(/<\/?document\b[^>]*>/gi, "") // remove document wrapper tags
    .replace(/<\/?metadata\b[^>]*>/gi, "") // remove metadata wrapper tags
    .replace(/\n\s*\n\s*\n/g, "\n\n"); // reduce large empty gaps
}

function convertUrlTagsToAnchors(html) {
  return String(html || "").replace(
    /<url\b[^>]*\blink="([^"]*)"[^>]*>([\s\S]*?)<\/url>/gi, // find <url link="...">text</url>
    (match, linkValue, linkText) => {
      const safeHref = String(linkValue || "").trim(); // get clean href value
      const safeText = String(linkText || "").trim(); // get clean anchor text

      return `<a href="${safeHref}">${safeText}</a>`; // replace url tag with anchor tag
    }
  );
}

module.exports = {
  cleanText, // export text cleaner
  escapeAttr, // export attribute escape helper
  unwrapKnownInlineTags, // export wrapper remover
  removeUnwantedAttributes, // export attribute remover
  normalizeHtmlMarkup, // export markup normalizer
  convertUrlTagsToAnchors // export url-to-anchor converter
};