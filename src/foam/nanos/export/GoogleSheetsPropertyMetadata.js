/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsPropertyMetadata',
  properties: [
    {
      name: 'columnName',
      class: 'String'
    },
    {
      name: 'columnLabel',
      class: 'String'
    },
    {
      name: 'columnWidth',
      class: 'Int'//0 if no width found
    },
    {
      name: 'cellType',
      class: 'String'
    },
    {
      name: 'pattern',
      class: 'String'
    },
    {
      name: 'perValuePatternSpecificValues',
      class: 'StringArray',
      documentation: 'Stores values that we need for google sheets cell\'s format (eg for property \'amount\' that could be [\'CAD\', \'USD\', etc])'
    },
    {
      name: 'propName',
      class: 'String'
    },
    {
      name: 'prop',
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
    },
    {
      name: 'unitPropName',
      class: 'String',
      documentation: 'For properties of class UnitValue we store unitPropName here'
    },
    {
      name: 'projectionIndex',
      class: 'Int',
      documentation: 'Store index of this property\'s values in array, which is result of execution of projection'
    }
  ]
});
