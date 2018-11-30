'use strict';

let types = require('./typeMapping')
var iso20022Types = require('./iso20022Types');

var simpleTypes;
var packageName;

function init (simpleTypesMap, name) {
  simpleTypes = simpleTypesMap;
  packageName = name;
}

module.exports = {
  init,
  /**
   * Gets the property type using the type and simpleTypes maps.
   * Defaults to FObjectProperty
   * @param   {String}    baseType     The type indicated in the xsd
   * @returns {String}    The computed type.
   */
  getPropType: function (baseType) {
      if ( simpleTypes[baseType] ) return packageName + '.' + baseType;
      return types[baseType] || 'FObjectProperty';
  },

  /**
   * Process a choice type
   * @param  {Object} m   FOAM model
   * @param  {Object} doc DOM model
   */
  processChoice: function (m, doc) {
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
        name: name,
        shortName: name
      };

      if ( classType === 'FObjectProperty' ) {
        property.of = packageName + '.' + type;
      }

      // check if enum
      if ( simpleTypes[child.getAttribute('type')] === 'foam.core.Enum' ) {
        property.class = 'foam.core.Enum'
        property.of = packageName + '.' + child.getAttribute('type');
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
  processSimpleContentExtension: function (m, doc) {
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
        name: name,
        shortName: name
      };

      if ( child.localName === 'attribute' ) {
        property.xmlAttribute = true;
      }

      // add "of" property if class is FObjectProperty
      if ( property.class === 'FObjectProperty' ) {
        property.of = packageName + '.' + child.getAttribute('type');
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
      valueProp.of = packageName + '.' + doc.getAttribute('base');
    }

    m.properties.push(valueProp);
  },

  /**
   * Process a simple content type
   * @param  {Object} m     FOAM model
   * @param  {Object} doc   DOM model
   */
  processSimpleContent: function (m, doc) {
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

  /**
   * Process a sequence element type
   * @param  {Object} m     FOAM model
   * @param  {Object} doc   DOM model
   */
  processSequenceElement: function (m, doc) {
    // add properties array if not already present
    if ( ! m.properties ) m.properties = [];

    let maxOccurs = doc.getAttribute('maxOccurs') || 1;
    // convert to int if not set to "unbounded"
    if ( maxOccurs !== 'unbounded') maxOccurs = parseInt(maxOccurs, 10);
    let minOccurs = parseInt(doc.getAttribute('minOccurs'), 10) || 1;


    let property = {
      class: this.getPropType(doc.getAttribute('type')),
      name: doc.getAttribute('name')
    };

    // for ISO 20022 properties convert short name to long name and add documentation
    let iso20022Type = iso20022Types[m.name];
    if ( iso20022Type && iso20022Type.properties && packageName === 'net.nanopay.iso20022' ) {
      var iso20022Props = iso20022Type.properties;
      var iso20022Prop = iso20022Props[doc.getAttribute('name')];

      if ( iso20022Prop && iso20022Prop.name ) {
        property.name = iso20022Prop.name;
        property.shortName = doc.getAttribute('name');
        property.documentation = iso20022Prop.documentation;
      }
    }

    // check if enum
    if ( simpleTypes[doc.getAttribute('type')] === 'foam.core.Enum' ) {
      property.class = 'foam.core.Enum'
    }

    // change classType to appropriate array class if maxOccurs is greater than 1
    if (maxOccurs > 1 || maxOccurs === 'unbounded') {
      if ( property.class === 'FObjectProperty' ) {
        property.class = 'FObjectArray';
      } else if ( simpleTypes[doc.getAttribute('type')] == 'foam.core.String' ||
                  property.class === 'String' ) {
        property.class = 'StringArray'
      } else {
        property.class = 'Array';
      }
    }

    // add "of" property if class is FObjectProperty or FObjectArray
    if ( property.class === 'FObjectProperty' || property.class === 'FObjectArray' || property.class === 'foam.core.Enum' ) {
      property.of = packageName + '.' + doc.getAttribute('type');
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
  processSequence: function (m, doc) {
    var children = doc.childNodes;
    for ( var key in children ) {
      var child = children[key];
      // check if nodeType is an element node
      if ( child.nodeType !== 1 ) continue;
      switch ( child.localName ) {
        case 'element':
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
  processComplexType: function (m, doc) {
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
      }
    }
  }
}
