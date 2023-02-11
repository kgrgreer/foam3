/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.xsd',
  name: 'XSDCompiler',

  constants: {
    TYPES: {
      'xs:boolean'      : 'foam.core.Boolean',
      'xs:date'         : 'foam.core.Date',
      'xs:dateTime'     : 'foam.core.Date',
      'xs:decimal'      : 'foam.core.Double',
      'xs:string'       : 'foam.core.String',
      'xs:time'         : 'foam.core.Date',
      'xs:base64Binary' : 'foam.core.String',
      'xs:int'          : 'foam.core.Int',
      'xs:long'         : 'foam.core.Long',
      'xs:short'        : 'foam.core.Int',
      'xs:double'       : 'foam.core.Double',
      'xsd:boolean'     : 'foam.core.Boolean',
      'xsd:date'        : 'foam.core.Date',
      'xsd:dateTime'    : 'foam.core.Date',
      'xsd:decimal'     : 'foam.core.Double',
      'xsd:string'      : 'foam.core.String',
      'xsd:time'        : 'foam.core.Date',
      'xsd:base64Binary': 'foam.core.String',
      'xsd:int'         : 'foam.core.Int',
      'xsd:long'        : 'foam.core.Long',
      'xsd:short'       : 'foam.core.Int',
      'xsd:double'      : 'foam.core.Double'
    }
  },

  properties: [
    'package',
    {
      name: 'xsd',
      adapt: function(_, v) { return v.trim(); }
    },
    {
      name: 'xsdPath'
    },
    {
      name: 'simpleTypes',
      factory: () => []
    },
    'xmlns',
    {
      name: 'enums',
      factory: function() { return new Map(); }
    }
  ],

  methods: [
    /*
     * START of SimpleType Support.
     */
    function escape(str) {
      return str.replace(/\\/g, '\\\\')
    },

    function addJavaAssertValue(m) {
      if ( ! m.properties ) m.properties = [];

      if ( m.extends === 'foam.core.String' ) {
        m.properties.push({
          name: 'javaAssertValue',
          factory: function () {
            var toReturn = '';

            if ( this.minLength || this.minLength === 0 ) {
              toReturn +=
  `if ( val.length() < ` + this.minLength + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }\n`;
            }

            if ( this.maxLength || this.maxLength === 0 ) {
              toReturn +=
  `if ( val.length() > ` + this.maxLength + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }\n`;
            }

            if ( this.pattern ) {
              toReturn +=`foam.util.SafetyUtil.assertPattern(val, "${this.pattern}", "${this.name}");\n`;
            }
            return toReturn;
          }
        });
      } else if ( m.extends === 'foam.core.Float' ) {
        m.properties.push({
          name: 'javaAssertValue',
          factory: function () {
            var toReturn = '';

            if ( this.minInclusive || this.minInclusive === 0 ) {
              toReturn +=
  `if ( val < ` + this.minInclusive + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }\n`;
            }

            if ( this.minExclusive || this.minExclusive === 0 ) {
              toReturn +=
  `if ( val <= ` + this.minInclusive + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }\n`;
            }

            if ( this.maxInclusive || this.maxInclusive === 0 ) {
              toReturn +=
  `if ( val > ` + this.maxInclusive + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }\n`;
            }

            if ( this.maxExclusive || this.maxExclusive === 0 ) {
              toReturn +=
  `if ( val >= ` + this.maxExclusive + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }\n`;
            }

            if ( this.totalDigits || this.fractionDigits ) {
              toReturn +=
  `String str = Double.toString(val);
  int length = str.length();
  boolean hasDecimal = str.contains(".");\n`

              if ( this.totalDigits ) {
                toReturn +=
  `if ( hasDecimal ) length -= 1;
  if ( length > ` + this.totalDigits + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }\n`
              }

              if ( this.fractionDigits ) {
                toReturn +=
  `if ( hasDecimal ) {
    String decimals = str.split("\\\\.")[1];
    if ( decimals.length() > ` + this.fractionDigits + ` ) {
      throw new IllegalArgumentException("${this.name}");
    }
  }\n`
              }
            }

            return toReturn;
          }
        });
      }
    },

    function addAssertValue(m) {
      if ( ! m.properties ) m.properties = [];

      if ( m.extends === 'foam.core.String' ) {
        m.properties.push({
          name: 'assertValue',
          value: function (value, prop) {
            if ( ( prop.minLength || prop.minLength === 0 ) && value.length < prop.minLength )
              throw new Error(prop.name);
            if ( ( prop.maxLength || prop.maxLength === 0 ) && value.length > prop.maxLength )
              throw new Error(prop.name);
            if ( prop.pattern && ! new RegExp(prop.pattern, 'g').test(value) )
              throw new Error(prop.name);
          }
        });
      } else if ( m.extends === 'foam.core.Float' ) {
        m.properties.push({
          name: 'assertValue',
          value: function (value, prop) {
            if ( ( prop.minInclusive || prop.minInclusive === 0 ) && value < prop.minInclusive )
              throw new Error(prop.name);
            if ( ( prop.minExclusive || prop.minExclusive === 0 ) && value <= prop.minExclusive )
              throw new Error(prop.name);
            if ( ( prop.maxInclusive || prop.maxInclusive === 0 ) && value > prop.maxInclusive )
              throw new Error(prop.name);
            if ( ( prop.maxExclusive || prop.maxExclusive === 0 ) && value >= prop.maxExclusive )
              throw new Error(prop.name);

            if ( prop.totalDigits || prop.fractionDigits ) {
              var str = value + '';
              var length = str.length;
              var hasDecimal = str.indexOf('.') !== -1;

              if ( prop.totalDigits ) {
                if ( hasDecimal ) length -= 1;
                if ( length > prop.totalDigits )
                  throw new Error(prop.name);
              }

              if ( prop.fractionDigits && hasDecimal ) {
                var decimals = str.split('.')[1];
                if ( decimals.length > prop.fractionDigits )
                  throw new Error(prop.name);
              }
            }
          }
        });
      }
    },

    /**
     * Process an enum type
     * @param  {Object} m   FOAM model
     * @param  {Object} doc DOM model
     */
    function processEnum(m, doc) {
      m.type   = 'enum';
      m.values = [];

      // add the enum values
      for ( var key in doc ) {
        var child = doc[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1) continue;
        var value = child.getAttribute('value');
        var duplicate = false;
        for ( var idx in m.values ) {
          var val = m.values[idx];
          if ( val.name.toUpperCase() === value.toUpperCase() ) {
            // console.info("processEnum,duplicate",value);
            duplicate = true;
            continue;
          }
        }
        if ( duplicate ) continue;
        var label = value;
        if ( Number.isInteger(value[0] - '0') ) value = '_' + value;
        m.values.push({
          name: value,
          label: label
        });
      }
      this.enums.set(m.name, m);
    },

    /**
     * Processes a restriction tag & it's children
     * @param  {Object} m   FOAM model
     * @param  {Object} doc DOM model
     */
    function processRestriction(m, doc) {
      // fetch the child nodes
      var children = doc.childNodes;
      if ( ! m.extends ) m.extends = this.TYPES[doc.getAttribute('base')];

      // get the properties for the simple type
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;

        // handle enum
        if ( child.localName === 'enumeration' ) {
          delete m.extends;
          this.processEnum (m, children);
          break;
        }

        // add properties array if not already present
        if ( ! m.properties ) m.properties = [];

        // get the value
        var value = child.getAttribute('value');

        // check if value is numeric or not
        var isNumeric = /^\d+$/.test(value);

        // if pattern, prefix carrot and append dollar sign
        // because for xsd schema these are implicit
        if ( child.localName === 'pattern' ) {
          value = '^' + value + '$';
        }

        // escape regex pattern
        if ( child.localName === 'pattern' ) {
          value = this.escape(value);
        }

        // add the property
        m.properties.push({
          class: isNumeric ? 'Int' : 'String',
          name: child.localName,
          value: isNumeric ? parseInt(value, 10) : value
        });
      }

      // add value assertions for JavaScript
      this.addAssertValue(m);

      // add value assertions for Java
      this.addJavaAssertValue(m);
    },

    /**
     * Processes a union
     * @param  {Object} m   FOAM model
     * @param  {Object} doc DOM model
     */
    function processUnion(m, doc) {
      // split memberTypes and
      var keys = new Set();
      var memberTypes = doc.getAttribute('memberTypes').split(' ');
      for ( var idx in memberTypes ) {
        var mt = memberTypes[idx];
        var st = this.simpleTypes[mt];
        if ( st ) {
          // all the types to be joined need to be the same type
          this.simpleTypes[m.name] = st;
          if ( st === 'foam.core.Enum' ) {
            var e = this.enums.get(mt);
            m.values = m.values || [];
            m.values = m.values.concat(e.values);
            // FIXME: just add the first. The concatenation
            // cannot have duplicates else the Enum class creation
            // will fail - silently.
            break;
          }
        } else {
          console.warn("processUnion,not found", mt);
        }
      }

      if ( m.values ) {
        delete m.extends;
        m.type = 'enum';
        this.enums.set(m.name, m);
      }
    },

    /**
     * Processes a simple type and it's children
     * @param  {Object} m   FOAM model
     * @param  {Object} doc DOM model
     */
    function processSimpleType(m, doc) {
      var children = doc.childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;
        switch ( child.localName ) {
          case 'restriction':
            // process restriction tags
            this.processRestriction(m, child);
            break;
          case 'union':
            this.processUnion(m, child);
            break;
        }
      }
    },

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
    },

    /*
     * START of ComplexType Support.
     */

    /**
     * Gets the property type using the type and simpleTypes maps.
     * Defaults to FObjectProperty
     * @param   {String}    baseType     The type indicated in the xsd
     * @returns {String}    The computed type.
     */
    function getPropType(baseType) {
      if ( this.simpleTypes[baseType] ) return this.package + '.' + baseType;
      return this.TYPES[baseType] || 'FObjectProperty';
    },

    /**
     * Process a choice type
     * @param  {Object} m   FOAM model
     * @param  {Object} doc DOM model
     */
    function processChoice(m, doc) {
      m.type = 'choice';
      // add properties if it doesn't exist
      if ( ! m.properties ) m.properties = [];
      var children = doc.childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;
        var name = child.getAttribute('name');
        var type = child.getAttribute('type');
        var classType = this.getPropType(type);

        let property = {
          class: classType,
          name: this.toPropertyName(name),
          shortName: name
        };

        if ( classType === 'FObjectProperty' ) {
          property.of = this.package + '.' + type;
        }

        // check if enum
        if ( this.simpleTypes[child.getAttribute('type')] === 'foam.core.Enum' ) {
          property.class = 'foam.core.Enum';
          property.of = this.package + '.' + child.getAttribute('type');
        }

        property.preSet = eval(`(function (_, value) { this.instance_ = {}; return value; })`)
        m.properties.push(property);
      }
    },

    /**
     * Process an extension simple content type
     * @param  {Object} m     FOAM model
     * @param  {Object} doc   DOM model
     */
    function processSimpleContentExtension(m, doc) {
      // modify extends property
      var children = doc.childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;
        // add properties array if not already present
        if ( ! m.properties ) m.properties = [];
        // create property

        let name = child.getAttribute('name');
        let property = {
          class: this.getPropType(child.getAttribute('type')),
          name: this.toPropertyName(name),
          shortName: name
        };

        if ( child.localName === 'attribute' ) {
          property.xmlAttribute = true;
        }

        // add "of" property if class is FObjectProperty
        if ( property.class === 'FObjectProperty' ) {
          property.of = this.package + '.' + child.getAttribute('type');
        }

        // add property to array
        m.properties.push(property);
      }

      let valueProp = {
        class: this.getPropType(doc.getAttribute('base')),
        name: 'text',
        xmlTextNode: true
      };

      if ( valueProp.class === 'FObjectProperty' ) {
        valueProp.of = this.package + '.' + doc.getAttribute('base');
      }

      m.properties.push(valueProp);
    },

    /**
     * Process a simple content type
     * @param  {Object} m     FOAM model
     * @param  {Object} doc   DOM model
     */
    function processSimpleContent(m, doc) {
      var children = doc.childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;
        switch ( child.localName ) {
          case 'extension':
            this.processSimpleContentExtension (m, child);
            break;
        }
      }
    },

    function createProperty(modelName, type, name) {
      return {
        class: this.getPropType(type),
        name: this.toPropertyName(name),
        shortName: name
      };
    },

    /**
     * Process a sequence element type
     * @param  {Object} m     FOAM model
     * @param  {Object} doc   DOM model
     */
    function processSequenceElement(m, doc) {
      // add properties array if not already present
      if ( ! m.properties ) m.properties = [];

      let maxOccurs = doc.getAttribute('maxOccurs') || 1;
      // convert to int if not set to "unbounded"
      if ( maxOccurs !== 'unbounded') maxOccurs = parseInt(maxOccurs, 10);
      let minOccurs = parseInt(doc.getAttribute('minOccurs'), 10) || 1;

      // group ref
      let ref = doc.getAttribute('ref');
      if ( ref ) {
        // FIXME: ref is a forward reference, how to defer?
        m.properties.push({
          class: 'StringArray',
          name: this.toPropertyName(ref),
          shortName: ref
        });
        return;
      }

      let property  = this.createProperty(m.name, doc.getAttribute('type'), doc.getAttribute('name'));

      /*
      // for ISO 20022 properties convert short name to long name and add documentation
      let iso20022Type = iso20022Types[m.name];
      if ( iso20022Type && iso20022Type.properties && this.package === 'net.nanopay.iso20022' ) {
        var iso20022Props = iso20022Type.properties;
        var iso20022Prop  = iso20022Props[doc.getAttribute('name')];

        if ( iso20022Prop && iso20022Prop.name ) {
          property.name = iso20022Prop.name;
          property.shortName = doc.getAttribute('name');
          property.documentation = iso20022Prop.documentation;
        }
      }
      */

      // check if enum
      if ( this.simpleTypes[doc.getAttribute('type')] === 'foam.core.Enum' ) {
        property.class = 'foam.core.Enum'
      }

      // change classType to appropriate array class if maxOccurs is greater than 1
      if ( maxOccurs > 1 || maxOccurs === 'unbounded' ) {
        if ( property.class === 'FObjectProperty' ) {
          property.class = 'FObjectArray';
        } else if ( this.simpleTypes[doc.getAttribute('type')] == 'foam.core.String' ||
                    property.class === 'String' ) {
          property.class = 'StringArray'
        } else {
          property.class = 'Array';
        }
      }

      // add "of" property if class is FObjectProperty or FObjectArray
      if ( property.class === 'FObjectProperty' ||
           property.class === 'FObjectArray' ||
           property.class === 'foam.core.Enum' ) {
        property.of = this.package + '.' + doc.getAttribute('type');
      }

      // add require false if nillable="true" is set
      var nillable = doc.getAttribute('nillable');
      if ( nillable === null || nillable === '' ) {
        property.required = false;
      }

      // add new property
      m.properties.push(property);
    },

    /**
     * Process a sequence type
     * @param  {Object} m     FOAM model
     * @param  {Object} doc   DOM model
     */
    function processSequence(m, doc) {
      var children = doc.childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;
        switch ( child.localName ) {
          case 'element':
            this.processSequenceElement(m, child);
            break;
          case 'choice':
            this.processChoice(m, child);
            break;
          // group ref
          case 'group':
            this.processSequenceElement(m, child);
            break;
        }
      }
    },

    /**
     * Process a complex type and it's children
     * @param  {Object} m     FOAM model
     * @param  {Object} doc   DOM model
     */
    function processComplexType(m, doc) {
      var children = doc.childNodes;
      for ( var key in children ) {
        var child = children[key];
        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;
        switch ( child.localName ) {
          case 'choice':
            this.processChoice(m, child);
            break;
          case 'simpleContent':
            this.processSimpleContent(m, child);
            break;
          case 'sequence':
            this.processSequence(m, child);
            break;
          case 'all':
            this.processSequence(m, child);
            break;
        }
      }
    },

    /*
     * START of General Support.
     */

    /**
     * Preparses the XSD definition file and creates a map
     * for simple types.
     * @param {DOMElement} docElement dom tree
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
              if ( this.checkForEnum(grandChild) ) {
                this.simpleTypes[name] = 'foam.core.Enum';
              } else {
                var a = grandChild.attributes['0']
                if ( a.localName === 'base' ) this.simpleTypes[name] = this.TYPES[a.value];
              }
            }

            if ( grandChild.localName === 'union' ) {
              // REVIEW: no other assumption can be made
              this.simpleTypes[name] = 'foam.core.Enum';
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
        } else if ( child.localName === 'group' ) {
          for ( var childKey in child.childNodes ) {
            var grandChild = child.childNodes[childKey];
            // check if nodeType is an element node
            if ( grandChild.nodeType !== 1 ) continue;
            if ( grandChild.localName === 'choice' ) {
              for ( var grandChildKey in grandChild.childNodes ) {
                var greatGrandChild = grandChild.childNodes[grandChildKey];
                if ( greatGrandChild.nodeType !== 1 ) continue;
              }
            }
          }
        } else {
          console.log("preparse, not parsed", child.localName);
        }
      }
    },

    /**
     *
     * @param {FOAMModel} m         FOAM Model to be generated
     * @param {String}    modelType CLASS or ENUM, default CLASS
     * @return {Object}   Object containing model name and string representation
     */
    function genModel(m, modelType) {
      modelType = modelType || 'CLASS';
      return foam[modelType](m);
    },

    function createClass(package, name) {
      return {
        package: package,
        name: name
      };
    },

    function compile() {
      var parser = new (globalThis.DOMParser || require('xmldom').DOMParser)();

      var doc = parser.parseFromString(this.xsd, 'text/xml');
      var docElement = doc.documentElement;
      // preparse all the simple types
      var children = docElement.childNodes;

      this.xmlns = docElement._nsMap[''] || '';

      this.preparse(children);

      for ( var key in children ) {
        var child = children[key];

        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;

        var name = child.getAttribute('name');
        this.process(child, name);
     }
    },

    function compileAll() {
      var sep = require('path').sep;
      var fs = require('fs');
      var DOMParser = (globalThis.DOMParser || require('xmldom').DOMParser);
      var elements = new Map();

      this.xmlns = '';

      var path = __dirname + sep + this.xsdPath; // .replace(/\//g, sep);
      fs.readdirSync(path).forEach(file => {
        var f = path+sep+file;
        // console.info('file', f);
        var text = fs.readFileSync(f, 'utf8').trim();
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');
        var docElement = doc.documentElement;
        var children = docElement.childNodes;

        // preparse all the simple types
        this.preparse(children);

        Array.from(children).forEach(child => {
          if ( ! child.nodeType ||
               child.nodeType !== 1 ) {
            return;
          }
          var name = child.getAttribute && child.getAttribute("name");
          if ( ! name ) {
            return;
          }
          elements.set(name, child);
        });
      });

      elements.forEach((child, name) => {
        this.process(child, name);
      });
    },

    function process(child, name) {
      var id   = this.package + '.' + name;

      // Avoid duplicating models which appear in more than one XSD file (like ISO20022)
      if ( name !== 'Document' &&
           foam.maybeLookup(id) ) return;

      // create foam model
      var m = this.createClass(this.package, name);

      switch ( child.localName ) {
      case 'complexType':
        // process complex type
        this.processComplexType(m, child);
        m.flags = [ "java", "complexType" ];
        break;
      case 'simpleType':
        // process simple type
        this.processSimpleType(m, child);
        m.flags = m.extends ? [] : [ "java", "simpleType" ];
        break;
      case 'group':
        // process group type
        this.processSequence(m, child);
        m.flags = m.extends ? [] : [ "java", "groupType" ];
        break;
      default:
        break;
      }

      if ( m.type === 'enum' ) {
        delete m.type;
        this.genModel(m, 'ENUM');
      } else {
        this.genModel(m);
      }
    },

    function toPropertyName(name) {
      var propName = name.replaceAll("-", "_");
      if ( propName[0] !== propName[0].toLowerCase() ) {
        propName = name[0].toLowerCase() + propName.substring(1);
      }
      return propName;
    }
  ]
});

foam.XSD = function(model) {
  var compiler = foam.xsd.XSDCompiler.create(model);
  if ( compiler.xsdPath ) {
    compiler.compileAll();
  } else if ( compiler.xsd ) {
    compiler.compile();
  } else {
    throw new Error("compiler neither xsd or xsdPath set");
  }
};
