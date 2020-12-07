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
package net.nanopay.partner.soawebservices;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.logger.Logger;

public class SoaWebServiceClientMock extends ContextAwareSupport implements SoaWebService {

  private Logger logger;

  public SoaWebServiceClientMock(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }

  @Override
  public PessoaResponse pessoaFisicaSimplificada(PessoaFisicaSimplificada request) {
    if ( "10786348070".equals(request.getDocumento()) ) {
      PessoaResponse res = new PessoaResponse();
      res.setNome("Mock Legal User");
      res.setStatus(true);
      return res;
    } else {
      return new SoaWebServiceClient(getX()).pessoaFisicaSimplificada(request);
    }
  }

  @Override
  public PessoaResponse pessoaJuridicaSimplificada(PessoaJuridicaSimplificada request) {
    if ( "06990590000123".equals(request.getDocumento()) ) {
      PessoaResponse res = new PessoaResponse();
      res.setNome("Mock Legal User");
      res.setStatus(true);
      return res;
    } else {
      return new SoaWebServiceClient(getX()).pessoaJuridicaSimplificada(request);
    }
  }
}
