/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx.ruler.exceptions',
  name: 'TransactionValidationException',
  extends: 'foam.core.ValidationException',
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      class: 'String',
      name: 'transactionId'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
    public TransactionValidationException(String message) {
      super(message);
    }

    public TransactionValidationException(String message, java.lang.Exception cause) {
      super(message, cause);
    }
            `
        }));
      }
    }
  ]
});
