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
  package: 'net.nanopay.tx.creditengine',
  name: 'creditCode',

  documentation: `Base model of a credit code used for promotions and for refunding fees`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
  ],

  implements: [
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
    },
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.fee.Fee',
      name: 'fee'
    },
    {
      class: 'Double',
      name: 'discountPercent',
      value: 0
    }
  ],

  methods: [
    {
      name: 'apply',
      args: [
        {
          name: 'plan',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `

      `
    }
  ]
});
