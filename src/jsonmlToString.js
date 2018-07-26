export default function jsonmlToString (jsonMl) {
	if (typeof jsonMl === 'string' ||
		(!isNaN(parseFloat(jsonMl)) && isFinite(jsonMl)) ||
		jsonMl === !!jsonMl) {
		return new String(jsonMl)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	if (!jsonMl)
		return '';

	// Make a copy of the JsonML array so we don't accidentially mutate anybody else's data
	jsonMl = jsonMl.slice();
	
	let xmlString = '';

	let nodeName = jsonMl.shift();

	if (nodeName === '#document')
		nodeName = null;

	if (nodeName && nodeName === '!DOCTYPE') {
		if (jsonMl[0] === 'html') {
			return `<${nodeName} ${jsonMl[0]}>`;
		}

		const publicId = jsonMl[1];
		if (!publicId) {
			jsonMl[1] = 'SYSTEM';
		}
		else {
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

		if (jsonMl[0] && typeof jsonMl[0] === 'object' && !Array.isArray(jsonMl[0])) {
			const attributes = jsonMl.shift();
			Object.keys(attributes).forEach(attributeName => {
				// Do not encode attributes set to "undefined" or "null"
				if (attributes[attributeName] === null || attributes[attributeName] === undefined)
					return;

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

	if (nodeName)
		xmlString += '</' + nodeName + '>';

	return xmlString;
}
