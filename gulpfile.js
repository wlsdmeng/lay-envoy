/**
 layuiAdmin pro 构建
*/

var pkg = require('./package.json');
var inds = pkg.independents;

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var header = require('gulp-header');
var del = require('del');
var gulpif = require('gulp-if');
var minimist = require('minimist');
var browserSync = require('browser-sync').create();
//获取参数
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    ver: 'all'
  }
})

//注释
,note = [
  '/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> License By <%= pkg.homepage %> */\n <%= js %>'
  ,{pkg: pkg, js: ';'}
]

,destDir = './dist' //构建的目标目录
,releaseDir = '../pack/layuiAdmin.pack/'+ pkg.name +'-v' + pkg.version //发行版本目录

//任务
,task = {
  //压缩 JS
  minjs: function(){
    console.log("执行[minjs]任务:压缩 JS");
    var src = [
      './src/**/*.js'
      ,'!./src/config.js'
      ,'!./src/lib/extend/echarts.js'
    ];

    return gulp.src(src).pipe(uglify())
     .pipe(header.apply(null, note))
    .pipe(gulp.dest(destDir));
  }

  //压缩 CSS
  ,mincss: function(){
    console.log("执行[mincss]任务:压缩 CSS");
    var src = [
      './src/**/*.css'
    ]
     ,noteNew = JSON.parse(JSON.stringify(note));


    noteNew[1].js = '';

    return gulp.src(src).pipe(minify({
      compatibility: 'ie7'
    })).pipe(header.apply(null, noteNew))
    .pipe(gulp.dest(destDir));
  }

  //复制文件夹
  ,mv: function(){
    console.log("执行[mv]任务:复制文件夹");
    gulp.src('./src/config.js')
    .pipe(gulp.dest(destDir));

    gulp.src('./src/lib/extend/echarts.js')
    .pipe(gulp.dest(destDir + '/lib/extend'));

    gulp.src('./src/style/res/**/*')
    .pipe(gulp.dest(destDir + '/style/res'));

    return gulp.src('./src/views/**/*')
    .pipe(gulp.dest(destDir + '/views'));
  }
  ,browser:function(){
    console.log("执行[browser]任务:浏览器启动");

    /********************************************************************
     ********************************************************************
     *                          browserSync说明文档
     *                    http://www.browsersync.cn/docs/
     ********************************************************************
     *******************************************************************/
    browserSync.init({
      // server: './start'    // 访问目录
      // proxy: "你的域名或IP"    // 设置代理
      server: "./",
      ui: false,  //禁用ui网址
      //在Chrome浏览器中打开网站
      // browser: "google chrome",
      // 浏览器打开时的默认访问路径”
      startPath: "/start/index.html"
    });
  }
};


//清理
gulp.task('clear', function(cb) {
  console.log("执行[clear]任务:清理");
  return del(['./dist/*'], cb);
});
gulp.task('clearRelease', function(cb) {
  console.log("执行[clearRelease]任务");
  return del(['./json/*', releaseDir], cb);
});

gulp.task('minjs', task.minjs);
gulp.task('mincss', task.mincss);
gulp.task('mv', task.mv);

gulp.task('src', function(){ //命令：gulp src
  console.log("执行[src]任务");

  // gulp.src('./dev-pro/**/*'):把./dev-pro/**/*文件读到gulp内存中
  // gulp.dest('./src'):通常表示输出文件
  return gulp.src('./dev-pro/**/*')
  .pipe(gulp.dest('./src'));
});

//构建核心源文件
gulp.task('default', ['clear', 'src'], function(){ //命令：gulp
  for(var key in task){
    task[key]();
  }
});

gulp.task('browser', task.browser);

//发行 - layuiAdmin 官方使用
gulp.task('release', function(){ //命令：gulp && gulp release

  //复制核心文件
  gulp.src('./dist/**/*')
  .pipe(gulp.dest(releaseDir + '/dist'));

  gulp.src('./src/**/*')
  .pipe(gulp.dest(releaseDir + '/src'));

  //复制 json
  gulp.src('./dev/json/**/*')
  .pipe(gulp.dest('./json'))
  .pipe(gulp.dest('./start/json'))
  .pipe(gulp.dest(releaseDir + '/start/json'));

  //复制并转义宿主页面
  gulp.src('./dev/index.html')
    .pipe(replace(/\<\!-- clear s --\>([\s\S]*?)\<\!-- clear e --\>/, ''))
    .pipe(replace('//local.res.layui.com/layui/src', 'layui'))
    .pipe(replace("base: '../dev-pro/'", "base: '../dist/'"))
    .pipe(replace('@@version@@', pkg.version))
  .pipe(gulp.dest('./start'))
  .pipe(gulp.dest(releaseDir + '/start'));

  //复制帮助文件
  gulp.src([
    './帮助/*'
    ,'!./帮助/说明.txt'
  ]).pipe(gulp.dest(releaseDir + '/帮助'));

  gulp.src([
    './帮助/说明.txt'
  ]).pipe(gulp.dest(releaseDir));


  //复制 gulpfile
  gulp.src([
    'gulpfile.js'
    ,'package.json'
  ]).pipe(gulp.dest(releaseDir));

  //说明
  gulp.src('../pack/说明.txt')
  .pipe(gulp.dest('../pack/layuiAdmin.pack'));

  //复制 layui
  return gulp.src('../../../../res/layui/rc/**/*')
  .pipe(gulp.dest('./start/layui'))
  .pipe(gulp.dest(releaseDir + '/start/layui'))
});






