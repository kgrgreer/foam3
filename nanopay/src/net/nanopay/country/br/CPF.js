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
  package: 'net.nanopay.country.br',
  name: 'CPF',
  documentation: `
    The Cadastro de Pessoas Físicas (CPF; Portuguese for "Natural Persons Register") is the Brazilian individual taxpayer registry identification, a permanent number attributed by the Brazilian Federal Revenue to both Brazilians and resident aliens who pay taxes or take part, directly or indirectly. It is canceled after some time after the person's death.
  `,

  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
  ],

  imports: [
    'brazilVerificationService'
  ],

  messages: [
    { name: 'INVALID_CPF', messages: 'Invalid CPF.' },
    { name: 'INVALID_NAME', messages: 'Click to verify name.' }
  ],

  sections: [
    {
      name: 'collectCpf',
      title: 'Enter your CPF',
      help: 'Require your CPF'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'data',
      label: 'CPF',
      section: 'collectCpf',
      help: `The CPF (Cadastro de Pessoas Físicas or Natural Persons Register) is a number assigned by the Brazilian revenue agency to both Brazilians and resident aliens who are subject to taxes in Brazil.`,
      view: {
        class: 'foam.u2.TextField',
        placeholder: '12345678910',
        minLength: 11,
        maxLength: 11
      },
      validationPredicates: [
        {
          args: ['data'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.StringLength.create({ arg1: net.nanopay.country.br.CPF.DATA }), 11);
          },
          errorMessage: 'Invalid CPF.'
        }
      ],
      postSet: function(_,n) {
        this.cpfName = "";
        if ( n.length == 11 ) {
          this.getCpfName(n).then((v) => {
            this.cpfName = v;
          });
        }
      },
    },
    {
      class: 'String',
      name: 'cpfName',
      label: '',
      section: 'collectCpf',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Please verify that name displayed below matches your real name.',
      section: 'collectCpf',
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
            return e.EQ(net.nanopay.country.br.CPF.VERIFY_NAME, true);
          },
          errorMessage: 'INVALID_NAME'
        }
      ]
    },
  ],

  methods: [
    {
      name: 'getCpfName',
      code:  async function(data) {
        return await this.brazilVerificationService.getCPFName(this.__subContext__, data);
      }
    },
    {
      name: 'validate',
      javaCode: `
        if ( ! getVerifyName() )
          throw new IllegalStateException("Must verify name attached to CPF is valid.");

        try {
          if ( ! ((BrazilVerificationService) x.get("brazilVerificationService")).validateUserCpf(x, getData()) )
            throw new RuntimeException(INVALID_CPF);
        } catch(Throwable t) {
          throw t;
        }
      `
    }
  ]
});
