let
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  cleanCSS = require('gulp-cleancss'),
  rename = require('gulp-rename'),
  autoprefixer = require('gulp-autoprefixer'),
  del = require('del'),
  notify = require('gulp-notify'),
  pug = require('gulp-pug'),
  spritesmith = require('gulp.spritesmith'),
  svgstore = require('gulp-svgstore'),
  //svgmin = require('gulp-svgmin'),
  //cheerio = require('gulp-cheerio'),
  sourcemaps = require('gulp-sourcemaps');


gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false,
  });
});

gulp.task('sass', function () {
  return gulp.src('app/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expand'
    }).on("error", notify.onError()))
    .pipe(rename({
      suffix: '.min',
      prefix: ''
    }))
    .pipe(autoprefixer(['last 15 versions']))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('pug', function () {
  return gulp.src('app/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('scripts', function () {
  return gulp.src([
      'app/libs/jquery.js',
      'app/libs/slimscroll.js',
      'app/scripts/scripts.js',
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/scripts'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('imagemin', function () {
  return gulp.src('app/images/**/*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
    ])))

    .pipe(gulp.dest('dist/images'));
});

gulp.task('svg-sprites', function () {
  return gulp
    .src('app/utilites/create-sprite/svg/*.svg')
    .pipe(svgstore())
    .pipe(rename({
      basename: 'sprite'
    }))
    .pipe(gulp.dest('app/images/icons/svg/sprite'))
});

gulp.task('png-sprites', function () {
  var spriteData = gulp.src('app/utilites/create-sprite/png/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    algorithm: 'left-right',
    padding: 80
  }));
  spriteData.img.pipe(gulp.dest('app/img/icons/png/sprite'));
  spriteData.css.pipe(gulp.dest('app/sass/utilites'));
});

gulp.task('removedist', function () {
  return del.sync('dist');
});

gulp.task('clearcache', function () {
  return cache.clearAll();
});

gulp.task('build', ['removedist', 'imagemin', 'pug', 'sass', 'scripts'], function () {

  var buildFiles = gulp.src([
    'app/*.html',
  ]).pipe(gulp.dest('dist'));

  var buildCss = gulp.src([
    'app/css/main.min.css',
  ]).pipe(gulp.dest('dist/css'));

  var buildJs = gulp.src([
    'app/js/scripts.min.js',
  ]).pipe(gulp.dest('dist/js'));

  var buildFonts = gulp.src([
    'app/fonts/**/*',
  ]).pipe(gulp.dest('dist/fonts'));

});

gulp.task('watch', ['pug', 'sass', 'scripts', 'browser-sync'], function () {
  gulp.watch('app/sass/**/*.scss', ['sass']);
  gulp.watch(['libs/**/*.js', 'app/scripts/scripts.js'], ['scripts']);
  gulp.watch('app/*.pug', ['pug'], browserSync.reload);
});

gulp.task('default', ['watch']);