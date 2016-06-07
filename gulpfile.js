var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    path = require('path'),
    del      = require('del'),
    inquirer = require('inquirer');

var paths = {
    dist: {
        root: './dist'
    }
};
paths.dist.scripts = path.join(paths.dist.root, 'js');
paths.dist.styles  = path.join(paths.dist.root, 'css');
paths.dist.images  = path.join(paths.dist.root, 'images');

gulp.task('default', ['compile']);

gulp.task('compile', ['script', 'images-and-styles']);

gulp.task('release', ['compile', 'bump']);

gulp.task('script', function(){
    var pkg = require('./package.json');

    gulp.src('./src/emojify.js')
        .pipe(gulp.dest(paths.dist.scripts))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.insert.prepend('/*! ' + pkg.name + ' - v' + pkg.version + ' - \n' +
            ' * Copyright (c) Hassan Khan ' + new Date().getFullYear() + '\n' +
            ' */'))
        .pipe($.uglify({
            preserveComments: 'some'
        }))
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.scripts));
});


gulp.task('images-and-styles', ['copy-styles'], function(){
    return gulp.src('./src/emoji/*.png')
        .pipe(gulp.dest(paths.dist.images));
});

gulp.task('copy-styles', function(){
    gulp.src('./src/css/*.css')
        .pipe(gulp.dest(paths.dist.styles))
        .pipe($.cleanCss())
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.styles));
});

gulp.task('clean', function(done){
    del(paths.dist.root, done);
});

gulp.task('bump', function(done){
    inquirer.prompt({
        type: 'list',
        name: 'bump',
        message: 'What type of bump would you like to do?',
        choices: ['patch', 'minor', 'major', "don't bump"]
    }, function(result){
        if(result.bump === "don't bump"){
            done();
            return;
        }
        gulp.src(['./bower.json', './package.json'])
            .pipe($.bump({type: result.bump}))
            .pipe(gulp.dest('./'))
            .on('end', done);
    });
});
