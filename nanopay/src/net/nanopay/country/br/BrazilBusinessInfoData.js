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
  name: 'BrazilBusinessInfoData',
  documentation: `
    Additional business information required for brazilian business registration
  `,

  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil'
  ],

  imports: [
    'brazilVerificationService'
  ],

  sections: [
    {
      name: 'businessInformation',
      title: `Enter the identification numbers for your business`,
      help: `Require Business' Identification Numbers`
    }
  ],

  messages: [
    { name: 'NO_CNPJ', message: '14-digit National Registry of Legal Entities Number required' },
    { name: 'CNPJ_INVALID', message: 'CNPJ required' },
    { name: 'NO_NIRE', message: 'NIRE required' },
    { name: 'VERIFY_BUSINESS_NAME', message: 'Confirm your business name' }
  ],

  properties: [
    {
      class: 'String',
      name: 'cnpj',
      label: 'National Registry of Legal Entities(CNPJ)',
      required: true,
      documentation: `
          CNPJ (short for Cadastro Nacional da Pessoa Jurídica in Portuguese, or National Registry of Legal Entities) is an identification number issued to Brazilian companies by the Department of Federal Revenue of Brazil.
          Format of CNPJ - 14Insira seu CPF-digit number formatted as 00.000.000/0001-00
          The first eight digits identify the company, the four digits after the slash identify the branch or subsidiary ("0001" defaults to the headquarters), and the last two are check digits`,
      section: 'businessInformation',
      validationPredicates: [
        {
          args: ['cnpj', 'cnpjName'],
          predicateFactory: function(e) {
            return e.EQ(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.country.br.BrazilBusinessInfoData.CNPJ
                  }), 14);
          },
          errorMessage: 'NO_CNPJ'
        },
        {
          args: ['cnpj', 'cnpjName'],
          predicateFactory: function(e) {
            return e.AND(
              e.GT(
                net.nanopay.country.br.BrazilBusinessInfoData
                .CNPJ_NAME, 0),
              e.EQ(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.country.br.BrazilBusinessInfoData
                    .CNPJ
                  }), 14)
              );
          },
          errorMessage: 'CNPJ_INVALID'
        }
      ],
      tableCellFormatter: function(val) {
        return foam.String.applyFormat(val, 'xx.xxx.xxx/xxxx-xx');
      },
      postSet: function(_,n) {
        if ( n.length == 14 && this.verifyName !== true ) {
          this.cnpjName = "";
          this.getCNPJBusinessName(n).then((v) => {
            this.cnpjName = v;
          });
        }
        else {
          this.cnpjName = "";
          this.verifyName = false;
        }
      },
      view: function(_, X) {
        return foam.u2.FragmentedTextField.create({
          delegates: [
            foam.u2.FragmentedTextFieldFragment.create({
              data: X.data.cnpj.slice(0,2),
              maxLength: 2
            }),
            '.',
            foam.u2.FragmentedTextFieldFragment.create({
              data: X.data.cnpj.slice(2,5),
              maxLength: 3
            }),
            '.',
            foam.u2.FragmentedTextFieldFragment.create({
              data: X.data.cnpj.slice(5,8),
              maxLength: 3
            }),
            '/',
            foam.u2.FragmentedTextFieldFragment.create({
              data: X.data.cnpj.slice(8,12),
              maxLength: 4
            }),
            '-',
            foam.u2.FragmentedTextFieldFragment.create({
              data: X.data.cnpj.slice(12,14),
              maxLength: 2
            })
          ]
        }, X);
      }
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Is this your business?',
      section: 'businessInformation',
      view: function(n, X) {
        var self = X.data$;
        return foam.u2.CheckBox.create({
          labelFormatter: function() {
            this.start('span')
              .add(self.dot('cnpjName'))
            .end();
          }
        });
      },
      visibility: function(cnpjName) {
        return cnpjName.length > 0 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['verifyName'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.country.br.BrazilBusinessInfoData.VERIFY_NAME, true);
          },
          errorMessage: 'VERIFY_BUSINESS_NAME'
        }
      ]
    },
    {
      class: 'String',
      name: 'nire',
      label: 'State Commercial Identification Number(NIRE)',
      required: true,
      documentation: `NIRE is the State Commercial Identification Number used by the State Commercial Board.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'ie',
      label: 'State Inscription(IE)',
      documentation: `IE is the State Tax Identification Number used by the State Department of Taxation.
          Businesses that sell goods are required to have an IE, used mainly to pay ICMS, tax on the distribution of goods and services.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'im',
      label: 'Municipal Inscription(IM)',
      documentation: `IM is the Municipal Tax Identification Number used by the City Department of Taxation.
          Businesses that sell services are required to have an IM, used mainly to pay ISS, Sales Tax on Services.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'cnpjName',
      label: '',
      hidden: true,
      section: 'businessInformation'
    }
  ],

  methods: [
    {
      name: 'getCNPJBusinessName',
      code:  async function(cnpj) {
        return await this.brazilVerificationService.getCNPJName(this.__subContext__, cnpj);
      }
    },
    {
      name: 'validate',
      javaCode: `
        if ( ! getVerifyName() ) {
          throw new foam.core.ValidationException(CNPJ_INVALID);
        }

        if ( SafetyUtil.isEmpty(getNire()) ) {
          throw new foam.core.ValidationException(NO_NIRE);
        }
      `
    }
  ]
});
