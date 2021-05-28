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
  package: 'net.nanopay.model',
  name: 'PersonalIdentification',

  documentation: 'User/Personal identification.',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'net.nanopay.model.IdentificationType'
  ],

  imports: [
    'regionDAO',
    'countryDAO',
    'identificationTypeDAO'
  ],

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'identificationTypeDAO',
      name: 'identificationTypeId',
      label: 'Type of Identification',
      of: 'net.nanopay.model.IdentificationType',
      documentation: `Identification details for individuals/users.`,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.identificationTypeDAO.where(X.data.NEQ(X.data.IdentificationType.NAME, 'Provincial ID Card')),
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: '- Please select -'
        }, X);
      },
      validateObj: function(identificationTypeId) {
        if ( ! identificationTypeId ) {
          return 'Identification type is required';
        }
      },
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      label: 'Country of Issue',
      of: 'foam.nanos.auth.Country',
      gridColumns: 12,
      documentation: `Country where identification was issued.`,
      validateObj: function(countryId) {
        if ( ! countryId ) {
          return 'Country of issue is required';
        }
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: '- Please select -'
        }, X);
      },
      order: 20,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      of: 'foam.nanos.auth.Region',
      label: 'Province/State of Issue',
      gridColumns: 12,
      documentation: `Region where identification was isssued.`,
      view: function(_, X) {
        var choices = X.data.slot(function(countryId) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryId || ''));
        });
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please select -',
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        }, X);
      },
      validateObj: function(regionId, identificationTypeId) {
        var isPassport = identificationTypeId === 3;
        if ( ! regionId && ! isPassport ) {
          return 'Region of issue is required';
        }
      },
      visibility: function(identificationTypeId) {
        var isPassport = identificationTypeId === 3;
        return isPassport ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      order: 30,
      gridColumns: 6
    },

    {
      class: 'String',
      name: 'identificationNumber',
      documentation: `Number associated to identification.`,
      validateObj: function(identificationNumber) {
        if ( ! identificationNumber || ! identificationNumber.trim() ) {
          return 'Identification number is required';
        }
      },
      order: 40,
      gridColumns: 6
    },
    {
      class: 'Date',
      name: 'issueDate',
      label: 'Date Issued',
      order: 50,
      gridColumns: 6,
      documentation: `Date identification was issued.`,
      validationPredicates: [
        {
          args: ['issueDate'],
          predicateFactory: function(e) {
            return e.AND(
              e.NEQ(net.nanopay.model.PersonalIdentification.ISSUE_DATE, null),
              e.LT(net.nanopay.model.PersonalIdentification.ISSUE_DATE, new Date())
            );
          },
          errorString: 'Must be before today.'
        }
      ]
    },
    {
      class: 'Date',
      name: 'expirationDate',
      label: 'Expiry Date',
      order: 60,
      gridColumns: 6,
      documentation: `Date identification expires.`,
      validationPredicates: [
        {
          args: ['expirationDate'],
          predicateFactory: function(e) {
            return e.AND(
              e.NEQ(net.nanopay.model.PersonalIdentification.EXPIRATION_DATE, null),
              e.GT(net.nanopay.model.PersonalIdentification.EXPIRATION_DATE, new Date())
            );
          },
          errorString: 'Must be after today.'
        }
      ]
    },
    {
      class: 'String',
      name: 'issuer',
      documentation: 'The issuer of the identification.',
      order: 70,
      gridColumns: 6
    }
  ]
});
