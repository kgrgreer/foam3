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
foam.INTERFACE({
  package: 'net.nanopay.country.br',
  name: 'OpenData',
  methods: [
    {
      name: 'getLatestPTaxRates',
      type: 'net.nanopay.country.br.PTaxDollarRateResponse',
      documentation: 'Get latest PTax rates from Brazil central bank open api: https://olinda.bcb.gov.br/olinda/service/PTAX/version/v1/odata',
      async: true,
      args: [
        {
          type: 'int',
          name: 'days'
        }
      ]
    },
    {
      name: 'getPTaxRate',
      type: 'net.nanopay.country.br.PTaxRate',
      documentation: 'Get latest PTax rate',
      async: true,
      javaThrows: ['java.lang.RuntimeException']
    }
  ]
});
