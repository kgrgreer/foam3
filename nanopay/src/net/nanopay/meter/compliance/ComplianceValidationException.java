package net.nanopay.meter.compliance;

/**
 * ComplianceValidationException is intended to be used in
 * the implementation of {@code ComplianceValidator.validate}
 * method.
 * 
 * {@code ComplianceValidator.validate} can throw
 * ComplianceValidationException When encountering failure 
 * e.g., getting timeout or server error response while
 * connecting to third-party service provider.
 */
public class ComplianceValidationException extends RuntimeException {
  public ComplianceValidationException() {
    super();
  }

  public ComplianceValidationException(String message) {
    super(message);
  }
}
