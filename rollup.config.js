import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/index.js',
	dest: 'dist/xml-trident.js',
	format: 'umd',
	moduleName: 'xml-trident',
	globals: {
		'slimdom-sax-parser': 'slimdom-sax-parser'
	},
	plugins: [
		resolve({
			jsnext: true
		}),
		commonjs(),
		babel({
			presets: [
				[
					'es2015',
					{ modules: false }
				]
			],
			plugins: [
				'external-helpers'
			]
		})
	]
};
