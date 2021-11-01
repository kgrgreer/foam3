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
       name: 'name'
     },
     {
       class: 'String',
       name: 'description'
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
       class: 'String',
       name: 'clusterTransientData',
       clusterTransient: true
     },
     {
       class: 'String',
       name: 'networkTransientData',
       networkTransient: true
     },
     // {
     //   name: 'specificFobject',
     //   class: 'FObjectProperty',
     //   of: 'foam.nanos.medusa.ClusterCommandHop',
     //   factory: function() {
     //     return foam.nanos.medusa.ClusterCommandHop.create();
     //   }
     // },
     // {
     //   name: 'genericFobject',
     //   class: 'FObjectProperty',
     //   of: 'foam.core.FObject',
     //   factory: function() {
     //     return foam.nanos.medusa.ClusterCommandHop.create();
     //   },
     //   view: 'foam.u2.view.AnyView'
     // },
     // {
     //   name: 'storageTransientFobjectWithFactory',
     //   class: 'FObjectProperty',
     //   of: 'foam.nanos.medusa.ClusterCommandHop',
     //   storageTransient: true,
     //   factory: function() {
     //     return foam.nanos.medusa.ClusterCommandHop.create();
     //   }
     // },
     // {
     //   name: 'storageTransientFobject',
     //   class: 'FObjectProperty',
     //   of: 'foam.nanos.medusa.ClusterCommandHop',
     //   storageTransient: true
     // },
     {
       name: 'storageTransientObject',
       class: 'Object',
       storageTransient: true
     }
   ]
 });
