const nodeTypes = {
	element: 1,
	text: 3,
	cdata: 4, // deprecated in DOM4
	pi: 7,
	comment: 8,
	doc: 9,
	doctype: 10,
	docfragment: 11
};

function piToJsonml (node) {
	return node.data ? ['?' + node.target, node.data] : ['?' + node.target];
}

function doctypeToJsonml (node) {
	return [
		'!DOCTYPE',
		node.name,
		node.publicId,
		node.systemId
	];
}
function docToJsonml (node) {
	const jsonml = [
		'#document'
	];

	for (let childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
		jsonml.push(domToJsonMl(childNode));
	}

	return jsonml;
}

function elementToJsonml (node) {
	const jsonml = [
		node.nodeName
	];

	if (node.attributes && node.attributes.length) {
		const attributes = {};

		for (let i = 0, l = node.attributes.length; i < l; ++i) {
			const attr = node.attributes[i];
			attributes[attr.name] = attr.value;
		}

		jsonml.push(attributes);
	}

	for (let childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
		jsonml.push(domToJsonMl(childNode));
	}

	return jsonml;
}

// @TODO
function cdataToJsonml (node) {
	return null;
}

export default function domToJsonMl (node) {
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
