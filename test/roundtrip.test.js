'use strict';

// @TODO:
// <div a /> should encode to ['div', { a: true }] or something, and vice versa

const assert = require('assert');
const xmlTrident = require('../dist/xml-trident');

const magicKeys = ['xml', 'assert', 'result'];
function testEverythingInObject (tests) {
	Object.keys(tests).forEach(name => {
		if (name.charAt(0) === '_') {
			return;
		}
		describe(name, () => {
			const test = tests[name];
			if (Object.keys(test).length <= magicKeys.length && Object.keys(test).every(key => magicKeys.includes(key))) {
				let jsonMl = null;

				it('encodes to JsonML', () => {
					jsonMl = xmlTrident.toJsonml(test.xml);
					test.assert(jsonMl);
				});

				it('encodes to the ' + (test.result ? 'expected' : 'original') + ' XML string', () => {
					assert.deepEqual(xmlTrident.toString(jsonMl), test.result || test.xml);
				});
			}
			else {
				return testEverythingInObject(test);
			}
		});
	});
}

describe('Roundtripping a', () => {
	testEverythingInObject({
		'document node': {
			xml: '',
			assert: jsonMl => assert.equal(jsonMl[0], '#document')
		},
		'element node': {
			'that is self closing': {
				xml: '<div />',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['div'])
			},
			'with attributes': {
				xml: '<div b="123" a="abc" c="" d="" />',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['div', {
					b: '123',
					a: 'abc',
					c: '',
					d: ''
				}])
			},
			'with children': {
				xml: '<div><img /></div>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['div', ['img']])
			}
		},
		'text node': {
			xml: 'skeet  boop',
			assert: jsonMl => assert.equal(jsonMl[1],'skeet  boop')
		},
		'processing instruction': {
			'without data': {
				xml: '<?pi?>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['?pi'])
			},
			'without data but with spacing': {
				xml: '<?pi ?>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['?pi']),
				result: '<?pi?>'
			},
			'with data': {
				xml: '<?pi te  st?>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['?pi', 'te  st'])
			},
			'with whitespace surrounding data': {
				xml: '<?pi  te  st ?>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['?pi', 'te  st']),
				result: '<?pi te  st?>'
			}
		},
		'comments': {
			'without data': {
				xml: '<!---->',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!'])
			},
			'without data but with spacing': {
				xml: '<!-- -->',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!', ' '])
			},
			'without whitespace': {
				xml: '<!--com  ment-->',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!', 'com  ment'])
			},
			'with whitespace': {
				xml: '<!-- com  ment -->',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!', ' com  ment '])
			},
			'with newlines': {
				xml: `<!--\n\tcomment\n-->`,
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!', '\n\tcomment\n'])
			}
		},
		'doctype declarations': {
			'for HTML5': {
				xml: '<!DOCTYPE html>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!DOCTYPE', 'html', false, false])
			},
			'for public DTDs': {
				xml: '<!DOCTYPE root-element PUBLIC "DTD-name" "DTD-location">',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!DOCTYPE', 'root-element', 'DTD-name', 'DTD-location'])
			},
			'for public DTDs and then some': {
				xml: '<!DOCTYPE root-element PUBLIC "DTD-name" "DTD-location" []>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!DOCTYPE', 'root-element', 'DTD-name', 'DTD-location']),
				result: '<!DOCTYPE root-element PUBLIC "DTD-name" "DTD-location">',
			},
			'_____for private DTDs': {
				xml: '<!DOCTYPE root-element SYSTEM "URI" []>',
				assert: jsonMl => {
					console.dir(jsonMl);
					assert.deepEqual(jsonMl[1],['!DOCTYPE', 'root-element', false, 'URI'])
				}
			}
		},
		'cdata': {
				xml: `<![CDATA[ skeet ]]>`,
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!CDATA', ' skeet '])
		}
	});
});
