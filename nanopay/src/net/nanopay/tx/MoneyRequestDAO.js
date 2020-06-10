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
  name: 'MoneyRequestDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Makes transactions out of MoneyRequest objects.`,

  javaImports: [
    'net.nanopay.tx.MoneyRequest',
    'net.nanopay.tx.MoneyRequestResponse',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.*',
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public MoneyRequestDAO(foam.core.X x, foam.dao.DAO delegate) {
    setDelegate(delegate);
  }
       `);
     },
   },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        MoneyRequest request = (MoneyRequest) obj;
        // validate..
        String response;
        try {
          request = (MoneyRequest) getDelegate().put_(x, request);
          //set interact email link.
          response = "https://etransfer.interac.ca/acceptPaymentRequest.do?rID=CA1MREvhpZEx&src";
        }
        catch (RuntimeException E){
          response = "Error 400: " + E.toString();
        }

        // return the return object
        MoneyRequestResponse mrr = new MoneyRequestResponse();
        mrr.setId(request.getRequestId());
        mrr.setGatewayURL(response);
        return mrr;
      `
    }
  ]
});
