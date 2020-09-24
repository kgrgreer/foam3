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

import net.nanopay.partner.sintegra.Sintegra;
import net.nanopay.partner.sintegra.CPFResponseData;
import net.nanopay.partner.sintegra.CNPJResponseData;
import net.nanopay.partner.treviso.TrevisoCredientials;

public class BrazilVerificationService
  extends    ContextAwareSupport
  implements BrazilVerificationServiceInterface, NanoService {

  protected DAO userDAO;
  private Logger logger_;

  @Override
  public boolean validateCnpj(X x, String cnpj) throws RuntimeException {
    try {
      CNPJResponseData data = getCNPJResponseData(cnpj);
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CNPJ validation.");

      return "ATIVA".equals(data.getSituacao());
    } catch(Throwable t) {
      logger_.error("Error getting CNPJ Data" , t);
      throw new RuntimeException("Unable to validate CNPJ");
    }
  }

  @Override
  public String getCNPJName(X x, String cnpj) throws RuntimeException {
    try {
      CNPJResponseData data = getCNPJResponseData(cnpj);
      if ( data != null ) return data.getNome();

    } catch(Throwable t) {
      logger_.error("Error getting CNPJ Data" , t);
      throw new RuntimeException("Unable to validate CNPJ");
    }
    return "";
  }

  @Override
  public String getCPFName(X x, String cpf) throws RuntimeException {
    try {
      User agent = ((Subject) x.get("subject")).getRealUser();
      CPFResponseData data = getCPFResponseData(cpf, agent.getId());
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
      CPFResponseData data = getCPFResponseData(cpf, birthDate);
      if ( data != null ) return data.getNome();
    } catch(Throwable t) {
      logger_.error("Error getting CPF Data" , t);
      throw new RuntimeException("Unable to validate CPF");
    }
    return "";
  }

  @Override
  public boolean validateUserCpf(X x, String cpf) throws RuntimeException {
    try {
      User agent = ((Subject) x.get("subject")).getRealUser();
      CPFResponseData data = getCPFResponseData(cpf, agent.getId());
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CPF validation.");

      System.out.println(data.getSituacaoCadastral());
      return "REGULAR".equalsIgnoreCase(data.getSituacaoCadastral());
    } catch(Throwable t) {
      logger_.error("Error getting CPF Data" , t);
      throw new RuntimeException("Unable to validate CPF");
    }
  }

  @Override
  public boolean validateCpf(X x, String cpf, Date birthDate) throws RuntimeException {
    try {
      User agent = ((Subject) x.get("subject")).getRealUser();
      CPFResponseData data = getCPFResponseData(cpf, birthDate);
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CPF validation.");

      System.out.println(data.getSituacaoCadastral());
      return "REGULAR".equalsIgnoreCase(data.getSituacaoCadastral());
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

  protected CPFResponseData getCPFResponseData(String cpf, long userId) throws RuntimeException {
    return getCPFResponseData(cpf, findUserBirthDate(userId));
  }

  protected CPFResponseData getCPFResponseData(String cpf, Date birthDate) throws RuntimeException {
    TrevisoCredientials credentials = (TrevisoCredientials) getX().get("TrevisoCredientials");
    if ( null == credentials )
      throw new RuntimeException("Invalid credientials. Treviso token required to validate CPF");

    String birthDateString = "";
    try {
      SimpleDateFormat sdf = new SimpleDateFormat("ddMMyyyy");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      birthDateString = sdf.format(birthDate);
    } catch(Throwable t) {
      throw new RuntimeException("Unable to parse user birth date.");
    }

    String formattedCpf = cpf.replaceAll("[^0-9]", "");
    return ((Sintegra) getX().get("sintegraService"))
      .getCPFData(formattedCpf, birthDateString, credentials.getSintegraToken());
  }

  protected CNPJResponseData getCNPJResponseData(String cnpj) throws RuntimeException {
    TrevisoCredientials credentials = (TrevisoCredientials) getX().get("TrevisoCredientials");
    if ( null == credentials )
      throw new RuntimeException("Invalid credientials. Treviso token required to validate CNPJ");

    String formattedCnpj = cnpj.replaceAll("[^0-9]", "");
    return ((Sintegra) getX().get("sintegraService")).getCNPJData(formattedCnpj, credentials.getSintegraToken());
  }

  protected Date findUserBirthDate(long userId) {
    UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) getX().get("userCapabilityJunctionDAO")).find(AND(
      EQ(UserCapabilityJunction.TARGET_ID, "8bffdedc-5176-4843-97df-1b75ff6054fb"),
      EQ(UserCapabilityJunction.SOURCE_ID, userId)
    ));
    return (ucj != null && ucj.getData() != null) ? ((net.nanopay.crunch.onboardingModels.UserBirthDateData)ucj.getData()).getBirthday() : null;
  }

}
