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
      'xs:double'       : 'foam.core.Double'
    }
  },

  properties: [
    'package',
    {
      name: 'xsd',
      adapt: function(_, v) { return v.trim(); }
    },
    {
      name: 'simpleTypes',
      factory: () => []
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
          property.of = this.package + '.' + type;
        }

        // check if enum
        if ( this.simpleTypes[child.getAttribute('type')] === 'foam.core.Enum' ) {
          property.class = 'foam.core.Enum'
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
          name: name,
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


      let property = {
        class: this.getPropType(doc.getAttribute('type')),
        name: doc.getAttribute('name')
      };

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
      if (maxOccurs > 1 || maxOccurs === 'unbounded') {
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
      if ( property.class === 'FObjectProperty' || property.class === 'FObjectArray' || property.class === 'foam.core.Enum' ) {
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

    function compile() {
      var parser = globalThis.DOMParser ? new DOMParser() : require('xmldom').DOMParser();

      var doc = parser.parseFromString(this.xsd, 'text/xml');
      var docElement = doc.documentElement;
      // preparse all the simple types
      var children = docElement.childNodes;

      this.preparse(children);

      let models = [];

      for ( var key in children ) {
        var child = children[key];

        // check if nodeType is an element node
        if ( child.nodeType !== 1 ) continue;

        var name = child.getAttribute('name');
        // create foam model
        var m = {
          package: this.package,
          name: name
        };

        /*
        // check iso20022 type & add documentation
        var type = iso20022Types[name];
        if ( type && type.documentation && this.package === 'net.nanopay.iso20022' ) {
          m.documentation = type.documentation;
        }
        */

        /*
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
        */

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
          default:
            break;
        }

        if ( m.type === 'enum' ) {
          delete m.type;
          models.push(this.genModel(m, 'ENUM'));
        } else {
          models.push(this.genModel(m));
        }
      }
    }
  ]
});

foam.XSD = function(model) {
  foam.xsd.XSDCompiler.create(model).compile();
};

