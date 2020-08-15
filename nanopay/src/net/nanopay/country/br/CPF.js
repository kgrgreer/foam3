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

  properties: [
    {
      name: 'data',
      class: 'String',
      validationPredicates: [
        {
          args: ['data'],
          predicateFactory: function(e) {
            return e.AND(
              e.EQ(foam.mlang.StringLength.create({ arg1: net.nanopay.country.br.CPF.DATA }), 11)
            );
          }
        }
      ],
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        try {
          User agent = ((Subject) x.get("subject")).getRealUser();
          if ( ! ((FederalRevenueService) x.get("federalRevenueService")).validateCpf(getData(), agent.getId()) )
            throw new RuntimeException("Invalid CPF");
        } catch(Throwable t) {
          throw t;
        }
      `
    }
  ]
});
