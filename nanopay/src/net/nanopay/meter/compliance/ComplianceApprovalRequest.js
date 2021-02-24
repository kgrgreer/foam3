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
  name: 'ComplianceApprovalRequest',
  extends: 'foam.nanos.approval.ApprovalRequest',

  sections: [
    {
      name: 'complianceInformation',
      order: 20
    }
  ],

  properties: [
    {
      name: 'status',
      value: 'REQUESTED',
    },
    {
      class: 'Long',
      name: 'causeId',
      section: 'complianceInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'causeDaoKey',
      section: 'complianceInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      name: 'causeObject',
      label: '',
      section: 'complianceInformation',
      order: 30,
      transient: true
    },
    {
      class: 'FObjectProperty',
      name: 'causeObjectHelper',
      section: 'complianceInformation',
      transient: true,
      visibility: 'HIDDEN',
      expression: function(causeId, causeDaoKey) {
        if ( causeDaoKey !== '' ) {
          var key = causeDaoKey;
          if( ! this.__context__[key] ) {
            // if DAO doesn't exist in context, change daoKey from localMyDAO
            // (server-side) to myDAO (accessible on front-end)
            key = key.substring(5,6).toLowerCase() + key.substring(6);
          }
          this.__subContext__[key].find(causeId).then((obj) => {
            this.causeObject = obj;
          });
        }
        return null;
      }
    }
  ]
});
