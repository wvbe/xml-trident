import { sync, slimdom } from 'slimdom-sax-parser';

export default function stringToDom (str) {
	if (str && str.trim().length) {
		return sync(str, true);
	}

	return new slimdom.Document();
}
