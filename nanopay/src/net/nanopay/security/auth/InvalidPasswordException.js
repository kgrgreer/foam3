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
  name: 'InvalidPasswordException',
  package: 'net.nanopay.security.auth',
  extends: 'foam.nanos.auth.InvalidPasswordException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      name: 'exceptionMessage',
      value: '{{message}} attempts remaining'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public InvalidPasswordException() {
  }

  public InvalidPasswordException(String message) {
    super(message);
  }

  public InvalidPasswordException(Throwable cause) {
    super(cause);
  }

  public InvalidPasswordException(String message, Exception cause) {
    super(message, cause);
  }
        `);
      }
    }
  ]
});
