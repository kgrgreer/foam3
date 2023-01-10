/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
    package: 'foam.lib',
    name: 'NotEntityTypePropertyPredicate',
    implements: [ 'foam.lib.PropertyPredicate'],
    javaImports: [
      'foam.nanos.auth.AuthService'
    ],
  
    methods: [
      {
        name: 'propertyPredicateCheck',
        javaCode: `
          // return false if this property is entity type
          return ! prop.getName().toLowerCase().equals("entitytype");
        `
      }
    ]
  });