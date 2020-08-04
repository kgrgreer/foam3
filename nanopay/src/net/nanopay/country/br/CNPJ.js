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
  name: 'CNPJ',
  documentation: `
    CNPJ (short for Cadastro Nacional da Pessoa Jurídica in Portuguese, or National Registry of Legal Entities) is an identification number issued to Brazilian companies by the Department of Federal Revenue of Brazil.

    Format of CNPJ - 14-digit number formatted as 00.000.000/0001-00

    The first eight digits identify the company, the four digits after the slash identify the branch or subsidiary ("0001" defaults to the headquarters), and the last two are check digits
  `,

  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
  ],

  properties: [
    {
      name: 'data',
      class: 'String',
      validationPredicates: [
        {
          args: ['data'],
          predicateFactory: function(e) {
            return e.AND(
              e.EQ(foam.mlang.StringLength.create({ arg1: net.nanopay.country.br.CNPJ.DATA }), 14)
            );
          }
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
          if ( ! ((FederalRevenueService) x.get("federalRevenueService")).validateCnpj(getData()) )
            throw new RuntimeException("Invalid CNPJ");
        } catch(Throwable t) {
          throw t;
        }
      `
    }
  ]
});
