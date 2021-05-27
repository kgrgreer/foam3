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
  name: 'TransactionException',
  package: 'net.nanopay.tx',
  extends: 'foam.core.FOAMException',
  javaGenerateConvenienceConstructor: false,
  javaGenerateDefaultConstructor: false,


  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public TransactionException() {
    super();
  }

  public TransactionException(String message) {
    super(message);
  }

  public TransactionException(String message, Exception cause) {
    super(message, cause);
  }

  public TransactionException(Exception cause) {
    super(cause);
  }
          `
        }));
      }
    }
  ]
});
