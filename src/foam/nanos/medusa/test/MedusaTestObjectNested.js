/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.medusa.test',
   name: 'MedusaTestObjectNested',

   documentation: 'Copy of MedusaTestObject for testing nested transient',

   properties: [
     {
       class: 'String',
       name: 'data'
     },
     {
       class: 'String',
       name: 'clusterTransientData',
       clusterTransient: true
     },
     {
       class: 'String',
       name: 'networkTransientData',
       networkTransient: true
     },
     {
       class: 'String',
       name: 'storageTransientData',
       storageTransient: true
     },
     {
       class: 'String',
       name: 'transientData',
       transient: true
     }
   ]
 });
