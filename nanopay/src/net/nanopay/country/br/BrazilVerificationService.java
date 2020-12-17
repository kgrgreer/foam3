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
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.logger.Logger;
import java.text.SimpleDateFormat;
import java.util.*;
import static foam.mlang.MLang.*;

import net.nanopay.partner.soawebservices.SoaWebService;
import net.nanopay.partner.soawebservices.PessoaFisicaSimplificada;
import net.nanopay.partner.soawebservices.PessoaJuridicaSimplificada;
import net.nanopay.partner.soawebservices.PessoaResponse;

public class BrazilVerificationService
  extends    ContextAwareSupport
  implements BrazilVerificationServiceInterface, NanoService {

  protected DAO userDAO;
  private Logger logger_;

  @Override
  public boolean validateCnpj(X x, String cnpj) throws RuntimeException {
    try {
      PessoaResponse data = getCNPJResponseData(cnpj);
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CNPJ validation.");

      return data.getStatus();
    } catch(Throwable t) {
      logger_.error("Error getting CNPJ Data" , t);
      throw new RuntimeException("Unable to validate CNPJ");
    }
  }

  @Override
  public String getCNPJName(X x, String cnpj) throws RuntimeException {
    try {
      PessoaResponse data = getCNPJResponseData(cnpj);
      if ( data != null ) return data.getNome();

    } catch(Throwable t) {
      logger_.error("Error getting CNPJ Data" , t);
      throw new RuntimeException("Unable to validate CNPJ");
    }
    return "";
  }

  @Override
  public String getCPFName(X x, String cpf, long userId) throws RuntimeException {
    try {
      PessoaResponse data = getCPFResponseData(cpf, userId);
      if ( data != null ) return data.getNome();
    } catch(Throwable t) {
      logger_.error("Error getting CPF Data" , t);
      throw new RuntimeException("Unable to validate CPF");
    }
    return "";
  }

  @Override
  public String getCPFNameWithBirthDate(X x, String cpf, Date birthDate) throws RuntimeException {
    try {
      PessoaResponse data = getCPFResponseData(cpf, birthDate);
      if ( data != null ) return data.getNome();
    } catch(Throwable t) {
      logger_.error("Error getting CPF Data" , t);
      throw new RuntimeException("Unable to validate CPF");
    }
    return "";
  }

  @Override
  public boolean validateUserCpf(X x, String cpf, long userId) throws RuntimeException {
    try {
      PessoaResponse data = getCPFResponseData(cpf, userId);
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CPF validation.");

      return data.getStatus();
    } catch(Throwable t) {
      logger_.error("Error getting CPF Data" , t);
      throw new RuntimeException("Unable to validate CPF");
    }
  }

  @Override
  public boolean validateCpf(X x, String cpf, Date birthDate) throws RuntimeException {
    try {
      PessoaResponse data = getCPFResponseData(cpf, birthDate);
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CPF validation.");

      return data.getStatus();
    } catch(Throwable t) {
      logger_.error("Error getting CPF Data" , t);
      throw new RuntimeException("Unable to validate CPF");
    }
  }

  @Override
  public void start() {
    userDAO   = (DAO) getX().get("userDAO");
    this.logger_ = (Logger) getX().get("logger");
  }

  protected PessoaResponse getCPFResponseData(String cpf, long userId) throws RuntimeException {
    return getCPFResponseData(cpf, findUserBirthDate(userId));
  }

  protected PessoaResponse getCPFResponseData(String cpf, Date birthDate) throws RuntimeException {
    if ( birthDate == null ) return null;

    String birthDateString = "";
    try {
      SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      birthDateString = sdf.format(birthDate);
    } catch(Throwable t) {
      throw new RuntimeException("Unable to parse user birth date.");
    }

    String formattedCpf = cpf.replaceAll("[^0-9]", "");
    PessoaFisicaSimplificada request = new PessoaFisicaSimplificada();
    request.setDocumento(formattedCpf);
    request.setDataNascimento(birthDateString);
    return ((SoaWebService) getX().get("soaWebService"))
      .pessoaFisicaSimplificada(request);
  }

  protected PessoaResponse getCNPJResponseData(String cnpj) throws RuntimeException {
    String formattedCnpj = cnpj.replaceAll("[^0-9]", "");
    PessoaJuridicaSimplificada request = new PessoaJuridicaSimplificada();
    request.setDocumento(formattedCnpj);

    return ((SoaWebService) getX().get("soaWebService")).pessoaJuridicaSimplificada(request);
  }

  protected Date findUserBirthDate(long userId) {
    UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) getX().get("userCapabilityJunctionDAO")).find(AND(
      EQ(UserCapabilityJunction.TARGET_ID, "8bffdedc-5176-4843-97df-1b75ff6054fb"),
      EQ(UserCapabilityJunction.SOURCE_ID, userId)
    ));
    return (ucj != null && ucj.getData() != null) ? ((net.nanopay.crunch.onboardingModels.UserBirthDateData)ucj.getData()).getBirthday() : null;
  }

}
