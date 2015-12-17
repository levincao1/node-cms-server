/**
 * Created by levin on 15/10/20.
 */
var gulp = require('gulp');

gulp.task('default',function(){
    return gulp.src('bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('public/javascripts/lib'));
});