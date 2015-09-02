#!/usr/bin/env node

var program     = require('commander');
var inquirer    = require('inquirer');
var fs          = require('fs-extra');
var path        = require('path');

var root          = path.resolve(".");
var path_neoflux  = root + "/.neoflux"; //folder
var path_neoflux_jade = path_neoflux + "/source/pre_html/"; //folder
var path_neoflux_stylus = path_neoflux + "/stylus"; //folder
var path_neoflux_backend = path_neoflux + "/source/backend/"; //folder
var path_neoflux_ctrl = "ModuleController.php"; //file

var path_schema   = path_neoflux+"/schema.json";

var params  = ['module','action','controller']; // seteamos parametros aceptados

var _modules = null;
var _schema = require(path_schema);

var fn = {
  validNameCreate: function(value){
      if(value.length<1)
      {
        return "error: el nombre no es valido";
      }
      return true;
  }
};

var questions_init = [
  {
    type:"confirm",
    name: "init",
    message: "recursive search modules? ("+root+")"
  }
];
var questions_module = [
  {
    type: "input",
    name: "module_name",
    message: "Name Module",
    validate: fn.validNameCreate
  },
  {
    type: "input",
    name: "controller_name",
    message: "Name Controller",
    default: function () { return "index"; },
    validate: fn.validNameCreate
  },
  {
    type: "input",
    name: "action_name",
    message: "Name Action",
    default: function () { return "index"; },
    validate: fn.validNameCreate
  },
];



// version del programa
program.version('0.0.1');

// programa inicializador
program
  .command('init')
  .description('description: comando importante para iniciar')
  .action(function () 
  {
    console.log('welcome to flux...');
    inquirer.prompt(questions_init ,function(a)
    {
      if(a.init)
      {
        if (fs.existsSync(path_schema)) 
        {
          _modules = getDirs(_schema.modules.backend);

          if(_modules.length>0)
          {
            // chanco array list por la nueva data
            _schema.modules.list = _modules;

            // guarda nuevos datos en el config
            fs.writeJson(path_schema, _schema, function (err) {
              if (err) return console.error(err)
            });
            console.log("correcto");
          }
          else
          {
            console.log("no se encontraron modulos");
          }

        }
        else
        {
          
        }
      }
      else
      {
        console.log('vuelve pronto..');
      }
    });

      
  });


// programa crear
program
  .command('create <option>')
  .description('description: '+ params.join(','))
  .action(function (option) 
  {
    if(in_array(params, option))
    {
    	inquirer.prompt( questions_module, function( answers ) 
    	{
			  console.log( JSON.stringify(answers) );

        // crear
        var folder_backend = _schema.modules.backend+answers.module_name+"/controllers";
        var folder_jade = _schema.modules.frontend.jade+answers.module_name;



        // PROCESSS BACKEND
        fs.copy(path_neoflux_backend, _schema.modules.backend, function(err){
            var namex = _schema.modules.backend + "MODULE";
            dir_jp(answers, namex);
            setTimeout(function(){
              fs.rename(namex, namex.replace("MODULE", answers.module_name), function(err){
                if(err) return console.error("error rename MODULE backend");
                console.log("renombro module backend");
              });
            },1000);
            

        });

        // PROCESSS PRE_HTML
        fs.copy(path_neoflux_jade, _schema.modules.frontend.pre_html, function(err){
            var namex = _schema.modules.frontend.pre_html + "MODULE";
            dir_jp(answers, namex);
            setTimeout(function(){
              fs.rename(namex, namex.replace("MODULE", answers.module_name), function(err){
                if(err) return console.error("error rename MODULE frontend");
                console.log("renombro module frontend");
              });
            },1000);
        });

		    console.log('siguiente paso crear folders');
      });
    }
    else
    {
    	console.log('option not enable')
    }
  });

// programa editar
program
  .command('update <option>')
  .description('description: '+params.join(','))
  .action(function (option) {
    console.log('update %s', option);
  });

// programa eliminar
program
  .command('remove <option>')
  .description('description: '+params.join(','))
  .action(function (option) {
    console.log('remove %s', option);
  });

// extras
program.option('-d, --dest', 'probando 1234');

// programa run
program.parse(process.argv);





function removeFileOrDirectory(file)
{
	fs.remove(file, function (err) 
	{
		if (err) return console.error(err)
	})
}
function generateTemp () {
  return Date.now().toString() + '-' + Math.random().toString().substring(2)
}

function in_array(arr,valor)
{
	var i = arr.length;
	while(i--){
		if(arr[i]==valor) return true
	}
	return false;
}
function getDirs (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        files_.push(files[i]);
    }
    return files_;
}


function dir_jp (obj, dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
      var name = dir + '/' + files[i];

      if (fs.statSync(name).isDirectory()){
        
        dir_jp(obj,name, files_);

        if(files[i]=="MODULE"){
          console.log("module: ", name);
          fs.rename(name, name.replace("MODULE", obj.module_name), function(err){
            if(err) return console.error("error rename jade module");
            console.log("renombro jade module");

          });
        }

        if(files[i]=="CONTROLLER"){
          console.log("controller: ", name);
          fs.rename(name, name.replace("CONTROLLER", obj.controller_name), function(err){
            if(err) return console.error("error rename jade controller");
            console.log("renombro jade controller");
          });
          break;
        }

      } else {
        
        // aqui hacer search regex
        if(files[i]=="ACTION.jade" || files[i]=="ACTION.phtml"){
          console.log("action: ", name);
          fs.rename(name, name.replace("ACTION",obj.action_name), function(err){
            if(err) return console.error("error rename jade action");
            console.log("renombro jade action");
          });
        }
        
        if(files[i]=="MODULEController.php"){

            var name_new = name.replace("MODULEController", obj.module_name+"Controller");

            fs.rename(name, name_new, function(err){
              if(err) return console.error(err);
              
              fs.readFile(name_new, 'utf8', function (err,data) {
                if (err) return console.log(err);

                var result = data
                              .replace(/\{\{MODULE\}\}/g, capitalizeText(obj.module_name))
                              .replace(/\{\{CONTROLLER\}\}/g, capitalizeText(obj.controller_name))
                              .replace(/\{\{ACTION\}\}/g, obj.action_name);
                fs.writeFile(name_new, result, 'utf8', function (err) {
                  if (err) return console.log(err);
                  console.log("great!!!");
                });
                // 
              });
         
            });


          }
        
      }
    }
    return files_;
}


function capitalizeText(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
