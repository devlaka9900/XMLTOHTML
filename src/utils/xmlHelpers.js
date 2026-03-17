const { DOMParser, XMLSerializer } = require("@xmldom/xmldom"); // import xml parser and serializer
const {
  cleanText,
  escapeAttr,
  unwrapKnownInlineTags,
  removeUnwantedAttributes,
  normalizeHtmlMarkup
} = require("./htmlHelpers"); // import html helper functions

function countTag(xml, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>`, "gi"); // build regex for opening tag count
  const matches = xml.match(re); // find all matches
  return matches ? matches.length : 0; // return count or zero
}

function firstTagText(xml, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"); // build regex for first tag text
  const match = xml.match(re); // find first match
  return match ? match[1].trim() : ""; // return text or empty string
}

function getProviderValue(xml) {
  try {
    const levelRuleMatch = xml.match(
      /<title\b[^>]*>[\s\S]*?<\/title>\s*<level\b[^>]*\bnum="(\d+)"/i
    ); // get first level num after title

    if (levelRuleMatch) {
      const num = Number(levelRuleMatch[1]); // convert matched num string to number
      return num === 0 ? "Provider 3 CUBE" : "Other Vendor"; // return provider based on num
    }
  } catch (error) {
    console.error("Error extracting provider value:", error.message); // log extraction errors
  }

  return ""; // fallback empty value
}

function getHeadingLevel(currentNum, firstLevelNum) {
  if (firstLevelNum === 0) {
    return Math.min(currentNum + 1, 6); // if first level is 0 then increase by one
  }

  return Math.min(Math.max(currentNum, 1), 6); // otherwise use same level within h1-h6
}

function stripOuterHeadingTag(markup) {
  const trimmedMarkup = String(markup || "").trim(); // normalize input string

  const match = trimmedMarkup.match(
    /^\s*<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>\s*$/i
  ); // detect one full outer heading wrapper

  if (match) {
    return match[1].trim(); // return only inner content if heading exists
  }

  return trimmedMarkup; // return original markup if no outer heading found
}

function renderNode(node, serializer, footnotes) {
  // handle plain text nodes
  if (node.nodeType === 3) {
    return node.nodeValue || ""; // return text as-is
  }

  // ignore unsupported node types
  if (node.nodeType !== 1) {
    return ""; // skip comments and other unsupported node types
  }

  const tagName = String(node.nodeName || "").toLowerCase(); // normalize current tag name

  // convert custom url tag into html anchor
  if (tagName === "url") {
    const href = escapeAttr(node.getAttribute("link") || ""); // read url link attribute safely
    const anchorText = renderChildren(node, serializer, footnotes).trim(); // render inner content

    return `<a href="${href}">${anchorText}</a>`; // return normal anchor tag
  }

  // convert footnote references into linked superscript anchors
  if (tagName === "footnoteref") {
    const fid = escapeAttr(node.getAttribute("fid") || ""); // read footnote id safely
    const refText = renderChildren(node, serializer, footnotes).trim(); // read reference text

    return `<sup><a href="#${fid}">${refText}</a></sup>`; // return linked footnote reference
  }

  // collect footnote blocks instead of rendering them inline
  if (tagName === "footnote") {
    const footnoteHtml = convertFootnoteNode(node, serializer, footnotes); // build footnote block html

    if (footnoteHtml) {
      footnotes.push(footnoteHtml); // store footnote for end of document
    }

    return ""; // do not render footnote here inline
  }

  // render all child nodes first
  const childContent = renderChildren(node, serializer, footnotes); // render inner child content

  // rebuild the current tag with original attributes
  const attributes = []; // collect attribute strings

  if (node.attributes && node.attributes.length > 0) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i]; // get current attribute
      attributes.push(`${attr.name}="${escapeAttr(attr.value)}"`); // rebuild safe attribute
    }
  }

  const attrString = attributes.length > 0 ? ` ${attributes.join(" ")}` : ""; // join attributes

  return `<${tagName}${attrString}>${childContent}</${tagName}>`; // return rebuilt element
}

function renderChildren(node, serializer, footnotes) {
  let output = ""; // collect rendered children

  for (let i = 0; i < node.childNodes.length; i++) {
    output += renderNode(node.childNodes[i], serializer, footnotes); // render child node one by one
  }

  return output; // return combined rendered content
}

function extractCleanTitleContent(titleNode, serializer, footnotes) {
  const rawTitleContent = renderChildren(titleNode, serializer, footnotes); // render title children
  const cleanTitleContent = stripOuterHeadingTag(rawTitleContent); // remove nested outer heading wrapper

  return cleanTitleContent; // return cleaned title content
}

function convertFootnoteNode(footnoteNode, serializer, footnotes) {
  const id = footnoteNode.getAttribute("id") || ""; // read footnote id
  const inner = renderChildren(footnoteNode, serializer, footnotes); // render footnote content safely

  return `<div class="footnote" id="${escapeAttr(id)}" data-footnote-id="${escapeAttr(id)}">${inner}</div>`; // return final footnote block
}

function convertLevelNode(levelNode, firstLevelNum, serializer, footnotes) {
  let html = ""; // collect html for current level

  const currentNum = Number(levelNode.getAttribute("num") || "1"); // read current level num

  const titleNode = Array.from(levelNode.childNodes).find(
    (node) => node.nodeType === 1 && node.nodeName === "title"
  ); // find direct title child

  if (titleNode) {
    const titleContent = extractCleanTitleContent(titleNode, serializer, footnotes); // get clean title content
    const headingLevel = getHeadingLevel(currentNum, firstLevelNum); // resolve final heading level

    html += `<h${headingLevel}>${titleContent}</h${headingLevel}>\n`; // render final single heading
  }

  const htmlNode = Array.from(levelNode.childNodes).find(
    (node) => node.nodeType === 1 && node.nodeName === "html"
  ); // find direct html child

  if (htmlNode) {
    html += `${renderChildren(htmlNode, serializer, footnotes)}\n`; // render html section content
  }

  for (let i = 0; i < levelNode.childNodes.length; i++) {
    const child = levelNode.childNodes[i]; // get child node

    if (child.nodeType !== 1) {
      continue; // skip non-element nodes
    }

    if (child.nodeName === "level") {
      html += convertLevelNode(child, firstLevelNum, serializer, footnotes); // recursively render nested levels
    }

    if (child.nodeName === "footnote") {
      const footnoteHtml = convertFootnoteNode(child, serializer, footnotes); // build footnote html
      footnotes.push(footnoteHtml); // collect footnote for bottom of document
    }
  }

  return html; // return current level html
}

function buildHtmlFromXml(xml) {
  const parser = new DOMParser(); // create xml parser
  const serializer = new XMLSerializer(); // create serializer
  const xmlDoc = parser.parseFromString(xml, "text/xml"); // parse raw xml string

  const parseErrors = xmlDoc.getElementsByTagName("parsererror"); // check parser errors
  if (parseErrors && parseErrors.length > 0) {
    throw new Error("Invalid XML file."); // stop if xml is invalid
  }

  const documentNode = xmlDoc.getElementsByTagName("document")[0]; // get document root
  if (!documentNode) {
    throw new Error("XML does not contain a <document> root."); // validate document root
  }

  const metadataNode = xmlDoc.getElementsByTagName("metadata")[0]; // get metadata node
  if (metadataNode && metadataNode.parentNode) {
    metadataNode.parentNode.removeChild(metadataNode); // remove full metadata section
  }

  const bodyNode = xmlDoc.getElementsByTagName("body")[0]; // get body node
  if (!bodyNode) {
    throw new Error("XML does not contain a <body> section."); // validate body section
  }

  const firstLevelNode = bodyNode.getElementsByTagName("level")[0]; // get first level node
  const firstLevelNum = firstLevelNode
    ? Number(firstLevelNode.getAttribute("num") || "1")
    : 1; // determine first level num

  let bodyHtml = ""; // collect rendered body html
  const footnotes = []; // collect footnotes for bottom of document

  for (let i = 0; i < bodyNode.childNodes.length; i++) {
    const child = bodyNode.childNodes[i]; // get direct body child

    if (child.nodeType !== 1) {
      continue; // skip non-element nodes
    }

    if (child.nodeName === "level") {
      bodyHtml += convertLevelNode(child, firstLevelNum, serializer, footnotes); // render top-level level
    }

    if (child.nodeName === "footnote") {
      const footnoteHtml = convertFootnoteNode(child, serializer, footnotes); // render body-level footnote
      footnotes.push(footnoteHtml); // store it for the end
    }
  }

  bodyHtml = unwrapKnownInlineTags(bodyHtml); // remove wrapper span tags
  bodyHtml = removeUnwantedAttributes(bodyHtml); // remove unwanted attributes
  bodyHtml = normalizeHtmlMarkup(bodyHtml); // remove wrapper xml tags
  bodyHtml = cleanText(bodyHtml); // clean nbsp only
  bodyHtml = bodyHtml.replace(/>\s+</g, ">\n<"); // format tags onto separate lines

  const footnotesHtml = footnotes.length > 0
    ? `\n<div class="footnotes">\n${footnotes.join("\n")}\n</div>`
    : ""; // build final footnotes section if any footnotes exist

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Converted HTML</title>
</head>
<body>
${bodyHtml}
${footnotesHtml}
</body>
</html>`; // return final html document
}

module.exports = {
  countTag, // export tag counter
  firstTagText, // export first tag text extractor
  getProviderValue, // export provider resolver
  buildHtmlFromXml // export final html builder
};