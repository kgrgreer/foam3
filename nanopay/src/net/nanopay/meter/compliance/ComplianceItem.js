/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceItem',
  label: 'Compliance Responses',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  requires: [
    'foam.dao.DAO'
  ],

  documentation: `The Compliance Item`,

  tableColumns: [
    'responseId',
    'type',
    'user.firstName',
    'user.lastName',
    'entityLabel',
    'summary',
    'created'
  ],

  searchColumns: [
    'responseId',
    'type',
    'user',
    'entityLabel',
    'created'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
      targetDAOKey: 'dowJonesResponseDAO',
      name: 'dowJones'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      targetDAOKey: 'identityMindResponseDAO',
      name: 'identityMind'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
      targetDAOKey: 'securefactLEVDAO',
      name: 'levResponse'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
      targetDAOKey: 'securefactSIDniDAO',
      name: 'sidniResponse'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      name: 'user',
      label: 'User/Business ID'
    },
    {
      class: 'net.nanopay.tx.model.TransactionReference',
      name: 'transaction',
      label: 'Transaction ID'
    },
    {
      class: 'String',
      name: 'entityLabel',
      label: 'Entity Name'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date'
    },
    {
      class: 'Long',
      name: 'responseId',
      transient: true,
      label: 'ID',
      tableWidth: 50,
      expression: function(dowJones, identityMind, levResponse, sidniResponse) {
        if ( dowJones ) {
          return dowJones;
        } else if ( identityMind ) {
          return identityMind;
        } else if ( levResponse ) {
          return levResponse;
        } else if ( sidniResponse ) {
          return sidniResponse;
        } else {
          return 0;
        }
      },
      hidden: true
    },
    {
      class: 'String',
      name: 'type',
      tableWidth: 300
    },
    {
      class: 'String',
      name: 'summary',
      expression: function() {
        return this.toSummary();
      }
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: async function(x) {
        if ( this.sidniResponse != 0 ) {
          let response = await this.sidniResponse$find;
          return response.toSummary();
        }
        return "";
      },
      javaCode: `
        net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse resp = findSidniResponse(foam.core.XLocator.get());
        return resp == null ? "" : resp.toSummary();
      `
    }
  ]
});
