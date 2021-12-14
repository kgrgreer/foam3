/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'Approvable',
  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  sections: [
    {
      name: 'admin',
      permissionRequired: true
    },
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'lookupId',
      documentation: `
        A function of daoKey, objId and a hashed properties to update, to be used
        to distinguish update requests on the same object
      `,
      required: true,
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'daoKey',
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'serverDaoKey',
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'Map',
      name: 'propertiesToUpdate'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'status'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation'
    },
    {
      class: 'Class',
      name: 'of',
    },
    {
      class: 'DateTime',
      name: 'created',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent'
    },
    {
      class: 'Boolean',
      name: 'isUsingNestedJournal',
      documentation: `
        For cases where the approvable pertains to updating a nested object from a list. See  capable.capablePayloads for  example. 
        This is done so that the predicate can differentiate between  an approvable for an entire object vs a nested object and
        know when not to apply the generic approvable rule.
      `,
      section: 'admin'
    },
    {
      class: 'Boolean',
      name: 'blockFulfillementLogic',
      documentation: `If true, prevents Approvable reput logic in FulfilledApprovableRule.`,
      section: 'admin',
      value: false
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        var modelString = this.daoKey;

        modelString = modelString.replace('local', '');
        modelString = modelString.replace('DAO', '');

        return this.__subContext__[this.daoKey].find(this.objId).then(obj => {
          return obj 
            ? `${modelString}: ${obj.toSummary()}`
            :  `(${modelString}:${this.objId}) UPDATE`
        });
      },
      javaCode: `
        String modelString = getDaoKey();

        modelString = modelString.replaceAll("local","");
        modelString = modelString.replaceAll("DAO","");

        StringBuilder sb = new StringBuilder();
        sb.append(modelString);
        sb.append(": ");

        foam.dao.DAO referenceDAO = (foam.dao.DAO) getX().get(getDaoKey());

        if ( referenceDAO == null ) {
          sb.append(getObjId().toString());
          return sb.toString();
        }

        foam.core.FObject referenceObj = (foam.core.FObject) referenceDAO.find(getObjId());

        if ( referenceObj != null ){
          sb.append(referenceObj.toSummary());
        }

        return sb.toString();
      `
    }
  ]
});
