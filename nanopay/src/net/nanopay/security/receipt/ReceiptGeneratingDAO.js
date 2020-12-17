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
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Performs receipt generation on all objects that pass through this DAO.
  `,

  imports: [
    'DAO receiptDAO'
  ],

  javaImports: [
    'foam.dao.DAO'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerator',
      name: 'generator'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        try {
          ReceiptGenerator generator = getGenerator();
          generator.add(obj);

          // store receipt in receipt DAO
          foam.dao.DAO receiptDAO = (foam.dao.DAO) getReceiptDAO();
          receiptDAO.inX(x).put(generator.generate(obj));

          return super.put_(x, obj);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
