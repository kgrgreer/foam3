package net.nanopay.country.br;

import foam.core.X;

import java.util.Date;

public class NullBrazilVerificationService
  implements BrazilVerificationServiceInterface {

  @Override
  public boolean validateCnpj(X x, String cnpj) throws RuntimeException {
    return false;
  }

  @Override
  public boolean validateUserCpf(X x, String cpf, long userId) throws RuntimeException {
    return false;
  }

  @Override
  public boolean validateCpf(X x, String cpf, Date birthDate) throws RuntimeException {
    return false;
  }

  @Override
  public String getCPFName(X x, String cpf, long userId) throws RuntimeException {
    return null;
  }

  @Override
  public String getCPFNameWithBirthDate(X x, String cpf, Date birthDate) throws RuntimeException {
    return null;
  }

  @Override
  public String getCNPJName(X x, String cnpj) throws RuntimeException {
    return null;
  }
}
