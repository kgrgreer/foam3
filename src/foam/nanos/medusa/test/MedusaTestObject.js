/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.medusa.test',
   name: 'MedusaTestObject',

   documentation: 'FObject solely for the purposes of storing via Medusa.',

   mixins: [
     'foam.nanos.auth.CreatedAwareMixin',
     'foam.nanos.auth.LastModifiedAwareMixin'
   ],

   properties: [
     {
       class: 'String',
       name: 'id'
     },
     {
       class: 'String',
       name: 'description',
       includeInDigest: true,
       trim: true
     },
     {
       class: 'String',
       name: 'data',
       includeInDigest: true,
       trim: true
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
     },
     {
       name: 'clusterTransientFObject',
       class: 'FObjectProperty',
       of: 'foam.nanos.medusa.test.MedusaTestObjectNested',
       clusterTransient: true,
       factory: function() {
         return foam.nanos.medusa.test.MedusaTestObjectNested.create();
       }
     },
     {
       name: 'nestedFObject',
       class: 'FObjectProperty',
       of: 'foam.nanos.medusa.test.MedusaTestObjectNested',
       factory: function() {
         return foam.nanos.medusa.test.MedusaTestObjectNested.create();
       }
     },
     {
       name: 'networkTransientFObject',
       class: 'FObjectProperty',
       of: 'foam.nanos.medusa.test.MedusaTestObjectNested',
       networkTransient: true,
       factory: function() {2
         return foam.nanos.medusa.test.MedusaTestObjectNested.create();
       }
     },
     {
       name: 'storageTransientFObject',
       class: 'FObjectProperty',
       of: 'foam.nanos.medusa.test.MedusaTestObjectNested',
       storageTransient: true,
       factory: function() {
         return foam.nanos.medusa.test.MedusaTestObjectNested.create();
       }
     },
     {
       name: 'transientFObject',
       class: 'FObjectProperty',
       of: 'foam.nanos.medusa.test.MedusaTestObjectNested',
       transient: true,
       factory: function() {
         return foam.nanos.medusa.test.MedusaTestObjectNested.create();
       }
     }
   ]
 });
