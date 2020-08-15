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
package net.nanopay.partner.treviso.api;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.logger.Logger;

import net.nanopay.partner.treviso.api.Entity;
import net.nanopay.partner.treviso.api.FepWebResponse;
import net.nanopay.partner.treviso.api.LoginResponse;
import net.nanopay.partner.treviso.api.LoginRequest;
import net.nanopay.partner.treviso.api.SaveEntityRequest;
import net.nanopay.partner.treviso.api.TrevisoAPIServiceInterface;

public class TrevisoAPIServiceMock extends ContextAwareSupport implements TrevisoAPIServiceInterface {

  private Logger logger;

  public TrevisoAPIServiceMock(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }

  @Override
  public LoginResponse authenticate(LoginRequest request) {
    LoginResponse response = new LoginResponse();
    response.setToken("FEP_WEB_TOKEN");
    return response;
  }

  @Override
  public FepWebResponse saveEntity(SaveEntityRequest request) {
    FepWebResponse response = new FepWebResponse();
    return response;
  }

  @Override
  public SearchCustomerResponse searchCustomer(SearchCustomerRequest request) {
    SearchCustomerResponse response = new SearchCustomerResponse();
    Entity entity = new Entity();
    entity.setStatus("A");
    response.setEntityDTOList(new Entity[]{entity});
    return response;
  }

  @Override
  public GetDocumentTypeResponse getDocumentTypes(GetDocumentTypeRequest request) {
    GetDocumentTypeResponse response = new GetDocumentTypeResponse();
    response.setDcmntTypNm("CONFIDENTIALITY AGREEMENT");
    return response;
  }

  @Override
  public PTaxDollarRateResponse getLatestPTaxRates() {
    PTaxDollarRateResponse response = new PTaxDollarRateResponse();
    return response;
  }
}
