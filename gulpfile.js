var gulp  = require('gulp'),
    gutil = require('gulp-util')

    jshint     = require('gulp-jshint'),
    sass       = require('gulp-sass'),
    concat     = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    minifycss  = require('gulp-clean-css'),
    livereload = require('gulp-livereload'),
    path = {
            dev: 'static-src',
            prod: 'public',
    },

    input  = {
      	scripts: {
      		angular: [
      			path.dev + '/libs/ng-file-upload/angular-file-upload-shim.js',
                path.dev + '/libs/angular/angular.js',
                path.dev + '/libs/ng-file-upload/angular-file-upload.js',
                path.dev + '/libs/angular-ui-router/release/angular-ui-router.js',
                path.dev + '/libs/angular-resource/angular-resource.js',
                path.dev + '/libs/angular-bootstrap/ui-bootstrap.js',
                path.dev + '/libs/angular-bootstrap/ui-bootstrap-tpls.js',
                path.dev + '/libs/nprogress/nprogress.js',
                path.dev + '/libs/zeroclipboard/dist/ZeroClipboard.js',
                path.dev + '/libs/ng-clip/src/ngClip.js',
                path.dev + '/libs/angular-sanitize/angular-sanitize.js',
                path.dev + '/libs/angular-timer/dist/angular-timer.js',
                path.dev + '/libs/humanize-duration/humanize-duration.js',
                path.dev + '/libs/moment/moment.js',
                path.dev + '/libs/angular-ui-select/dist/select.js',
                path.dev + '/libs/angular-cookies/angular-cookies.js',
      		],
      		index: [
      			path.dev + '/scripts/libs/{,*/}*.js',
                path.dev + '/scripts/*/{,*/}*.js',
                path.dev + '/scripts/index.js',
                '!' + path.dev + '/scripts/libs/ng-ckeditor.js',
                '!' + path.dev + '/scripts/libs/ckeditor/{,*/}*.js'
      		],
      		ckeditor: [
      			path.dev + '/scripts/libs/ckeditor/ckeditor.js',
      			path.dev + '/scripts/libs/ng-ckeditor.js',
      		],
      		editor: [
      			path.dev + '/scripts/libs/ckeditor/**',
      			'!' + path.dev + '/scripts/libs/ckeditor/ckeditor.js',
      			'!' + path.dev + '/scripts/libs/ckeditor/samples/**'
      		]
      	},
      	styles: {
      		main: path.dev + '/styles/*.scss',
      		bootstrap: path.dev + '/libs/bootstrap/dist/css/bootstrap.css',
      		nprogress: path.dev + '/libs/nprogress/nprogress.css',
          select: path.dev + '/libs/angular-ui-select/dist/select.css',
      	},
      	html: {
      		common: path.dev + '/*.html',
      		sub: [
				path.dev + '/scripts/**',
			'!' + path.dev + '/scripts/{,*/}*.js'
      		]	
      	},
      	fonts: {
      		bootstrap: path.dev + '/libs/bootstrap/dist/fonts/*'
      	},
      	clip: {
      		zeroclipboard: path.dev + '/libs/zeroclipboard/dist/ZeroClipboard.swf'
      	}
    },

    output = {
      	scripts: {
      		angular: path.prod + '/scripts/',
      		index: path.prod + '/scripts/',
      		ckeditor: path.prod + '/scripts/editor/',
      		editor: path.prod + '/scripts/editor/'
      	},
      	styles: {
      		main: path.prod + '/styles/',
      		bootstrap: path.prod + '/styles/',
      		nprogress: path.prod + '/styles/',
          select: path.prod + '/styles/'
      	},
      	html: {
      		common: path.prod,
      		sub: path.prod + '/scripts/'
      	},
      	fonts: {
      		bootstrap: path.prod + '/fonts/'
      	},
      	clip: {
      		zeroclipboard: path.prod + '/scripts/clip/'
      	}
    };


	gulp.task('concat-scripts-angular', function () {
	    gulp.src(input.scripts.angular)
		    .pipe(concat('angular-all.js'))
		    .pipe(gulp.dest(output.scripts.angular));
	});

	gulp.task('concat-scripts-index', function () {
	    gulp.src(input.scripts.index)
		    .pipe(concat('index.js'))
		    .pipe(gulp.dest(output.scripts.index));
	});

	gulp.task('concat-scripts-ckeditor', function () {
	    gulp.src(input.scripts.ckeditor)
		    .pipe(concat('ckeditor.js'))
		    .pipe(gulp.dest(output.scripts.ckeditor));
	});

	gulp.task('dest-scripts-editor', function() {
		gulp.src(input.scripts.editor)
    		.pipe(gulp.dest(output.scripts.editor));
	});

	gulp.task('build-styles-main', function() {
		return gulp.src(input.styles.main)
			.pipe(sourcemaps.init())
			.pipe(sass())
			.pipe(minifycss())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(output.styles.main));
	});

	gulp.task('dest-styles-bootstrap', function() {
		gulp.src(input.styles.bootstrap)
			.pipe(minifycss())
    		.pipe(gulp.dest(output.styles.bootstrap));
	});

	gulp.task('dest-styles-nprogress', function() {
		gulp.src(input.styles.nprogress)
			.pipe(minifycss())
    		.pipe(gulp.dest(output.styles.nprogress));
	});

	gulp.task('dest-select', function() {
	  gulp.src(input.styles.select)
      .pipe(minifycss())
		    .pipe(gulp.dest(output.styles.select));
	});

	gulp.task('dest-html-common', function() {
		gulp.src(input.html.common)
    		.pipe(gulp.dest(output.html.common));
	});

	gulp.task('dest-html-sub', function() {
		gulp.src(input.html.sub)
    		.pipe(gulp.dest(output.html.sub));
	});

	gulp.task('dest-fonts-bootstrap', function() {
		gulp.src(input.fonts.bootstrap)
    		.pipe(gulp.dest(output.fonts.bootstrap));
	});

	gulp.task('dest-clip-zeroclipboard', function() {
		gulp.src(input.clip.zeroclipboard)
    		.pipe(gulp.dest(output.clip.zeroclipboard));
	});

    gulp.task('dev-watch', function() {
        gulp.watch(input.scripts.index, ['concat-scripts-index']);
        gulp.watch(input.styles.main, ['build-styles-main']);
        gulp.watch(input.html.common, ['dest-html-common']);
        gulp.watch(input.html.sub, ['dest-html-sub']);
    });

    gulp.task('default', ['concat-scripts-angular', 'concat-scripts-index', 'concat-scripts-ckeditor', 'dest-scripts-editor', 
        'build-styles-main', 'dest-styles-bootstrap', 'dest-styles-nprogress', 'dest-select',
        'dest-html-common', 'dest-html-sub',
        'dest-fonts-bootstrap', 'dest-clip-zeroclipboard']);

    gulp.task('dev', ['concat-scripts-angular', 'concat-scripts-index', 'concat-scripts-ckeditor', 'dest-scripts-editor', 
        'build-styles-main', 'dest-styles-bootstrap', 'dest-styles-nprogress', 'dest-select',
        'dest-html-common', 'dest-html-sub',
        'dest-fonts-bootstrap', 'dest-clip-zeroclipboard', 'dev-watch']);







