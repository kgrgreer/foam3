package net.nanopay.security.csp;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class CSPViolationReport {

  public class CSPReport {

    @SerializedName("blocked-uri")
    @Expose
    private String blockedUri;
    @SerializedName("disposition")
    @Expose
    private String disposition;
    @SerializedName("document-uri")
    @Expose
    private String documentUri;
    @SerializedName("effective-directive")
    @Expose
    private String effectiveDirective;
    @SerializedName("original-policy")
    @Expose
    private String originalPolicy;
    @SerializedName("referrer")
    @Expose
    private String referrer;
    @SerializedName("script-sample")
    @Expose
    private String scriptSample;
    @SerializedName("status-code")
    @Expose
    private int statusCode;
    @SerializedName("violated-directive")
    @Expose
    private String violatedDirective;
    @SerializedName("source-file")
    @Expose
    private String sourceFile;
    @SerializedName("line-number")
    @Expose
    private int lineNumber;
    @SerializedName("column-number")
    @Expose
    private int columnNumber;

    public String getBlockedUri() {
      return blockedUri;
    }

    public void setBlockedUri(String blockedUri) {
      this.blockedUri = blockedUri;
    }

    public String getDisposition() {
      return disposition;
    }

    public void setDisposition(String disposition) {
      this.disposition = disposition;
    }

    public String getDocumentUri() {
      return documentUri;
    }

    public void setDocumentUri(String documentUri) {
      this.documentUri = documentUri;
    }

    public String getEffectiveDirective() {
      return effectiveDirective;
    }

    public void setEffectiveDirective(String effectiveDirective) {
      this.effectiveDirective = effectiveDirective;
    }

    public String getOriginalPolicy() {
      return originalPolicy;
    }

    public void setOriginalPolicy(String originalPolicy) {
      this.originalPolicy = originalPolicy;
    }

    public String getReferrer() {
      return referrer;
    }

    public void setReferrer(String referrer) {
      this.referrer = referrer;
    }

    public String getScriptSample() {
      return scriptSample;
    }

    public void setScriptSample(String scriptSample) {
      this.scriptSample = scriptSample;
    }

    public int getStatusCode() {
      return statusCode;
    }

    public void setStatusCode(int statusCode) {
      this.statusCode = statusCode;
    }

    public String getViolatedDirective() {
      return violatedDirective;
    }

    public void setViolatedDirective(String violatedDirective) {
      this.violatedDirective = violatedDirective;
    }

    public String getSourceFile() {
      return sourceFile;
    }

    public void setSourceFile(String sourceFile) {
      this.sourceFile = sourceFile;
    }

    public int getLineNumber() {
      return lineNumber;
    }

    public void setLineNumber(int lineNumber) {
      this.lineNumber = lineNumber;
    }

    public int getColumnNumber() {
      return columnNumber;
    }

    public void setColumnNumber(int columnNumber) {
      this.columnNumber = columnNumber;
    }

  }

  @SerializedName("csp-report")
  @Expose
  private CSPReport report;

  public CSPReport getCSPReport() {
    return report;
  }

  public void setCSPReport(CSPReport report) {
    this.report = report;
  }

}
