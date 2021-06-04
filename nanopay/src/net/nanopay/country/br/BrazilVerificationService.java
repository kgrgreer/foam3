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
import foam.util.SafetyUtil;
import java.text.SimpleDateFormat;
import java.util.*;
import static foam.mlang.MLang.*;

import net.nanopay.partner.soawebservices.SoaWebService;
import net.nanopay.partner.soawebservices.PessoaFisicaNFe;
import net.nanopay.partner.soawebservices.PessoaJuridicaNFe;
import net.nanopay.partner.soawebservices.PessoaResponse;

public class BrazilVerificationService
  extends    ContextAwareSupport
  implements BrazilVerificationServiceInterface, NanoService {

  protected DAO userDAO;
  private Logger logger_;

  @Override
  public boolean validateCnpj(X x, String cnpj)  throws RuntimeException {
    PessoaResponse res = getCNPJResponseData(cnpj);
    if ( res != null && "ativa".equalsIgnoreCase(res.getSituacaoRFB()) ) return true;
    return false;
  }

  @Override
  public String getCNPJName(X x, String cnpj) throws RuntimeException {
    PessoaResponse res = getCNPJResponseData(cnpj);
    if ( res != null && "ativa".equalsIgnoreCase(res.getSituacaoRFB()) ) return res.getRazaoSocial();
    return "";
  }

  @Override
  public String getCPFName(X x, String cpf, long userId) throws RuntimeException {
    PessoaResponse res = getCPFResponseData(cpf, userId);
    if ( res != null && "REGULAR".equalsIgnoreCase(res.getSituacaoRFB())
      && SafetyUtil.isEmpty(res.getMensagemObito())
      && ("0000".equals(res.getAnoObito())
      || SafetyUtil.isEmpty(res.getAnoObito())) ) return res.getNome();

    return "";
  }

  @Override
  public String getCPFNameWithBirthDate(X x, String cpf, Date birthDate) throws RuntimeException {
    PessoaResponse res = getCPFResponseData(cpf, birthDate);
    if ( res != null && "REGULAR".equalsIgnoreCase(res.getSituacaoRFB())
      && SafetyUtil.isEmpty(res.getMensagemObito())
      && ( "0000".equals(res.getAnoObito())
      || SafetyUtil.isEmpty(res.getAnoObito())) ) {
      return res.getNome();
    }
    return "";
  }

  @Override
  public boolean validateUserCpf(X x, String cpf, long userId) throws RuntimeException {
    PessoaResponse res = getCPFResponseData(cpf, userId);
    if ( res != null && "REGULAR".equalsIgnoreCase(res.getSituacaoRFB())
      && SafetyUtil.isEmpty(res.getMensagemObito())
      && ( "0000".equals(res.getAnoObito())
      || SafetyUtil.isEmpty(res.getAnoObito())) ) return true;

    return false;
  }

  @Override
  public boolean validateCpf(X x, String cpf, Date birthDate) throws RuntimeException {
    PessoaResponse res = getCPFResponseData(cpf, birthDate);
    if ( res != null && "REGULAR".equalsIgnoreCase(res.getSituacaoRFB())
      && SafetyUtil.isEmpty(res.getMensagemObito())
      && ( "0000".equals(res.getAnoObito())
      || SafetyUtil.isEmpty(res.getAnoObito())) )  return true;

    return false;
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
    if ( birthDate == null ) throw new ValidationException("User birth date not found");

    String formattedCpf = cpf.replaceAll("[^0-9]", "");
    PessoaResponse response = findFromCPFCache(formattedCpf, birthDate);
    if ( response != null ) return response;

    try {
      String birthDateString = "";
      try {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        birthDateString = sdf.format(birthDate);
      } catch(Throwable t) {
        throw new RuntimeException("Unable to parse user birth date");
      }


      PessoaFisicaNFe request = new PessoaFisicaNFe();
      request.setDocumento(formattedCpf);
      request.setDataNascimento(birthDateString);
      response = ((SoaWebService) getX().get("soaWebService"))
        .pessoaFisicaNFe(request);
      if ( response == null ) {
        throw new RuntimeException("SoaWebService.PessoaFisicaNFe no response");
      }
      DAO alarmDAO = (DAO) getX().get("alarmDAO");
      Alarm serviceAlarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, this.getClass().getSimpleName()));
      if ( serviceAlarm != null ) {
        serviceAlarm = (Alarm) serviceAlarm.fclone();
        serviceAlarm.setIsActive(false);
        alarmDAO.put(serviceAlarm);
      }
      return saveCPFValidationResponse(formattedCpf, birthDate, response).getResponse();
    } catch (Throwable t) {
      Alarm alarm = new Alarm.Builder(getX())
        .setName(this.getClass().getSimpleName())
        .setSeverity(foam.log.LogLevel.ERROR)
        .setReason(AlarmReason.TIMEOUT)
        .setNote(t.getMessage())
        .setIsActive(true)
        .build();
      ((DAO) getX().get("alarmDAO")).put(alarm);
      throw t;
    }
  }

  protected PessoaResponse getCNPJResponseData(String cnpj) throws RuntimeException {
    try {
      String formattedCnpj = cnpj.replaceAll("[^0-9]", "");
      PessoaResponse response = findFromCNPJCache(formattedCnpj);
      if ( response != null ) return response;

      PessoaJuridicaNFe request = new PessoaJuridicaNFe();
      request.setDocumento(formattedCnpj);
      response = ((SoaWebService) getX().get("soaWebService")).pessoaJuridicaNFe(request);
      if ( response == null ) {
        throw new RuntimeException("SoaWebService.PessoaJuridicaNFe no response");
      }
      DAO alarmDAO = (DAO) getX().get("alarmDAO");
      Alarm serviceAlarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, this.getClass().getSimpleName()));
      if ( serviceAlarm != null ) {
        serviceAlarm = (Alarm) serviceAlarm.fclone();
        serviceAlarm.setIsActive(false);
        alarmDAO.put(serviceAlarm);
      }
      return saveCNPJValidationResponse(formattedCnpj, response).getResponse();
    } catch (Throwable t) {
      Alarm alarm = new Alarm.Builder(getX())
        .setName(this.getClass().getSimpleName())
        .setSeverity(foam.log.LogLevel.ERROR)
        .setReason(AlarmReason.TIMEOUT)
        .setNote(t.getMessage())
        .setIsActive(true)
        .build();
      ((DAO) getX().get("alarmDAO")).put(alarm);
      throw t;
    }
  }

  protected CPFCache saveCPFValidationResponse(String cpf, Date birthDate, PessoaResponse response) throws RuntimeException {
    DAO cpfCacheDAO =   (DAO) getX().get("cpfCacheDAO");
    return (CPFCache) cpfCacheDAO.put(new CPFCache.Builder(getX())
      .setCpf(cpf)
      .setBirthDate(birthDate)
      .setResponse(response)
      .setResponseString(response.getResponseString())
      .build());
  }

  protected PessoaResponse findFromCPFCache(String cpf, Date birthDate) {
    DAO cpfCacheDAO =   (DAO) getX().get("cpfCacheDAO");
    CPFCache cache = (CPFCache) cpfCacheDAO.find(AND(
      EQ(CPFCache.CPF, cpf),
      EQ(CPFCache.BIRTH_DATE, birthDate))
    );
    return cache == null ? null : cache.getResponse();
  }

  protected CNPJCache saveCNPJValidationResponse(String cnpj, PessoaResponse response) throws RuntimeException {
    DAO cnpjCacheDAO =   (DAO) getX().get("cnpjCacheDAO");
    return (CNPJCache) cnpjCacheDAO.put(new CNPJCache.Builder(getX())
      .setCnpj(cnpj)
      .setResponse(response)
      .setResponseString(response.getResponseString())
      .build());
  }

  protected PessoaResponse findFromCNPJCache(String cnpj) {
    DAO cnpjCacheDAO =   (DAO) getX().get("cnpjCacheDAO");
    CNPJCache cache = (CNPJCache) cnpjCacheDAO.find(EQ(CNPJCache.CNPJ, cnpj));
    return cache == null ? null : cache.getResponse();
  }

  protected Date findUserBirthDate(long userId) {
    UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) getX().get("userCapabilityJunctionDAO")).find(AND(
      EQ(UserCapabilityJunction.TARGET_ID, "crunch.onboarding.user-birth-date"),
      EQ(UserCapabilityJunction.SOURCE_ID, userId)
    ));
    return (ucj != null && ucj.getData() != null) ? (Date) ((foam.core.FObject) ucj.getData()).getProperty("birthday") : null;
  }

}
