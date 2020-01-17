'use strict';

let types = require('./typeMapping');

module.exports = {

  escape: function (str) {
    return str.replace(/\\/g, '\\\\')
  },

  addJavaAssertValue: function (m) {
    if ( ! m.properties ) m.properties = [];

    if ( m.extends === 'foam.core.String' ) {
      m.properties.push({
        name: 'javaAssertValue',
        factory: function () {
          var toReturn = ``;

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
            toReturn +='foam.util.SafetyUtil.assertPattern(val, "${this.pattern}", "${this.name}");\n';
          }
          return toReturn;
        }
      });
    } else if ( m.extends === 'foam.core.Float' ) {
      m.properties.push({
        name: 'javaAssertValue',
        factory: function () {
          var toReturn = ``;

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

  addAssertValue: function (m) {
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
  processEnum: function (m, doc) {
    m.type = 'enum';
    m.values = [];

    // add the enum values
    for ( var key in doc ) {
      var child = doc[key];
      // check if nodeType is an element node
      if ( child.nodeType !== 1) continue;
      var value = child.getAttribute('value');
      var label = value;
      if ( Number.isInteger(value[0] - '0') ) value = '_' + value;
      m.values.push({
        name: value,
        label: label
      })
    }
  },

  /**
   * Processes a restriction tag & it's children
   * @param  {Object} m   FOAM model
   * @param  {Object} doc DOM model
   */
  processRestriction: function (m, doc) {
    // fetch the child nodes
    var children = doc.childNodes;
    if ( ! m.extends ) m.extends = types[doc.getAttribute('base')];

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
   * Processes a simple type and it's children
   * @param  {Object} m   FOAM model
   * @param  {Object} doc DOM model
   */
  processSimpleType: function (m, doc) {
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
      }
    }
  }
}
