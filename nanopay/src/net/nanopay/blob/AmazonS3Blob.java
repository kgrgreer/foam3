/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.blob;

import foam.blob.Blob;
import foam.blob.ProxyBlob;

public class AmazonS3Blob
  extends ProxyBlob
{
  protected String key_;

  public AmazonS3Blob(String key, Blob delegate) {
    key_ = key;
    setDelegate(delegate);
  }

  public String getKey() {
    return key_;
  }

  public void setKey(String key) {
    key_ = key;
  }
}