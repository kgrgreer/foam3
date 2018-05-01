package net.nanopay.onboarding.model;

import com.google.gson.annotations.SerializedName;

public class ShortLinksRequest {

  @SerializedName("longDynamicLink")
  protected String longDynamicLink_;

  @SerializedName("suffix")
  protected Suffix suffix_ = new Suffix("SHORT");

  public String getLongDynamicLink() {
    return longDynamicLink_;
  }

  public void setLongDynamicLink(String longDynamicLink) {
    longDynamicLink_ = longDynamicLink;
  }

  public Suffix getSuffix() {
    return suffix_;
  }

  public void setSuffix(Suffix suffix) {
    suffix_ = suffix;
  }

  public static class Suffix {

    @SerializedName("option")
    protected String option_;

    public Suffix(String option) {
      setOption(option);
    }

    public String getOption() {
      return option_;
    }

    public void setOption(String option) {
      option_ = option;
    }
  }
}