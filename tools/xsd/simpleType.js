'use strict';

let types = require('./typeMapping');

module.exports = {

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
      // add the property
      m.properties.push({
        class: isNumeric ? 'Int' : 'String',
        name: child.localName,
        value: isNumeric ? parseInt(value, 10) : value
      });
    }
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
