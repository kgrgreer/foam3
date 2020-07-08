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
  package: 'net.nanopay.tx',
  name: 'TransactionNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactionSuccessDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactionErrorDAO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionNotificationDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setTransactionSuccessDAO((DAO) getX().get("transactionSuccessDAO"));
            setTransactionErrorDAO((DAO) getX().get("transactionErrorDAO"));
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        try {
          FObject result = super.put_(x, obj);
          getTransactionSuccessDAO().put(result);
          return result;
        } catch (Throwable t) {
          getTransactionErrorDAO().put(obj);
          throw t;
        }
      `
    }
  ]
});
