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
  name: 'BusinessDirector',
  documentation: `
    A business director is a person from a group of managers who leads or
    supervises a particular area of a company.
  `,

  imports: [
    'countryDAO'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'net.nanopay.country.br.FederalRevenueService',
  ],

  messages: [
    { name: 'UNDER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old.' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be under the age of 125 years old.' },
    { name: 'INVALID_CPF', messages: 'Invalid CPF.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'type',
      hidden: true
    },
    {
      class: 'String',
      name: 'firstName',
      gridColumns: 6,
      minLength: 1
    },
    {
      class: 'String',
      name: 'lastName',
      gridColumns: 6,
      minLength: 1
    },
    {
      class: 'String',
      name: 'foreignId',
      label: 'RG/RNE:(National/Passport/Foreign ID)',
      required: true,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'cpf',
      required: true,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['type', 'cpf'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.model.BusinessDirector.TYPE, 'BR'),
              e.AND(
                e.EQ(net.nanopay.model.BusinessDirector.TYPE, 'BR'),
                e.NEQ(net.nanopay.model.BusinessDirector.CPF, '')
              )
            );
          },
          errorString: 'Please provide a valid CPF number'
        }
      ]
    },
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      name: 'birthday',
      label: 'Date of birth',
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.AND(
              e.NEQ(net.nanopay.model.BusinessDirector.BIRTHDAY, null),
              e.LT(net.nanopay.model.BusinessDirector.BIRTHDAY, limit)
            );
          },
          errorMessage: 'UNDER_AGE_LIMIT_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ));
            return e.AND(
              e.NEQ(net.nanopay.model.BusinessDirector.BIRTHDAY, null),
              e.GT(net.nanopay.model.BusinessDirector.BIRTHDAY, limit)
            );
          },
          errorMessage: 'OVER_AGE_LIMIT_ERROR'
        }
      ]
    }),
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'nationality',
      of: 'foam.nanos.auth.Country',
      documentation: `Defined nationality of business director.`,
      required: true,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Countries',
              dao: X.countryDAO
            }
          ]
        };
      }
    }
  ],
  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( "BR".equals(getType()) ) {
          try {
            if ( ! ((FederalRevenueService) x.get("federalRevenueService")).validateCpf(getCpf(), getBirthday()) )
              throw new RuntimeException(INVALID_CPF);
          } catch(Throwable t) {
            throw t;
          }
        }
      `
    }
  ]
});
