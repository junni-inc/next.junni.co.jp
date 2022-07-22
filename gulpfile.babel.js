// gulp
import gulp from 'gulp';
import gulpIf from 'gulp-if';

// utils
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import del from 'del';

// css
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import cssmin from 'gulp-cssmin';
import autoprefixer from 'gulp-autoprefixer';
const sass = gulpSass( dartSass );

// eslint
import eslint from 'gulp-eslint';

// ts
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';
import fancyLog from 'fancy-log';
import supportsColor from 'supports-color';

// variables
const srcDir = './src';
const outDir = './public';

const isFixed = ( file ) => {

	return file.eslint != null && file.eslint.fixed;

}

const lint = ( cb ) => {

	let paths = [ srcDir ];

	for ( let i = 0; i < paths.length; i ++ ) {

		gulp.src( paths[ i ] + '**/*.ts' )
			.pipe( eslint( { useEslintrc: true, fix: true } ) ) // .eslintrc を参照
			.pipe( eslint.format() )
			.pipe( gulpIf( isFixed, gulp.dest( paths[ i ] ) ) )
			.pipe( eslint.failAfterError() );

	}

	cb();

}

const setDevMode = ( cb ) => {

	webpackConfig.mode = 'development';
	
	cb();
	
}

const setPrdMode = ( cb ) => {

	webpackConfig.mode = 'production';
	
	cb();
	
}

const buildWebpack = ( cb ) => {

	webpackConfig.entry.main = srcDir + '/ts/main.ts';
	webpackConfig.output.filename = 'script.js';

	webpackStream( webpackConfig, webpack, ( err, stats ) => {
		
		if (err) {
			console.log(err);
			return;
		}

		stats = stats || {};

		var statusLog = stats.toString({
			colors: supportsColor.stdout.hasBasic,
			hash: false,
			timings: false,
			chunks: false,
			chunkModules: false,
			modules: false,
			children: true,
			version: true,
			cached: false,
			cachedAssets: false,
			reasons: false,
			source: false,
			errorDetails: false
		});
		
		if (statusLog) {
			fancyLog(statusLog);
		}

		reload();
		
	})
		.on( 'error', function() { this.emit( 'end' ) } )
		.pipe( gulp.dest( outDir + '/js/' ) )

	cb();

}

const buildSass = () => {
	
	return gulp.src( srcDir + '/scss/style.scss' )
		.pipe( plumber( {

			errorHandler: ( err ) => {
			console.log( err.messageFormatted );
			this.emit('end');
			
		} } ) )
		.pipe( sass() )
		.pipe( autoprefixer( [ 'last 2 versions'] ) )
		.pipe( cssmin() )
		.pipe( gulp.dest( outDir + '/css/' ) )
		.pipe( browserSync.stream() );
		
}

const copy = ( c ) => {
	
	gulp.src( [srcDir + '/html/**/*'] ).pipe( gulp.dest( outDir ) );
	gulp.src( [srcDir + '/assets/**/*'] ).pipe( gulp.dest( outDir + '/assets/' ) );
	
	c();
	
}

const brSync = () => {

	browserSync.init( {
		server: {
			baseDir: outDir,
			index: 'index.html'
		},
		open: true,
		notify: false,
		ghostMode: false
	} );

}

const clean = ( c ) => {

	del( 
		[ outDir ],
		{
			force: true,
		} 
	).then( () => {

		c();

	} );

}

const reload = ( cb ) => {

	browserSync.reload();

	cb && cb();
	
}

const watch = () => {

	gulp.watch( srcDir + '/scss/**/*', gulp.series( buildSass ) );
	gulp.watch( srcDir + '/html/**/*', gulp.series( copy, reload ) );
	gulp.watch( srcDir + '/assets/**/*', gulp.series( copy, reload ) );
	
}

exports.default = gulp.series( 
	clean,
	setDevMode,
	gulp.parallel( buildWebpack, buildSass ),
	copy,
	gulp.parallel( brSync, watch )
);

exports.build = gulp.series(
	clean,
	setPrdMode,
	gulp.parallel( buildWebpack, buildSass ),
	copy,
)

exports.lint = gulp.task( lint );