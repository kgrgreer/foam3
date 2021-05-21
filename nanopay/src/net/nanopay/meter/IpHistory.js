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
    'translationService',
    'publicBusinessDAO',
    'userDAO'
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
        /* 
         * description has a form of <User type>: <action> <email address>
         * e.g., Signing officer: assgined to <email address>
         */

        let [userType, remainder] = val.split(':');
        
        const remainderList = remainder.trim().split(' ');

        let email = remainderList.pop();
        let action = remainderList.join(' ');

        userType = obj.translationService.getTranslation(
          foam.locale,
          userType,
          userType
        );

        action = obj.translationService.getTranslation(
          foam.locale,
          action,
          action
        );

        this.add(`${userType}: ${action} ${email}`);
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