foam.XSD({
    package: 'net.nanopay.fx.ascendantfx.model',
    xsd: `<?xml version="1.0" encoding="UTF-8"?>
    <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tns="http://www.afx.com" elementFormDefault="qualified" targetNamespace="http://www.afx.com">
      <xs:complexType name="GetQuoteRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="Payment" nillable="true" type="Deal" />
          <xs:element minOccurs="0" name="TotalNumberOfPayment" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="Deal">
        <xs:sequence>
          <xs:element minOccurs="0" name="Direction" type="Direction" />
          <xs:element minOccurs="0" name="Fee" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorType" nillable="true" type="OriginatorType" />
          <xs:element minOccurs="0" name="PaymentMethod" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentSequenceNo" type="xs:int" />
          <xs:element minOccurs="0" name="Rate" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="TotalSettlementAmount" type="xs:decimal" />
        </xs:sequence>
      </xs:complexType>
      <xs:simpleType name="Direction">
        <xs:restriction base="xs:string">
          <xs:enumeration value="BUY" />
          <xs:enumeration value="SELL" />
        </xs:restriction>
      </xs:simpleType>
      <xs:simpleType name="OriginatorType">
        <xs:restriction base="xs:string">
          <xs:enumeration value="CONSUMER" />
          <xs:enumeration value="BUSINESS" />
        </xs:restriction>
      </xs:simpleType>
      <xs:complexType name="GetQuoteResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="Payment" nillable="true" type="Deal" />
          <xs:element minOccurs="0" name="Quote" nillable="true" type="Quote" />
          <xs:element minOccurs="0" name="TotalNumberOfPayment" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="Quote">
        <xs:sequence>
          <xs:element minOccurs="0" name="ExpiryTime" type="xs:dateTime" />
          <xs:element minOccurs="0" name="ID" type="xs:long" />
          <xs:element minOccurs="0" name="QuoteDateTime" type="xs:dateTime" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="AcceptQuoteRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="QuoteID" type="xs:long" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="AcceptQuoteResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="QuoteID" type="xs:long" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="SubmitDealRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PaymentDetail" nillable="true" type="DealDetail" />
          <xs:element minOccurs="0" name="QuoteID" type="xs:long" />
          <xs:element minOccurs="0" name="TotalNumberOfPayment" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="DealDetail">
        <xs:sequence>
          <xs:element minOccurs="0" name="Direction" type="Direction" />
          <xs:element minOccurs="0" name="Fee" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="InternalNotes" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="NotesToPayee" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentMethod" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentSequenceNo" type="xs:int" />
          <xs:element minOccurs="0" name="Rate" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="TotalSettlementAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="payee" nillable="true" type="Payee" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="Payee">
        <xs:sequence>
          <xs:element minOccurs="0" name="OriginatorAccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorPostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorType" nillable="true" type="OriginatorType" />
          <xs:element minOccurs="0" name="PayeeAccountIBANNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankBankCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankPostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankRoutingCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankRoutingType" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankSwiftCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeEmail" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeID" type="xs:int" />
          <xs:element minOccurs="0" name="PayeeInterBankAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankBankCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankPostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankRoutingCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankRoutingCodeType" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeePostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeReference" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeSendingBankInstructions" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="SubmitDealResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="DealID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PaymentDetail" nillable="true" type="DealDetail" />
          <xs:element minOccurs="0" name="TotalNumberOfPayment" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="SubmitIncomingDealRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PaymentDetail" nillable="true" type="SubmitIncomingDealDetail" />
          <xs:element minOccurs="0" name="QuoteID" type="xs:long" />
          <xs:element minOccurs="0" name="TotalNumberOfPayment" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="SubmitIncomingDealDetail">
        <xs:sequence>
          <xs:element minOccurs="0" name="Fee" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="InternalReference" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentMethod" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentSequenceNo" type="xs:int" />
          <xs:element minOccurs="0" name="Rate" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="TotalSettlementAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="payee" nillable="true" type="SubmitIncomingPayee" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="SubmitIncomingPayee">
        <xs:sequence>
          <xs:element minOccurs="0" name="SenderAccountIBANNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderBankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderID" type="xs:int" />
          <xs:element minOccurs="0" name="SenderName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderPostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SenderProvince" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="SubmitIncomingDealResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="DealID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="InstructionToSender" nillable="true" type="InstructionToSender" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PaymentDetail" nillable="true" type="SubmitIncomingDealDetail" />
          <xs:element minOccurs="0" name="TotalPayment" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="InstructionToSender">
        <xs:sequence>
          <xs:element minOccurs="0" name="AccountAddress" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AccountName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AccountNo" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Amount" type="xs:decimal" />
          <xs:element minOccurs="0" name="BankAddress" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="CurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="LocalRoutingCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Memo1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Memo2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SwiftCode" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetAccountBalanceRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetAccountBalanceResult">
        <xs:sequence>
          <xs:element minOccurs="0" maxOccurs="unbounded" name="Account" nillable="true" type="AccountDetails" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="NumberOfAccount" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="AccountDetails">
        <xs:sequence>
          <xs:element minOccurs="0" name="AccountCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BalanceAmount" type="xs:decimal" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="ValidateIBANRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="IBANNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="ValidateIBANResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="Address" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BeneficiaryBankCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BeneficiaryBankCountryId" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BeneficiaryBankRoutingCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="City" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Country" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="CountryCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="IBANNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="RoutingCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SwiftCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Valid" type="xs:boolean" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PayeeOperationRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PayeeDetail" nillable="true" type="PayeeDetail" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PayeeDetail">
        <xs:sequence>
          <xs:element minOccurs="0" name="CurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorAccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorPostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OriginatorType" nillable="true" type="OriginatorType" />
          <xs:element minOccurs="0" name="PayeeAccountIBANNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankBankCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankPostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankRoutingCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankRoutingType" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeBankSwiftCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeEmail" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeID" type="xs:int" />
          <xs:element minOccurs="0" name="PayeeInterBankAddress1" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankAddress2" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankBankCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankCity" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankCountryID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankPostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankRoutingCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInterBankRoutingCodeType" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInternalReference" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeePostalCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeProvince" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeReference" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeSendingBankInstructions" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentMethod" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PayeeOperationResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeId" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeInternalReference" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PayeeName" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetPayeeInfoRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PayeeDetail" nillable="true" type="PayeeDetail" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetPayeeInfoResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="NumberOfPayees" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PayeeDetail" nillable="true" type="PayeeDetail" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PostDealRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PostDealResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="DealPostCallID" type="xs:int" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="Deals" nillable="true" type="DealDetails" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="NumberOfDeals" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="DealDetails">
        <xs:sequence>
          <xs:element minOccurs="0" name="AFXDealID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AFXPaymentID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ApprovedBy" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="CallDateTime" type="xs:dateTime" />
          <xs:element minOccurs="0" name="DebitAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="FXAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="FXCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="InitiatedBy" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentReference" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Rate" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="TransactionDate" type="xs:dateTime" />
          <xs:element minOccurs="0" name="YourInternalReference" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PostDealConfirmationRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="AFXDealID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AFXPaymentID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="DealPostCallID" type="xs:int" />
          <xs:element minOccurs="0" name="DealPostConfirm" type="DealPostConfirm" />
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:simpleType name="DealPostConfirm">
        <xs:restriction base="xs:string">
          <xs:enumeration value="OK" />
          <xs:enumeration value="CANCEL" />
        </xs:restriction>
      </xs:simpleType>
      <xs:complexType name="PostDealConfirmationResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="AFXDealID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AFXPaymentID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="DealPostCallID" type="xs:int" />
          <xs:element minOccurs="0" name="DealPostConfirm" type="DealPostConfirm" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PayeeInfoValidationRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="PayeeDetail" nillable="true" type="PayeeDetail" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="PayeeInfoValidationResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="NumberOfInValidPayees" type="xs:int" />
          <xs:element minOccurs="0" name="NumberOfPayees" type="xs:int" />
          <xs:element minOccurs="0" name="NumberOfValidPayees" type="xs:int" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="ValidationDetail" nillable="true" type="ValidationDetails" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="ValidationDetails">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="ErrorDetail" nillable="true" type="ErrorDetails" />
          <xs:element minOccurs="0" name="PayeeDetail" nillable="true" type="PayeeDetail" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="ErrorDetails">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="FieldName" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetAccountActivityRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="AccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Factor" type="xs:int" />
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Month" type="xs:int" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Year" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetAccountActivityResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="AccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ClosingBalance" type="xs:decimal" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Factor" type="xs:int" />
          <xs:element minOccurs="0" name="Month" type="xs:int" />
          <xs:element minOccurs="0" name="NumberOfTransaction" type="xs:int" />
          <xs:element minOccurs="0" name="OpeningBalance" type="xs:decimal" />
          <xs:element minOccurs="0" maxOccurs="unbounded" name="Transaction" nillable="true" type="TransactionDetails" />
          <xs:element minOccurs="0" name="Year" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="TransactionDetails">
        <xs:sequence>
          <xs:element minOccurs="0" name="Balance" type="xs:decimal" />
          <xs:element minOccurs="0" name="Deposit" type="xs:decimal" />
          <xs:element minOccurs="0" name="Narration" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="TransactionDate" type="xs:dateTime" />
          <xs:element minOccurs="0" name="TransactionSequenceNo" type="xs:int" />
          <xs:element minOccurs="0" name="Withdrawal" type="xs:decimal" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="IncomingFundStatusCheckRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="DealID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="IncomingFundStatusCheckResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="DealID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Status" type="xs:int" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetQuoteTBARequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="Fee" type="xs:decimal" />
          <xs:element minOccurs="0" name="FromAccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="FxAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentMethod" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Rate" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ToAccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="TotalSettlementAmount" type="xs:decimal" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="GetQuoteTBAResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Fee" type="xs:decimal" />
          <xs:element minOccurs="0" name="FromAccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="FxAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="FxCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="PaymentMethod" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Quote" nillable="true" type="Quote" />
          <xs:element minOccurs="0" name="Rate" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementAmount" type="xs:decimal" />
          <xs:element minOccurs="0" name="SettlementCurrencyID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ToAccountNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="TotalSettlementAmount" type="xs:decimal" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="AcceptAndSubmitDealTBAResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="DealId" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="DealNumber" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="QuoteID" type="xs:long" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="IncomingPaymentInstructionRequest">
        <xs:sequence>
          <xs:element minOccurs="0" name="CurrencyCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="MethodID" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="OrgID" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
      <xs:complexType name="IncomingPaymentInstructionResult">
        <xs:sequence>
          <xs:element minOccurs="0" name="AccountAddress" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AccountName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="AccountNo" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BankAddress" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="BankName" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="CurrencyCode" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="ErrorCode" type="xs:long" />
          <xs:element minOccurs="0" name="ErrorMessage" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="Reference" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="RoutingTransit" nillable="true" type="xs:string" />
          <xs:element minOccurs="0" name="SwiftCode" nillable="true" type="xs:string" />
        </xs:sequence>
      </xs:complexType>
    </xs:schema>`
});
