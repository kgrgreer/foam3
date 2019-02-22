package net.nanopay.blob;

import com.amazonaws.services.s3.model.S3Object;
import foam.blob.InputStreamBlob;

import java.io.IOException;
import java.io.InputStream;

public class AmazonS3InputStreamBlob
  extends InputStreamBlob
{
  public S3Object s3Object_;

  public AmazonS3InputStreamBlob(S3Object s3Object, long size) {
    super(s3Object.getObjectContent(), size);
    s3Object_ = s3Object;
  }

  //@Override
  public void close() throws IOException {
    //super.close();
    s3Object_.close();
  }
}
