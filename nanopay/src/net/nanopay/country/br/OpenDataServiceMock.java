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
package net.nanopay.country.br;

import foam.core.ContextAwareSupport;
import foam.core.X;

public class OpenDataServiceMock extends ContextAwareSupport implements OpenData {

  protected double stubPTaxRate = 1.1;

  public OpenDataServiceMock(X x) {
    setX(x);
  }

  public void setStubPTaxRate(double val) {
    this.stubPTaxRate = val;
  }

  public PTaxDollarRateResponse getLatestPTaxRates(int days) {
    PTaxDollarRateResponse response = new PTaxDollarRateResponse();
    PTaxRate[] arr = new PTaxRate[1];
    arr[0] = getPTaxRate();
    response.setValue(arr);
    return response;
  }

  public PTaxRate getPTaxRate() throws RuntimeException {
    PTaxRate response = new PTaxRate();
    response.setCotacaoCompra(stubPTaxRate);
    response.setCotacaoVenda(stubPTaxRate);
    return response;
  }
}
