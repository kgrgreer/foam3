/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.java',
  name: 'PropertyInfoPropertyRefinement',
  refines: 'foam.core.Property',

  documentation: 'Used by PropertyInfo Properties to specifiy which foam.core.Property they take their value from.',

  properties: [
    { name: 'propertyName' }
  ]
});


foam.CLASS({
  package: 'foam.java',
  name: 'PropertyInfo',
  extends: 'foam.java.Class',

  properties: [
    { name: 'anonymous', value: true },
    { name: 'propName',                propertyName: 'name' },
    { name: 'propShortName',           propertyName: 'shortName' },
    { name: 'propAliases',             propertyName: 'aliases' },
    { name: 'compare',                 propertyName: 'javaCompare' },
    { name: 'comparePropertyToObject', propertyName: 'javaComparePropertyToObject' },
    { name: 'comparePropertyToValue',  propertyName: 'javaComparePropertyToValue' },
    {
      name: 'getAliasesBody',
      expression: function() {
      var b = 'new String[] {';
        for ( var i = 0 ; i < this.propAliases.length ; i++ ) {
          b += '"' + this.propAliases[i] + '"';
          if ( i < this.propAliases.length-1 ) b += ', ';
        }
        return b + '};';
      }
    },
    {
      class: 'Boolean',
      name: 'networkTransient',
      propertyName: 'networkTransient'
    },
    {
      class: 'Boolean',
      name: 'externalTransient'
    },
    {
      class: 'Boolean',
      name: 'storageTransient',
      propertyName: 'storageTransient'
    },
    {
      class: 'Boolean',
      name: 'storageOptional',
      propertyName: 'storageOptional'
    },
    {
      class: 'Boolean',
      name: 'clusterTransient',
      propertyName: 'clusterTransient'
    },
    {
      class: 'Boolean',
      name: 'readPermissionRequired',
      propertyName: 'readPermissionRequired'
    },
    {
      class: 'Boolean',
      name: 'writePermissionRequired',
      propertyName: 'writePermissionRequired'
    },
    {
      class: 'Boolean',
      documentation: 'define a property is a XML attribute. eg <foo id="XMLAttribute"></foo>',
      name: 'xmlAttribute',
      propertyName: 'xmlAttribute'
    },
    {
      class: 'Boolean',
      documentation: 'define a property is a XML textNode. eg <foo id="1">textNode</foo>',
      name: 'xmlTextNode',
      propertyName: 'xmlTextNode'
    },
    {
      class: 'String',
      name: 'sqlType',
      propertyName: 'sqlType'
    },
    {
      name: 'getterName',
      expression: function(propName) {
        return 'get' + foam.String.capitalize(propName);
      }
    },
    {
      name: 'setterName',
      expression: function(propName) {
        return 'set' + foam.String.capitalize(propName);
      }
    },
    {
      name: 'clearName',
      expression: function(propName) {
        return 'clear' + foam.String.capitalize(propName);
      }
    },
    {
      class: 'Boolean',
      name: 'includeInID'
    },
    {
      class: 'Boolean',
      name: 'includeInDigest',
      propertyName: 'includeInDigest',
      value: true
    },
    {
      class: 'Boolean',
      name: 'includeInSignature',
      propertyName: 'includeInSignature',
      value: true
    },
    {
      class: 'Boolean',
      name: 'containsPII',
      propertyName: 'containsPII'
    },
    {
      class: 'Boolean',
      name: 'containsDeletablePII',
      propertyName: 'containsDeletablePII'
    },
    { name: 'sourceCls' },
    { name: 'propType',            propertyName: 'javaType' },
    { name: 'propValue',           propertyName: 'javaValue' },
    { name: 'propRequired',        propertyName: 'required' },
    { name: 'jsonParser',          propertyName: 'javaJSONParser' },
    { name: 'csvParser',           propertyName: 'javaCSVParser' },
    { name: 'cloneProperty',       propertyName: 'javaCloneProperty' },
    { name: 'queryParser',         propertyName: 'javaQueryParser' },
    { name: 'diffProperty',        propertyName: 'javaDiffProperty' },
    { name: 'validateObj',         propertyName: 'javaValidateObj' },
    { name: 'toCSV',               propertyName: 'javaToCSV' },
    { name: 'toCSVLabel',          propertyName: 'javaToCSVLabel' },
    { name: 'fromCSVLabelMapping', propertyName: 'javaFromCSVLabelMapping' },
    { name: 'formatJSON',          propertyName: 'javaFormatJSON' },
    {
      class: 'Boolean',
      name: 'sheetsOutput',
      propertyName: 'sheetsOutput',
      documentation: 'The sheetsOutput specifies if property shoud be written to Google Sheet on import. eg on Transaction import in case there is Status column transaction\'s status will be written there'
    },
    {
      name: 'methods',
      factory: function() {
        var fullName = this.sourceCls.package ? this.sourceCls.package + '.' + this.sourceCls.name : this.sourceCls.name;

        var m = [
          {
            name: 'getName',
            visibility: 'public',
            type: 'String',
            body: 'return "' + this.propName + '";'
          },
          {
            name: 'get_',
            type: this.propType,
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }],
            body: 'return ((' + fullName + ') o).' + this.getterName + '();'
          },
          {
            name: 'set',
            type: 'void',
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }, { name: 'value', type: 'Object' }],
            body: '((' + fullName + ') o).' + this.setterName + '(cast(value));'
          },
          {
            name: 'clear',
            type: 'void',
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }],
            body: '((' + fullName + ') o).' + this.clearName + '();'
          },
          {
            name: 'isSet',
            visibility: 'public',
            type: 'boolean',
            args: [{ name: 'o', type: 'Object' }],
            body: `return ((${fullName}) o).${this.propName}IsSet_;`
          }
        ];
        var primitiveType = ['boolean', 'long', 'byte', 'double','float','short','int'];

        if ( this.propType == 'java.util.Date' ||
             ! ( primitiveType.includes(this.propType) || this.propType == 'Object' || this.propType == 'String') ){
          m.push({
            name: 'cast',
            type: this.propType,
            visibility: 'public',
            args: [{ name: 'o', type: 'Object' }],
            body: 'return ' + ( this.propType == "Object" ? 'o;' : '( ' + this.propType + ') o;')
          });
        }

        if ( this.propType == 'java.util.Date' ||
             this.propType == 'String' ||
             ! ( primitiveType.includes(this.propType)|| this.propType == 'Object' || this.extends == 'foam.core.AbstractFObjectPropertyInfo' || this.extends == 'foam.core.AbstractFObjectArrayPropertyInfo') ){
          m.push({
            name: 'getSQLType',
            visibility: 'public',
            type: 'String',
            body: 'return "' + this.sqlType + '";'
          });
        }

        if ( this.propType == 'java.util.Date' ||
             this.propType == 'String' ||
             this.propType == 'Object' ||
             ! ( primitiveType.includes(this.propType) ) ){
          m.push({
            name: 'get',
            visibility: 'public',
            type: 'Object',
            args: [{ name: 'o', type: 'Object' }],
            body: 'return get_(o);'
          });

          m.push({
            name: 'jsonParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return ' + ( this.jsonParser ? this.jsonParser : null ) + ';'
          });
        }

        if ( ! ( primitiveType.includes(this.propType) || this.propType  == 'java.util.Date' || this.propType == 'String' || this.propType == 'Object' ) ) {
            //TODO add support for special type.
//              || this.propType == 'java.util.Map' || this.propType == 'java.util.List'
            //TODO add support for subtype.
//            this.propType == 'foam.core.AbstractFObjectPropertyInfo' || this.propType == 'foam.core.AbstractClassPropertyInfo') ||
//            this.propType == 'foam.core.AbstractObjectPropertyInfo'

          m.push({
            name: 'getValueClass',
            visibility: 'public',
            type: 'Class',
            body: `return ${this.propType}.class;`
          });

//          m.push({
//            name: 'jsonParser',
//            type: 'foam.lib.parse.Parser',
//            visibility: 'public',
//            body: 'return ' + ( this.jsonParser ? this.jsonParser : null ) + ';'
//          });
          m.push({
            name: 'queryParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return ' + ( this.queryParser ? this.queryParser : null ) + ';'
          });
          m.push({
            name: 'csvParser',
            type: 'foam.lib.parse.Parser',
            visibility: 'public',
            body: 'return ' + ( this.csvParser ? this.csvParser : null ) + ';'
          });
        }

        if ( this.compare !== '' ) {
          m.push({
            name: 'compare',
            type: 'int',
            visibility: 'public',
            args: [{ name: 'o1', type: 'Object' }, { name: 'o2', type: 'Object' }],
            body: this.compare,
          });
        }
        if ( this.comparePropertyToObject !== '' ) {
          m.push({
            name: 'comparePropertyToObject',
            type: 'int',
            visibility: 'public',
            args: [{ name: 'key', type: 'Object' }, { name: 'o', type: 'Object' }],
            body: this.comparePropertyToObject,
          });
        }
        if ( this.comparePropertyToValue !== '' ) {
          m.push({
            name: 'comparePropertyToValue',
            type: 'int',
            visibility: 'public',
            args: [{ name: 'key', type: 'Object' }, { name: 'value', type: 'Object' }],
            body: this.comparePropertyToValue,
          });
        }
        if ( ! ( primitiveType.includes(this.propType) || this.propType  == 'java.util.Date' || this.propType == 'String' || this.propType == 'Object' || this.extends == 'foam.core.AbstractFObjectPropertyInfo' || this.extends == 'foam.core.AbstractFObjectArrayPropertyInfo') ) {
          m.push({
            name: 'isDefaultValue',
            visibility: 'public',
            type: 'boolean',
            args: [{ name: 'o', type: 'Object' }],
            /* TODO: revise when/if expression support is added to Java */
            body: `return foam.util.SafetyUtil.compare(get_(o), ${this.propValue}) == 0;`
          });
          // TODO: We could reduce the amount a Enum PropertyInfo code we output
          if ( this.extends != 'foam.core.AbstractEnumPropertyInfo' ) {
            m.push({
              name: 'format',
              visibility: 'public',
              type: 'void',
              args: [
                {
                  name: 'formatter',
                  type: 'foam.lib.formatter.FObjectFormatter'
                },
                {
                  name: 'obj',
                  type: 'foam.core.FObject'
                }
              ],
              body: 'formatter.output(get_(obj));'
            });
          }
        }

        if ( this.networkTransient ) {
          m.push({
            name: 'getNetworkTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.networkTransient + ';'
          });
        }

        if ( this.externalTransient ) {
          m.push({
            name: 'getExternalTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.externalTransient + ';'
          });
        }

        if ( this.storageTransient ) {
          m.push({
            name: 'getStorageTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.storageTransient + ';'
          });
        }

        if ( this.storageOptional ) {
          m.push({
            name: 'getStorageOptional',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.storageOptional + ';'
          });
        }

        if ( this.clusterTransient ) {
          m.push({
            name: 'getClusterTransient',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.clusterTransient + ';'
          });
        }

        if ( this.readPermissionRequired ) {
          m.push({
            name: 'getReadPermissionRequired',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.readPermissionRequired + ';'
          });
        }

        if ( this.writePermissionRequired ) {
          m.push({
            name: 'getWritePermissionRequired',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.writePermissionRequired + ';'
          });
        }

        if ( this.xmlAttribute ) {
          m.push({
            name: 'getXMLAttribute',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.xmlAttribute + ';'
          });
        }

        if ( this.xmlTextNode ) {
          m.push({
            name: 'getXMLTextNode',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.xmlTextNode + ';'
          });
        }

        if ( this.propRequired ) {
          m.push({
            name: 'getRequired',
            visibility: 'public',
            type: 'boolean',
            body: 'return ' + Boolean(this.propRequired) + ';'
          });
        }

        if ( this.validateObj ) {
          m.push({
            name: 'validateObj',
            visibility: 'public',
            type: 'void',
            args: [
              { name: 'x', type: 'foam.core.X' },
              { name: 'obj', type: 'foam.core.FObject' }
            ],
            body: this.validateObj
          });
        }

        if ( this.propShortName ) {
          m.push({
            name: 'getShortName',
            visibility: 'public',
            type: 'String',
            body: this.propShortName ?
              'return "' + this.propShortName + '";' :
              'return null;'
          });
        }

        if ( this.propAliases.length ) {
          m.push({
            name: 'getAliases',
            visibility: 'public',
            type: 'String[]',
            body: 'return ' + this.getAliasesBody
          });
        }

        if ( this.cloneProperty != null ) {
          m.push({
            name: 'cloneProperty',
            visibility: 'public',
            type: 'void',
            args: [{ type: 'foam.core.FObject', name: 'source' },
                    { type: 'foam.core.FObject', name: 'dest' }],
            body: this.cloneProperty
          });
        }

        if ( this.diffProperty != null ) {
          m.push({
            name: 'diff',
            visibility: 'public',
            type: 'void',
            args: [{ type: 'foam.core.FObject',       name: 'o1'   },
                    { type: 'foam.core.FObject',      name: 'o2'   },
                    { type: 'java.util.Map',          name: 'diff' },
                    { type: 'foam.core.PropertyInfo', name: 'prop' }],
            body: this.diffProperty
          });
        }

        // default value is true, only generate if value is false
        if ( ! this.includeInDigest ) {
          m.push({
            name:       'includeInDigest',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.includeInDigest};`
          });
        }

        if ( this.includeInID ) {
          m.push({
            name:       'includeInID',
            visibility: 'public',
            type:       'boolean',
            body:       'return true;'
          });
        }

        // default value is true, only generate if value is false
        if ( ! this.includeInSignature ) {
          m.push({
            name:       'includeInSignature',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.includeInSignature};`
          });
        }

        if ( this.containsPII ) {
          m.push({
            name:       'containsPII',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.containsPII};`
          });
        }

        if ( this.containsDeletablePII ) {
          m.push({
            name:       'containsDeletablePII',
            visibility: 'public',
            type:       'boolean',
            body:       `return ${this.containsDeletablePII};`
          });
        }

        if ( this.sheetsOutput ) {
          m.push({
            name: 'getSheetsOutput',
            type: 'boolean',
            visibility: 'public',
            body: 'return ' + this.sheetsOutput + ';'
          });
        }

        if ( this.formatJSON != null ) {
          m.push({
            name: 'formatJSON',
            type: 'void',
            visibility: 'public',
            args: [
              {
                name: 'formatter',
                type: 'foam.lib.formatter.FObjectFormatter'
              },
              {
                name: 'obj',
                type: 'foam.core.FObject'
              }
            ],
            body: this.formatJSON + ';'
          });
        }

        return m;
      }
    }
  ]
});
