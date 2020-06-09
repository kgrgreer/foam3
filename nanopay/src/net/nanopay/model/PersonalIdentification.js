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
        });
      },
      validateObj: function(identificationTypeId) {
        if ( ! identificationTypeId ) {
          return 'Identification type is required';
        }
      }
    },
    {
      class: 'String',
      name: 'identificationNumber',
      documentation: `Number associated to identification.`,
      validateObj: function(identificationNumber) {
        if ( ! identificationNumber || ! identificationNumber.trim() ) {
          return 'Identification number is required';
        }
      }
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
          dao: X.countryDAO.where(X.data.IN(X.data.Country.ID, ['US', 'CA'])),
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: '- Please select -'
        });
      }
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
        });
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
      }
    },
    {
      class: 'Date',
      name: 'issueDate',
      label: 'Date Issued',
      gridColumns: 6,
      documentation: `Date identification was issued.`,
      validationPredicates: [
        {
          args: ['issueDate'],
          predicateFactory: function(e) {
            return foam.mlang.predicate.OlderThan.create({
                arg1: net.nanopay.model.PersonalIdentification.ISSUE_DATE,
                timeMs: 0
              });
          },
          errorString: 'Must be before today.'
        }
      ]
    },
    {
      class: 'Date',
      name: 'expirationDate',
      label: 'Expiry Date',
      gridColumns: 6,
      documentation: `Date identification expires.`,
      validationPredicates: [
        {
          args: ['expirationDate'],
          predicateFactory: function(e) {
            return e.AND(
              e.NOT(
                foam.mlang.predicate.OlderThan.create({
                  arg1: net.nanopay.model.PersonalIdentification.EXPIRATION_DATE,
                  timeMs: 0
                })
              ),
              e.NEQ(
                net.nanopay.model.PersonalIdentification.EXPIRATION_DATE,
                null
              )
            );
          },
          errorString: 'Must be after today.'
        }
      ]
    }
  ]
});
