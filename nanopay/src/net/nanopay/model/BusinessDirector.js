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
    { name: 'INVALID_DATE_ERROR', message: 'Valid date of birth required' },
    { name: 'UNDER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be less than 125 years old' },
    { name: 'INVALID_CPF', message: 'Valid CPF number required' },
    { name: 'INVALID_DIRECTOR_NAME', message: 'Confirm your director\’s name' },
    { name: 'FOREIGN_ID_ERROR', message: 'RG/RNE required' },
    { name: 'NATIONALITY_ERROR', message: 'Nationality required' }
  ],

  properties: [
    {
      class: 'String',
      name: 'type',
      hidden: true,
      externalTransient: true
    },
    {
      class: 'String',
      name: 'firstName',
      gridColumns: 6,
      required: true
    },
    {
      class: 'String',
      name: 'lastName',
      gridColumns: 6,
      required: true
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
      },
      validationPredicates: [
        {
          args: ['foreignId'],
          predicateFactory: function(e) {
            return e.GTE(foam.mlang.StringLength.create({ arg1: net.nanopay.model.BusinessDirector.FOREIGN_ID }), 1);
          },
          errorMessage: 'FOREIGN_ID_ERROR'
        }
      ],
      externalTransient: true
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
            return e.NEQ(net.nanopay.model.BusinessDirector.BIRTHDAY, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.LT(net.nanopay.model.BusinessDirector.BIRTHDAY, limit);
          },
          errorMessage: 'UNDER_AGE_LIMIT_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ));
            return e.GT(net.nanopay.model.BusinessDirector.BIRTHDAY, limit);
          },
          errorMessage: 'OVER_AGE_LIMIT_ERROR'
        }
      ],
      postSet: function(_,n) {
        this.cpfName = "";
        if ( this.cpf.length == 11 ) {
          this.getCpfName(this.cpf).then((v) => {
            this.cpfName = v;
          });
        }
      }
    }),
    {
      class: 'String',
      name: 'cpf',
      label: 'Cadastro de Pessoas Físicas (CPF)',
      required: true,
      visibility: function (type) {
        return type == 'BR' ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['type', 'cpfName'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.model.BusinessDirector.TYPE, 'BR'),
              e.AND(
                e.EQ(net.nanopay.model.BusinessDirector.TYPE, 'BR'),
                e.GT(net.nanopay.model.BusinessDirector.CPF_NAME, 0)
              )
            );
          },
          errorMessage: 'INVALID_CPF'
        }
      ],
      externalTransient: true,
      tableCellFormatter: function(val) {
        return foam.String.applyFormat(val, 'xxx.xxx.xxx-xx');
      },
      postSet: function(_,n) {
        this.cpfName = "";
        if ( n.length == 11 ) {
          this.getCpfName(n).then((v) => {
            this.cpfName = v;
          });
        }
      },
      view: function(_, X) {
        return foam.u2.FragmentedTextField.create({
          delegates: [
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              onKey: true,
              data: X.data.cpf.slice(0,3)
            },
            '.',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              onKey: true,
              data: X.data.cpf.slice(3,6)
            },
            '.',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              onKey: true,
              data: X.data.cpf.slice(6,9)
            },
            '-',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 2 } ],
              onKey: true,
              data: X.data.cpf.slice(9,11)
            }
          ]
        })
      }
    },
    {
      class: 'String',
      name: 'cpfName',
      label: '',
      hidden: true,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Is this your director?',
      visibility: function (type, cpfName) {
        return type == 'BR' && cpfName.length > 0 ?
        foam.u2.DisplayMode.RW :
        foam.u2.DisplayMode.HIDDEN;
      },
      view: function(n, X) {
        var self = X.data$;
        return foam.u2.CheckBox.create({
          labelFormatter: function() {
            this.start('span')
              .add(self.dot('cpfName'))
            .end();
          }
        });
      },
      validationPredicates: [
        {
          args: ['verifyName'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.model.BusinessDirector.TYPE, 'BR'),
              e.AND(
                e.EQ(net.nanopay.model.BusinessDirector.TYPE, 'BR'),
                e.EQ(net.nanopay.model.BusinessDirector.VERIFY_NAME, true)           
              )
            );
          },
          errorMessage: 'INVALID_DIRECTOR_NAME'
        }
      ]
    },
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
      },
      validationPredicates: [
        {
          args: ['nationality'],
          predicateFactory: function(e) {
            return e.GTE(foam.mlang.StringLength.create({ arg1: net.nanopay.model.BusinessDirector.NATIONALITY }), 1);
          },
          errorMessage: 'NATIONALITY_ERROR'
        }
      ]
    }
  ],
  methods: [
    {
      name: 'getCpfName',
      code: async function(cpf) {
        return await this.brazilVerificationService.getCPFNameWithBirthDate(this.__subContext__, cpf, this.birthday);
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
