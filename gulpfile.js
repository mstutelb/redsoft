let gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),

  concat = require('gulp-concat'),
  uglify = require('gulp-uglifyjs'),
  merge = require('merge-stream'),
  cssnano = require('gulp-cssnano'),
  
  rename = require('gulp-rename'),
  del = require('del'),
  notify = require('gulp-notify'),
  path = require('path');
  pngquant = require('imagemin-pngquant'),
  cache = require('gulp-cache');
  autoprefixer = require('gulp-autoprefixer');
  
const minify = require('gulp-minify');

// SVG спрайты
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');

/*************** все для картинок ***************/
var buffer = require('vinyl-buffer');							
var imagemin = require('gulp-imagemin');							// минификация картинок
var spritesmith = require('gulp.spritesmith');					// создание спрайтов

//добавление переменной к ссылке
var hash_src = require("gulp-hash-src");

//добавление блоков html
var fileinclude = require('gulp-file-include');


/****************************************
html 
****************************************/
gulp.task('html', function () {
  return gulp.src('app/**/*.html')
    .pipe(hash_src({ build_dir: "dist", src_path: "app" }))
    .pipe(fileinclude({
      prefix: '@@',
      // basepath: '@file'
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

/****************************************
* сомтрим за php 
****************************************/

gulp.task('php', function () {
  return gulp.src('app/**/*.php')
    .pipe(gulp.dest('dist/'))
});


gulp.task('sass', function () {
  return gulp.src('app/sass/**/*.+(scss|sass|css)')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '>1%', 'ie 11'], { cascade: true }))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
  return gulp.src([
    'app/js/*.js',
  ])
    .pipe(minify())
    // .pipe(concat('libs.min.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.stream());
});


gulp.task('browser-sync', function () {
  browserSync({
    proxy: 'redsoft.loc',
    notify: false
  });
});

gulp.task('clean', function () {
  return del('dist', {force: true})
});



gulp.task('clear', function () {
  return cache.clearAll();
});

/****************************************
Создание спрайтов 
****************************************/

gulp.task('sprite', function () {
  var spriteData = gulp.src('app/sprite_icons/*.*')			// путь, откуда берем картинки для спрайта
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: '_sprite.sass',
      padding: 5
    }));
  // Pipe image stream onto disk
      var imgStream = spriteData.img
      .pipe(gulp.dest('app/img/'));

    // Pipe CSS stream onto disk
    var cssStream = spriteData.css
      .pipe(gulp.dest('app/sass/'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
      // spriteData.img.pipe(gulp.dest('app/img/'));					// путь, куда сохраняем картинку
      // spriteData.css.pipe(gulp.dest('app/sass/'));					// путь, куда сохраняем стили
    });


/****************************************
* Созадние svg спрайта 
****************************************/
gulp.task('svgstore', function () {
  return gulp
    .src('app/svg/*.svg')

    .pipe(svgmin())
    .pipe(cheerio({
      run: function ($) {
        $('defs').html('');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename({ basename: 'sprite' }))
    .pipe(gulp.dest('dist/img'));
});


/****************************************
оптимизация картинок
****************************************/
gulp.task('imgclean', function some() {
  return del('dist/img', {force: true})
});

gulp.task('img', gulp.series('imgclean', function imgcopy() {
  return gulp.src('app/img/**/*')
    .pipe(cache(imagemin({
    	interlaced: true,
    	progtessive: true,
    	svgPlugins: [{removeViewBox:false}],
    	une: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img'));
}));




gulp.task('fonts', function some() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('build', gulp.series('clean', 'img', 'sass', 'html', 'scripts', 'fonts', 'svgstore'), function () {

  

})

gulp.task('watch', gulp.series('build', function () {
  gulp.watch('app/sass/**/*.+(scss|sass|css)', gulp.parallel('sass'));
  gulp.watch('app/**/*.html', gulp.parallel('html'));
  gulp.watch('app/js/**/*.js', gulp.parallel('scripts'));
  gulp.watch('app/**/*.php', gulp.parallel('php'));
  gulp.watch('app/img/*.jpg', gulp.parallel('img'));
  gulp.watch('app/img/*.png', gulp.parallel('img'));
  gulp.watch('app/img/*.svg', gulp.parallel('img'));
  gulp.watch('app/sprite_icons/*.png', gulp.parallel('sprite'));
  gulp.watch('app/svg/*.svg', gulp.parallel('svgstore'));
}));

gulp.task('default', gulp.parallel('browser-sync', 'watch'));
