import domToJsonml from './domToJsonml';
import stringToDom from './stringToDom';
import jsonmlToString from './jsonmlToString';

export function toString (domOrJsonml) {
	return jsonmlToString(Array.isArray(domOrJsonml) ? domOrJsonml : domToJsonml(domOrJsonml));
}

export function toDom (stringOrJsonml) {
	return stringToDom(typeof stringOrJsonml === 'string' ? stringOrJsonml : jsonmlToString(stringOrJsonml));
}

export function toJsonml (stringOrDom) {
	return domToJsonml(typeof stringOrDom === 'string' ? stringToDom(stringOrDom) : stringOrDom);
}
