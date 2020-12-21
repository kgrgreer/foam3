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
import foam.core.ValidationException;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
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
  public boolean validateCnpj(X x, String cnpj)  throws RuntimeException {
    return getCNPJResponseData(cnpj).getStatus();
  }

  @Override
  public String getCNPJName(X x, String cnpj) throws RuntimeException {
    return getCNPJResponseData(cnpj).getNome();
  }

  @Override
  public String getCPFName(X x, String cpf, long userId) throws RuntimeException {
    return getCPFResponseData(cpf, userId).getNome();
  }

  @Override
  public String getCPFNameWithBirthDate(X x, String cpf, Date birthDate) throws RuntimeException {
    return getCPFResponseData(cpf, birthDate).getNome();
  }

  @Override
  public boolean validateUserCpf(X x, String cpf, long userId) throws RuntimeException {
    return getCPFResponseData(cpf, userId).getStatus();
  }

  @Override
  public boolean validateCpf(X x, String cpf, Date birthDate) throws RuntimeException {
    return getCPFResponseData(cpf, birthDate).getStatus();
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
    if ( birthDate == null ) {
      throw new ValidationException("User birth date not found");
    };

    try {
      String birthDateString = "";
      try {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        birthDateString = sdf.format(birthDate);
      } catch(Throwable t) {
        throw new RuntimeException("Unable to parse user birth date");
      }

      String formattedCpf = cpf.replaceAll("[^0-9]", "");
      PessoaFisicaSimplificada request = new PessoaFisicaSimplificada();
      request.setDocumento(formattedCpf);
      request.setDataNascimento(birthDateString);
      PessoaResponse response = ((SoaWebService) getX().get("soaWebService"))
        .pessoaFisicaSimplificada(request);
      if ( response == null ) {
        throw new RuntimeException("SoaWebService.pessoaFisicaSimplificada no response");
      }
      ((DAO) getX().get("alarmDAO")).put(new Alarm(this.getClass().getSimpleName(), false));
      return response;
    } catch (Throwable t) {
      Alarm alarm = new Alarm.Builder(getX())
        .setName(this.getClass().getSimpleName())
        .setSeverity(foam.log.LogLevel.ERROR)
        .setReason(AlarmReason.TIMEOUT)
        .setNote(t.getMessage())
        .build();
      ((DAO) getX().get("alarmDAO")).put(alarm);
      throw t;
    }
  }

  protected PessoaResponse getCNPJResponseData(String cnpj) throws RuntimeException {
    try {
      String formattedCnpj = cnpj.replaceAll("[^0-9]", "");
      PessoaJuridicaSimplificada request = new PessoaJuridicaSimplificada();
      request.setDocumento(formattedCnpj);

      PessoaResponse response = ((SoaWebService) getX().get("soaWebService")).pessoaJuridicaSimplificada(request);
      if ( response == null ) {
        throw new RuntimeException("SoaWebService.pessoaJuridicaSimplificada no response");
      }
      ((DAO) getX().get("alarmDAO")).put(new Alarm(this.getClass().getSimpleName(), false));
      return response;
    } catch (Throwable t) {
      Alarm alarm = new Alarm.Builder(getX())
        .setName(this.getClass().getSimpleName())
        .setSeverity(foam.log.LogLevel.ERROR)
        .setReason(AlarmReason.TIMEOUT)
        .setNote(t.getMessage())
        .build();
      ((DAO) getX().get("alarmDAO")).put(alarm);
      throw t;
    }
  }

  protected Date findUserBirthDate(long userId) {
    UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) getX().get("userCapabilityJunctionDAO")).find(AND(
      EQ(UserCapabilityJunction.TARGET_ID, "8bffdedc-5176-4843-97df-1b75ff6054fb"),
      EQ(UserCapabilityJunction.SOURCE_ID, userId)
    ));
    return (ucj != null && ucj.getData() != null) ? ((net.nanopay.crunch.onboardingModels.UserBirthDateData)ucj.getData()).getBirthday() : null;
  }

}
