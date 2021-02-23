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
    package: 'net.nanopay.contacts',
    name: 'PaymentCodeServiceInterface',
  
    documentation: `
      A nanoService for retrieving a PublicBusinessInfo object from a payment code
      using the getPublicBusinessInfo method.    
    `,
  
    methods: [
      {
        name: 'getPublicBusinessInfo',
        async: true,
        type: 'net.nanopay.auth.PublicBusinessInfo',
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'paymentCode',
            type: 'String'
          }
        ]
      }
    ]
  });
  