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

import net.nanopay.country.br.ExchangeServiceInterface;
import net.nanopay.partner.treviso.api.Entity;
import net.nanopay.partner.treviso.api.FepWebResponse;
import net.nanopay.partner.treviso.api.LoginResponse;
import net.nanopay.partner.treviso.api.LoginRequest;
import net.nanopay.partner.treviso.api.SaveEntityRequest;
import net.nanopay.partner.treviso.api.SearchTitular;
import net.nanopay.partner.treviso.api.SearchTitularResponse;
import net.nanopay.partner.treviso.api.ServiceStatus;
import net.nanopay.partner.treviso.api.TrevisoAPIServiceInterface;

public class TrevisoExchangeServiceMock extends ContextAwareSupport implements ExchangeServiceInterface {

  private Logger logger;

  public TrevisoExchangeServiceMock(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }

  @Override
  public InsertBoletoResponse insertBoleto(InsertBoleto request) {
    InsertBoletoResponse response = new InsertBoletoResponse();
    ServiceStatus result = new ServiceStatus();
    result.setCODRETORNO(0);
    response.setInsertBoletoResult(result);
    return response;
  }

  @Override
  public SearchBoletoResponse searchBoleto(SearchBoleto request) {
    SearchBoletoResponse response = new SearchBoletoResponse();
    ResponseBoleto responseBoleto = new ResponseBoleto();
    ServiceStatus status = new ServiceStatus();
    status.setCODRETORNO(0);
    responseBoleto.setServiceStatus(status);
    response.setSearchBoletoResult(responseBoleto);
    return response;
  }

  @Override
  public SearchTitularResponse searchTitular(SearchTitular request) {
    SearchTitularResponse response = new SearchTitularResponse();
    return response;
  }

  @Override
  public InsertTitularResponse insertTitular(InsertTitular request) {
    InsertTitularResponse response = new InsertTitularResponse();
    return response;
  }

  @Override
  public UpdateTitularResponse updateTitular(UpdateTitular request) {
    UpdateTitularResponse response = new UpdateTitularResponse();
    return response;
  }

  @Override
  public SearchNaturezaResponse searchNatureza(SearchNatureza request) {
    SearchNaturezaResponse response = new SearchNaturezaResponse();
    return response;
  }

}
