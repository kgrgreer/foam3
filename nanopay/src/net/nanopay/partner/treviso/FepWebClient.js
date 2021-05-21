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
  package: 'net.nanopay.partner.treviso',
  name: 'FepWebClient',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'publicBusinessDAO'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      documentation: `The ID for the user`,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.__subSubContext__.publicBusinessDAO.find(value).then( function( user ) {
          if ( user ) self.add(user.businessName);
        });
      }
    },
    {
      class: 'String',
      name: 'status',
      value: 'NEW',
      documentation: 'Status on FEPWEB system.'
    },
    {
      class: 'DateTime',
      name: 'created',
      label: 'Creation Date',
      visibility: 'RO',
      documentation: 'Creation date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO',
      documentation: 'User who created the entry'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      visibility: 'RO',
      documentation: 'Agent who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      name: 'lastModifiedBy'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      name: 'lastModifiedByAgent'
    }
  ]
});
