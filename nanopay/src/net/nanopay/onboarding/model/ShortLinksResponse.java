package net.nanopay.onboarding.model;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class ShortLinksResponse {

  @SerializedName("shortLink")
  protected String shortLink_;

  @SerializedName("warning")
  protected List<Warning> warning_ = null;

  @SerializedName("previewLink")
  protected String previewLink_;

  public String getShortLink() {
    return shortLink_;
  }

  public void setShortLink(String shortLink) {
    shortLink_ = shortLink;
  }

  public List<Warning> getWarning() {
    return warning_;
  }

  public void setWarning(List<Warning> warning) {
    warning_ = warning;
  }

  public String getPreviewLink() {
    return previewLink_;
  }

  public void setPreviewLink(String previewLink) {
    previewLink_ = previewLink;
  }

  public static class Warning {

    @SerializedName("warningCode")
    protected String warningCode_;

    @SerializedName("warningMessage")
    protected String warningMessage_;

    public String getWarningCode() {
      return warningCode_;
    }

    public void setWarningCode(String warningCode) {
      warningCode_ = warningCode;
    }

    public String getWarningMessage() {
      return warningMessage_;
    }

    public void setWarningMessage(String warningMessage) {
      warningMessage_ = warningMessage;
    }
  }
}