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
  package: 'net.nanopay.meter',
  name: 'IpHistory',

  documentation: `User IP history model`,

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  imports: [
    'publicBusinessDAO',
    'userDAO'
  ],

  messages: [
    { name: 'SIGNING_OFFICER_MSG', message: 'Signing officer' },
    { name: 'ASSIGNED_TO_MSG', message: 'assigned to' },
    { name: 'REVOKED_FROM_MSG', message: 'revoked from' }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'String',
      name: 'ipAddress',
      label: 'IP Address',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'description',
      visibility: 'RO',
      tableCellFormatter: function(val, obj) {
        /** 
         * description has a pattern of 
         * 'Signing officer: assgined to <email address>' or
         * 'Signing officer: revoked from <email address>'
         */
        const [_, __, verb, ___, email] = val.split(' ');
        const action = verb === 'assigned' ?
          obj.ASSIGNED_TO_MSG :
          obj.REVOKED_FROM_MSG;

        this.add(`${obj.SIGNING_OFFICER_MSG}: ${action} ${email}`);
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.meter.IpHistory',
  forwardName: 'ipHistories',
  inverseName: 'user',
  sourceProperty: {
    section: 'operationsInformation',
    order: 100,
    transient: true
  },
  targetProperty: {
    visibility: 'RO',
    tableCellFormatter: function(value, obj) {
      obj.userDAO.find(value).then(function(user) {
        this.add(user.email);
      }.bind(this));
    }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Business',
  targetModel: 'net.nanopay.meter.IpHistory',
  forwardName: 'ipHistories',
  inverseName: 'business',
  sourceProperty: {
    section: 'operationsInformation'
  },
  targetProperty: {
    visibility: 'RO',
    tableCellFormatter: function(value, obj) {
      if ( value !== undefined ) {
        obj.publicBusinessDAO.find(value).then(function(business) {
          this.add(business.organization);
        }.bind(this));
      }
    }
  }
});
