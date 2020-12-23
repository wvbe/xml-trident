(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('slimdom-sax-parser')) :
	typeof define === 'function' && define.amd ? define(['exports', 'slimdom-sax-parser'], factory) :
	(factory((global['xml-trident'] = global['xml-trident'] || {}),global['slimdom-sax-parser']));
}(this, (function (exports,slimdomSaxParser) { 'use strict';

var nodeTypes = {
	element: 1,
	text: 3,
	cdata: 4, // deprecated in DOM4
	pi: 7,
	comment: 8,
	doc: 9,
	doctype: 10,
	docfragment: 11
};

function piToJsonml(node) {
	return node.data ? ['?' + node.target, node.data] : ['?' + node.target];
}

function doctypeToJsonml(node) {
	return ['!DOCTYPE', node.name, node.publicId, node.systemId];
}
function docToJsonml(node) {
	var jsonml = ['#document'];

	for (var childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
		jsonml.push(domToJsonMl(childNode));
	}

	return jsonml;
}

function elementToJsonml(node) {
	var jsonml = [node.nodeName];

	if (node.attributes && node.attributes.length) {
		var attributes = {};

		for (var i = 0, l = node.attributes.length; i < l; ++i) {
			var attr = node.attributes[i];
			attributes[attr.name] = attr.value;
		}

		jsonml.push(attributes);
	}

	for (var childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
		jsonml.push(domToJsonMl(childNode));
	}

	return jsonml;
}

// @TODO
function cdataToJsonml(node) {
	return null;
}

function domToJsonMl(node) {
	if (!node) {
		throw new Error('No node');
	}
	switch (node.nodeType) {
		case nodeTypes.element:
			return elementToJsonml(node);

		case nodeTypes.text:
			return node.nodeValue;

		case nodeTypes.cdata:
			return cdataToJsonml(node);

		case nodeTypes.pi:
			return piToJsonml(node);

		case nodeTypes.comment:
			return node.data ? ['!', node.data] : ['!'];

		case nodeTypes.doc:
			return docToJsonml(node);

		case nodeTypes.doctype:
			return doctypeToJsonml(node);

		default:
			throw new Error('Unsupported node type: ' + node.nodeType);
	}
}

function stringToDom(str) {
	if (str && str.trim().length) {
		return slimdomSaxParser.sync(str, true);
	}

	return new slimdomSaxParser.slimdom.Document();
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function jsonmlToString(jsonMl) {
	if (typeof jsonMl === 'string' || !isNaN(parseFloat(jsonMl)) && isFinite(jsonMl) || jsonMl === !!jsonMl) {
		return new String(jsonMl).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	if (!jsonMl) return '';

	// Make a copy of the JsonML array so we don't accidentially mutate anybody else's data
	jsonMl = jsonMl.slice();

	var xmlString = '';

	var nodeName = jsonMl.shift();

	if (nodeName === '#document') nodeName = null;

	if (nodeName && nodeName === '!DOCTYPE') {
		if (jsonMl[0] === 'html') {
			return '<' + nodeName + ' ' + jsonMl[0] + '>';
		}

		var publicId = jsonMl[1];
		if (!publicId) {
			jsonMl[1] = 'SYSTEM';
		} else {
			jsonMl[1] = 'PUBLIC';
			jsonMl.splice(2, 0, '"' + publicId + '"');
		}
		jsonMl[3] = '"' + jsonMl[3] + '"';
		return '<' + nodeName + ' ' + jsonMl.join(' ') + '>';
	}

	if (nodeName && nodeName.charAt(0) === '?') {
		return '<' + nodeName + (jsonMl.length ? ' ' + jsonMl.join('') : '') + '?>';
	}

	if (nodeName && nodeName.charAt(0) === '!') {
		return jsonMl[0] ? '<!--' + jsonMl[0] + '-->' : '<!---->';
	}

	if (nodeName) {
		xmlString += '<' + nodeName;

		if (jsonMl[0] && _typeof(jsonMl[0]) === 'object' && !Array.isArray(jsonMl[0])) {
			var attributes = jsonMl.shift();
			Object.keys(attributes).forEach(function (attributeName) {
				// Do not encode attributes set to "undefined" or "null"
				if (attributes[attributeName] === null || attributes[attributeName] === undefined) return;

				xmlString += ' ' + attributeName + '="' + attributes[attributeName] + '"';
			});
		}

		if (!jsonMl.length) {
			xmlString += ' />';
			return xmlString;
		}

		xmlString += '>';
	}

	while (jsonMl.length) {
		xmlString += jsonmlToString(jsonMl.shift());
	}

	if (nodeName) xmlString += '</' + nodeName + '>';

	return xmlString;
}

function toString(domOrJsonml) {
	return jsonmlToString(Array.isArray(domOrJsonml) ? domOrJsonml : domToJsonMl(domOrJsonml));
}

function toDom(stringOrJsonml) {
	return stringToDom(typeof stringOrJsonml === 'string' ? stringOrJsonml : jsonmlToString(stringOrJsonml));
}

function toJsonml(stringOrDom) {
	return domToJsonMl(typeof stringOrDom === 'string' ? stringToDom(stringOrDom) : stringOrDom);
}

exports.toString = toString;
exports.toDom = toDom;
exports.toJsonml = toJsonml;

Object.defineProperty(exports, '__esModule', { value: true });

})));
