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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBeneficiary',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'contact',
      documentation: `The ID for the contact or underlying business`,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.__subSubContext__.publicBusinessDAO.find(value).then( function( user ) {
          if ( user ) self.add(user.businessName);
        });
      }
    },
    {
      class: 'String',
      name: 'vendorId',
      documentation: 'Vendor Id saved on AFEX.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'owner',
      documentation: `The owner of the contact`,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.__subSubContext__.publicBusinessDAO.find(value).then( function( user ) {
          if ( user ) self.add(user.businessName);
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isInstantBeneficiary'
    },
    {
      class: 'String',
      name: 'status',
      documentation: 'Beneficiary status on AFEX system.',
      tableCellFormatter: function(val) {
        this.translate(val);
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      label: 'Creation Date',
      documentation: 'Creation date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'currency'
    }
  ]
});
