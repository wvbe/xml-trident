'use strict';

const assert = require('assert');
const xmlTrident = require('../dist/xml-trident');

// A list of all the keys a test can possibly have to be an it() instead of a describe(). If any of the object
// properties is not listed here, that test may erronously be recognized as a recursion.
//
// Yes, this is a bit shaky but fuck it's only DRYing some tests, man.
const magicKeys = ['xml', 'assert', 'result', 'skip', 'childNodes'];

function testEverythingInObject (tests) {
	Object.keys(tests).forEach(name => {
		const test = tests[name];

		(test.skip ? xdescribe : describe)(name, () => {
			if (Object.keys(test).length <= magicKeys.length && Object.keys(test).every(key => magicKeys.includes(key))) {
				let jsonMl = null;
				let dom = null;

				it('encodes to JsonML', () => {
					jsonMl = xmlTrident.toJsonml(test.xml);
					test.assert(jsonMl);
				});

				it('encodes to DOM', () => {
					dom = xmlTrident.toDom(jsonMl);
					assert.equal(dom.childNodes.length, test.childNodes === undefined ? 1 : test.childNodes);
				});

				it('encodes to the ' + (test.result !== undefined ? 'expected' : 'original') + ' XML string', () => {
					assert.deepEqual(xmlTrident.toString(dom), test.result !== undefined ? test.result : test.xml);
				});
			}
			else {
				return testEverythingInObject(test);
			}
		});
	});
}

describe('Roundtripping', () => {
	testEverythingInObject({
		'document node': {
			xml: '',
			assert: jsonMl => assert.equal(jsonMl[0], '#document'),
			childNodes: 0
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
				}]),
				result: '<div b="123" a="abc" c="" d="" />'
			},
			'with children': {
				xml: '<div><img /></div>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['div', ['img']])
			}
		},
		'text node': {
			// Wrapping this test in a <span> tag because text is not allowed directly in a DocumentNode
			xml: '<span>skeet  boop</span>',
			assert: jsonMl => assert.equal(jsonMl[1][1],'skeet  boop')
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
				xml: '<?pi    te  st   ?>',
				assert: jsonMl => assert.deepEqual(jsonMl[1],['?pi', 'te  st   ']),
				result: '<?pi te  st   ?>',
			}
		},
		'comments': {
			'without data': {
				xml: '<!---->',
				assert: jsonMl => assert.deepEqual(jsonMl[1], undefined),
				result: '',
				childNodes: 0
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
			'for private DTDs': {
				skip: true,
				xml: '<!DOCTYPE root-element SYSTEM "URI" []>',
				assert: jsonMl => {
					console.dir(jsonMl);
					assert.deepEqual(jsonMl[1],['!DOCTYPE', 'root-element', false, 'URI'])
				}
			}
		},
		'cdata': {
				skip: true,
				xml: `<![CDATA[ skeet ]]>`,
				assert: jsonMl => assert.deepEqual(jsonMl[1],['!CDATA', ' skeet '])
		}
	});
});

it('Empty document', () => {
	assert.equal(xmlTrident.toDom().childNodes.length, 0);
	assert.equal(xmlTrident.toDom('').childNodes.length, 0);
});
