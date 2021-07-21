/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'CompositeApprovable',
  extends: 'foam.nanos.approval.Approvable',

  documentation: `
    An approvable that consists of sub approvables
  `,

  properties: [
    {
      class: 'String',
      name: 'daoKey',
      value: 'approvableDAO'
    },
    {
      name: 'approvableIds',
      class: 'StringArray',
      factory: function(){
        return [];
      },
      javaFactory: 'return new String[0];'
    },
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        if ( this.approvableIds.length === 0 ){
          return this.id
        }

        var  firstApprovable = this.approvableIds[0];

        return this.__subContext__[this.daoKey].find(firstApprovable.id).then(obj => {
          return obj 
            ? `${obj.toSummary()},...`
            :  `${this.id},...`
        });
      }
    }
  ]
});
