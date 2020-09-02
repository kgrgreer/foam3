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
      view: {
        class: 'foam.u2.FragmentedTextField',
        delegates: [
          {
            class: 'foam.u2.TextField',
            attributes: [ { name: 'maxlength', value: 2 } ]
          },
          '.',
          {
            class: 'foam.u2.TextField',
            attributes: [ { name: 'maxlength', value: 3 } ]
          },
          '.',
          {
            class: 'foam.u2.TextField',
            attributes: [ { name: 'maxlength', value: 3 } ]
          },
          '/',
          {
            class: 'foam.u2.TextField',
            attributes: [ { name: 'maxlength', value: 4 } ]
          },
          '-',
          {
            class: 'foam.u2.TextField',
            attributes: [ { name: 'maxlength', value: 2 } ]
          },
        ]
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        try {
          if ( ! ((FederalRevenueService) x.get("federalRevenueService")).validateCnpj(getCnpj()) )
            throw new RuntimeException("Invalid CNPJ");
        } catch(Throwable t) {
          throw t;
        }
      `
    }
  ]
});
