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
  ],

  imports: [
    'brazilVerificationService'
  ],

  sections: [
    {
      name: 'businessInformation',
      title: `Please enter your Business' Identification Numbers`
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'nire',
      label: 'NIRE/State Commercial Identification Number',
      required: true,
      documentation: `NIRE is the State Commercial Identification Number used by the State Commercial Board.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'ie',
      label: 'IE/State Inscription',
      documentation: `IE is the State Tax Identification Number used by the State Department of Taxation.
          Businesses that sell goods are required to have an IE, used mainly to pay ICMS, tax on the distribution of goods and services.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'im',
      label: 'IM/Municipal Inscription',
      documentation: `IM is the Municipal Tax Identification Number used by the City Department of Taxation.
          Businesses that sell services are required to have an IM, used mainly to pay ISS, Sales Tax on Services.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'cnpj',
      label: 'CNPJ',
      required: true,
      documentation: `
          CNPJ (short for Cadastro Nacional da Pessoa Jurídica in Portuguese, or National Registry of Legal Entities) is an identification number issued to Brazilian companies by the Department of Federal Revenue of Brazil.
          Format of CNPJ - 14-digit number formatted as 00.000.000/0001-00
          The first eight digits identify the company, the four digits after the slash identify the branch or subsidiary ("0001" defaults to the headquarters), and the last two are check digits`,
      section: 'businessInformation',
      validationPredicates: [
        {
          args: ['cnpj'],
          predicateFactory: function(e) {
            return e.AND(
              e.EQ(foam.mlang.StringLength.create({ arg1: net.nanopay.country.br.BrazilBusinessInfoData.CNPJ }), 14)
            );
          },
          errorString: 'Please enter 14-digit National Registry of Legal Entities Number'
        }
      ],
      tableCellFormatter: function(val) {
        return foam.String.applyFormat(val, 'xx.xxx.xxx/xxxx-xx');
      },
      view: function(_, X) {
        return foam.u2.FragmentedTextField.create({
          delegates: [
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 2 } ],
              data: X.data.cnpj.slice(0,2)
            },
            '.',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              data: X.data.cnpj.slice(2,5)
            },
            '.',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 3 } ],
              data: X.data.cnpj.slice(5,8)
            },
            '/',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 4 } ],
              data: X.data.cnpj.slice(8,12)
            },
            '-',
            {
              class: 'foam.u2.TextField',
              attributes: [ { name: 'maxlength', value: 2 } ],
              data: X.data.cnpj.slice(12,14)
            },
          ]
        })
      }
    },
    {
      class: 'String',
      name: 'name',
      section: 'businessInformation',
      hidden: true,
      expression: function(cnpj) {
        if ( cnpj.length == 14 ) {
          this.name = "";
          return this.getCNPJBusinessName(cnpj).then((n) => {
            this.name = n;
          });
        } else { return ""; }
      }
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Please verify that business name displayed below matches business name attached to your CNPJ.',
      section: 'businessInformation',
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
            return e.EQ(net.nanopay.country.br.BrazilBusinessInfoData.VERIFY_NAME, true);
          },
          errorString: 'Click to verify business name.'
        }
      ]
    },
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
        if ( ! getVerifyName() )
          throw new IllegalStateException("Must verify business name attached to CNPJ is valid.");

        try {
          if ( ! ((BrazilVerificationService) x.get("brazilVerificationService")).validateCnpj(x, getCnpj()) )
            throw new RuntimeException("Invalid CNPJ");
        } catch(Throwable t) {
          throw t;
        }
      `
    }
  ]
});
