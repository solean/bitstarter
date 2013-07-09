#!/usr/bin/env node

var fs=require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT='index.html';
var CHECKSFILE_DEFAULT='checks.json';

var assertFileExists = function(infile){
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.",instr);
	process.exit(1);
    }
    return instr;
}


var checkURL = function(url,checks) {
    console.log('Checking url ' + url);
    rest.get(url).on('complete',function(result){
	if (result instanceof Error) {
	        console.log('Error: ' + result.message);
	    } else {
		   var checkJson = checkHtmlFile(result,checks);
		   var outJson = JSON.stringify(checkJson,null,4); 
           console.log(outJson);
		}
    });
} 

var cheerioHtmlFile = function(result){
    return cheerio.load(result);
}

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
}

var checkHtmlFile = function(htmlfile,checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile);
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
}

var clone = function(fn){
    return fn.bind({});
}

if (require.main == module) {
    program
    .option('-c, --checks <check_file>', 'Path to checks.json',clone(assertFileExists),CHECKSFILE_DEFAULT)
    .option('-u, --url <url>','URL to check')
    .parse(process.argv);
    console.log(program.url);
    checkURL(program.url, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
