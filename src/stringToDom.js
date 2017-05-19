import xmldom from 'xmldom';

const domParser = new xmldom.DOMParser();

let emptyDocument;

export default function stringToDom (str) {
	if (str && str.trim().length) {
		return domParser.parseFromString(str, 'application/xml');
	}

	if (!emptyDocument) {
		emptyDocument = domParser.parseFromString('<div></div>', 'application/xml').implementation.createDocument();
	}

	return emptyDocument;
}
