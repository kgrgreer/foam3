/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
