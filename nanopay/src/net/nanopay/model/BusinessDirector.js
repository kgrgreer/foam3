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
    'brazilVerificationService',
    'countryDAO'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'net.nanopay.country.br.BrazilVerificationService',
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
    {
      class: 'String',
      name: 'name',
      label: '',
      hidden: true,
      expression: function(cpf) {
        if ( cpf.length == 11 ) {
          this.name = "";
          return this.getCpfName(cpf).then((n) => {
            this.name = n;
          });
        } else { return ""; }
      }
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Please verify that name displayed below matches director name.',
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      view: function(n, X) {
        var self = X.data$;
        return foam.u2.CheckBox.create({
          labelFormatter: function() {
            this.start('span')
              .add(self.dot('name'))
            .end();
          }
        });
      },
      validationPredicates: [
        {
          args: ['verifyName'],
          predicateFactory: function(e) {
            return e.AND(
              e.EQ(net.nanopay.model.BusinessDirector.VERIFY_NAME, true),
              e.EQ(net.nanopay.model.BusinessDirector.TYPE, 'BR')
            );
          },
          errorString: 'Click to verify director name.'
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
      name: 'getCpfName',
      code:  async function(cpf) {
      debugger
        return await this.brazilVerificationService.getCPFName(this.__subContext__, cpf);
      }
    },
    {
      name: 'validate',
      javaCode: `
        if ( "BR".equals(getType()) ) {

        if ( ! getVerifyName() )
          throw new IllegalStateException("Must verify name attached to CPF is valid.");

          try {
            if ( ! ((BrazilVerificationService) x.get("brazilVerificationService")).validateCpf(x, getCpf(), getBirthday()) )
              throw new RuntimeException(INVALID_CPF);
          } catch(Throwable t) {
            throw t;
          }
        }
      `
    }
  ]
});
