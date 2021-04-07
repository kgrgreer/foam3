'use strict';

require('../../foam3/src/foam.js');
var stringify = require("json-stringify-pretty-compact");
var _ = require('underscore');

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp')
var DOMParser = require('xmldom').DOMParser;
var pack = require('../../package.json');
var simpleType = require('./simpleType');
var complexType = require('./complexType');
var types = require('./typeMapping');
var iso20022Types = require('./iso20022Types');

if ( process.argv.length < 3 ) {
  console.log('Usage: node tools/xsd/index.js package [files]');
  process.exit(-1);
}

var files = process.argv.slice(3);
var packageName  = process.argv[2];
var packagePath = packageName.replace(/\./g, "/");
var indir = path.join(__dirname, '/messages/');
var outdir = path.join(__dirname, '../../nanopay/src/' + packagePath + '/');

var classesOutDir = path.join(__dirname, '../../nanopay/src/' + packagePath + '/');

var classes = [];
var simpleTypes = [];

// push document interface
if ( packageName === 'net.nanopay.iso20022' ) {
  classes.push('net.nanopay.iso20022.Document');
}

function writeFileIfUpdated(outfile, buildJavaSource, opt_result) {
  if (! ( fs.existsSync(outfile) && (fs.readFileSync(outfile).toString() == buildJavaSource))) {
    fs.writeFileSync(outfile, buildJavaSource, 'utf8');
    if ( opt_result !== undefined) opt_result.push(outfile);
  }
}

var outputter = null;

/**
 * Converts the FOAM model to string
 * @param  {Object} m FOAM model
 * @return {String}   String of FOAM model
 */
function modelToStr(m) {
  if ( ! outputter ) {
    outputter = foam.json.Pretty;
    outputter.useTemplateLiterals = true;
  }

  return outputter.stringify(m).toString();
}

/**
 * Checks a restriction for enum properties
 * @param  {Object} doc DOM model
 * @return {Boolean}     true if enum, false otherwise
 */
function checkForEnum(doc) {
  for ( var key in doc.childNodes ) {
    var child = doc.childNodes[key];
    // check if nodeType is an element node
    if ( child.nodeType !== 1 ) continue;
    // check for enumeration
    if ( child.localName === 'enumeration' ) {
      return true;
    }
  }
  return false;
}

/**
 * Preparses the XSD definition file and creates a map
 * for simple types.
 * @param {DOMElement} docElement dom tree
 * @return {Map}                  a map of simple types
 */
function preparse(docElement) {
  // checks keys of doc
  for ( var key in docElement ) {
    var child = docElement[key];

    // check if nodeType is an element node
    if ( child.nodeType !== 1 ) continue;

    var name = child.getAttribute('name');

    // confirm element is a simple type
    if ( child.localName === 'simpleType' ) {
      for ( var childKey in child.childNodes ) {
        var grandChild = child.childNodes[childKey];

        // check if nodeType is an element node
        if ( grandChild.nodeType !== 1 ) continue;

        // check if restriction has been specified
        if ( grandChild.localName === 'restriction' ) {
          // check for enum
          if ( checkForEnum(grandChild) ) {
            simpleTypes[name] = 'foam.core.Enum';
          } else {
            var a = grandChild.attributes['0']
            if ( a.localName === 'base' ) simpleTypes[name] = types[a.value];
          }
        }
      }
    } else if ( child.localName === 'complexType' ) {
      for ( var childKey in child.childNodes ) {
        var grandChild = child.childNodes[childKey];
        // check if nodeType is an element node
        if ( grandChild.nodeType !== 1 ) continue;
        if ( grandChild.localName === 'simpleContent' ) {
          for ( var grandChildKey in grandChild.childNodes ) {
            var greatGrandChild = grandChild.childNodes[grandChildKey];
            if ( greatGrandChild.nodeType !== 1 ) continue;
          }
        }
      }
    }
  }
}

/**
 * Processes an XSD file and converts it to FOAM
 * @param  {String} file Raw string input from XSD file
 */
