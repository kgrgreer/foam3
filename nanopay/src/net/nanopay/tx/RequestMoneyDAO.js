/**
 * NANOPAY CONFIDENTIAL
 *
 * 2020 nanopay Corporation
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
  name: 'RequestMoneyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Makes transactions out of RequestMoney objects.`,

  javaImports: [
    'net.nanopay.tx.RequestMoney',
    'net.nanopay.tx.RequestMoneyResponse',
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
  public RequestMoneyDAO(foam.core.X x, foam.dao.DAO delegate) {
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
        RequestMoney request = (RequestMoney) obj;
        // validate..
        String response;
        try {
          request = (RequestMoney) getDelegate().put_(x, request);
          //set interact email link.
          response = "https://etransfer.interac.ca/acceptPaymentRequest.do?rID=CA1MREvhpZEx&src";
        }
        catch (RuntimeException E){
          response = "Error 400: " + E.toString();
        }

        // return the return object
        RequestMoneyResponse mrr = new RequestMoneyResponse();
        mrr.setId(request.getRequestId());
        mrr.setGatewayURL(response);
        return mrr;
      `
    }
  ]
});
