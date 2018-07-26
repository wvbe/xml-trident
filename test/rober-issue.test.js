'use strict';

const assert = require('assert');
const xmlTrident = require('../dist/xml-trident');

const row = ['row', ['entry']];
const jsonMl = ['xml-tag', row, row];

it('should not eat up jsonml substructures when inserted by reference', () => {
	assert.equal(xmlTrident.toDom(jsonMl).documentElement.childNodes.length, 2);
});