function processFile (file, filename) {
  let models = [];

  // parse the raw string to a DOM object
  var doc = new DOMParser().parseFromString(file);
  var docElement = doc.documentElement;

  // preparse all the simple types
  var children = docElement.childNodes;
  preparse(children);

  for ( var key in children ) {
    var child = children[key];

    // check if nodeType is an element node
    if ( child.nodeType !== 1 ) continue;

    var name = child.getAttribute('name');
    // create foam model
    var m = {
      package: packageName,
      name: name
    };

    // check iso20022 type & add documentation
    var type = iso20022Types[name];
    if ( type && type.documentation && packageName === 'net.nanopay.iso20022' ) {
      m.documentation = type.documentation;
    }

    // Add xmlns for ISO20022 messages
    if ( m.name === 'Document' ) {
      if ( ! m.implements ) m.implements = [];
      if ( ! m.properties ) m.properties = [];

      m.implements = [ 'net.nanopay.iso20022.Document' ];
      m.properties.push({
        class: 'String',
        name: 'xmlns',
        value: "urn:iso:std:iso:20022:tech:xsd:" + filename.replace(/\.[^/.]+$/, ""),
        xmlAttribute: true
      });
    }

    switch ( child.localName ) {
      case 'complexType':
        // process complex type
        var complexTypes = new complexType.init(simpleTypes, packageName);
        complexType.processComplexType(m, child);
        break;
      case 'simpleType':
        // process simple type
        simpleType.processSimpleType(m, child);
        break;
      default:
        break;
    }

    if ( m.type === 'enum' ) {
      delete m.type;
      models.push(genModel(m, 'ENUM'));
    } else {
      models.push(genModel(m));
    }
  }

  return models;
}

/**
 * Adds complex types to classes output file for classes.js
 * @param {Array} classes Array of complex classes to output
 * @param {Array} models  Models to add to classes.js
 */
function addToClasses(classes, models) {
  for ( var i = 0; i < models.length; i++ ) {
    var model = models[i];
    // ignore simple types
    if ( simpleTypes[model.name] && simpleTypes[model.name] !== 'foam.core.Enum' ) continue;
    // check if already in classes array
    if ( ! classes.some(function (element, index, array) {
      return element === ( packageName + '.' + model.name );
    })) {
      classes.push( packageName + '.' + model.name );
    }
  }
}

/**
 *
 * @param {FOAMModel} m         FOAM Model to be generated
 * @param {String}    modelType CLASS or ENUM, default CLASS
 * @return {Object}        Object containing model name and string representation
 */
function genModel(m, modelType) {
  modelType = modelType || 'CLASS';
  return {
    name: m.name,
    class: '// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!\nfoam.' +
            modelType + '(' + modelToStr(m) + ');'
  }
}

if ( files.length === 0 ) {
  files = fs.readdirSync(indir);
}

if ( ! fs.existsSync(outdir) ) {
  mkdirp.sync(outdir);
}

// generate classes
for ( var i = 0; i < files.length; i++ ) {
  var messageClasses = [];
  var file = fs.readFileSync(indir + files[i], 'utf8');
  let models = processFile(file, files[i]);

  // change generic document type to be name of ISO20022 message
  models = models.map(function (model) {
    if ( model.name === 'Document' ) {
      let name = files[i][0].toUpperCase() +
        files[i].slice(1, -4).replace(/\./g, '');
      model.name = name;
      model.class = model.class.replace('Document', name);
    }

    return model;
  });

  // add to classes
  addToClasses(messageClasses, models);
  classes = classes.concat(messageClasses);

  for ( var j = 0 ; j < models.length ; j++ ) {
    let model = models[j];
    writeFileIfUpdated(outdir + model.name + '.js', model.class);
  }
}

// generate classes.js file
if ( ! fs.existsSync(classesOutDir) ) {
  mkdirp.sync(classesOutDir);
}

let classesOutput = 'require(\'./files.js\');\n\n';
classesOutput += `var classes = ${modelToStr(classes)};
var abstractClasses = [];
var skeletons = [];
var proxies = [];
var blacklist = [];

module.exports = {
  classes: classes,
  abstractClasses: abstractClasses,
  skeletons: skeletons,
  proxies: proxies,
  blacklist: blacklist
};`

// create an array of the simple type classes
var simpleClasses = Object.keys(simpleTypes).filter(function (element, index, self) {
  return index == self.indexOf(element);
}).map(function (name) {
  return packageName + '.' + name;
});

// concat and filter the simple classes with the non-simple classes
var files = simpleClasses.concat(classes).filter(function (element, index, self) {
  return index == self.indexOf(element);
}).sort().map(function (file) {
  return { name: file.replace(/\./g, '/') };
})

// add refinements if they exist
if ( fs.existsSync(outdir + 'refinements.js') ) {
  files.push({ name: packagePath + '/refinements' });
}

writeFileIfUpdated(outdir + 'files.js', 'FOAM_FILES(' + stringify(files) + ')');
writeFileIfUpdated(classesOutDir + 'classes.js', classesOutput);
