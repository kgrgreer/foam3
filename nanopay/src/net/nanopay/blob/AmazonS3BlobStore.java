/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.blob;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.*;
import foam.blob.*;
import foam.core.X;
import org.apache.commons.io.IOUtils;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Arrays;

public class AmazonS3BlobStore
  extends AbstractBlobService
{
  public static final int BUFFER_SIZE = 8192;

  protected String bucket_;
  protected AmazonS3 s3Client_ = null;

  public AmazonS3BlobStore(X x, String bucket, String accessKeyId, String secretKeyId) {
    this(x, "us-east-1", bucket, accessKeyId, secretKeyId);
  }

  public AmazonS3BlobStore(X x, String region, String bucket, String accessKeyId, String secretKeyId) {
    setX(x);
    bucket_ = bucket;
    BasicAWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretKeyId);
    s3Client_ = AmazonS3ClientBuilder.standard()
        .withCredentials(new AWSStaticCredentialsProvider(credentials))
        .withRegion(region)
        .build();
  }

  @Override
  public Blob put_(X x, Blob blob) {
    // check if instance of AmazonS3Blob
    if ( !(blob instanceof AmazonS3Blob) ) {
      throw new RuntimeException("Invalid blob");
    }

    // Check if delegate instance of FileBlob
    AmazonS3Blob s3Blob = (AmazonS3Blob) blob;
    if ( !(s3Blob.getDelegate() instanceof FileBlob) ) {
      throw new RuntimeException("Invalid blob");
    }

    // upload file to S3
    FileBlob fileBlob = (FileBlob) s3Blob.getDelegate();
    String key = s3Blob.getKey() + "/" + fileBlob.getFile().getName();
    PutObjectRequest request = new PutObjectRequest(bucket_, key, fileBlob.getFile())
        .withCannedAcl(CannedAccessControlList.PublicRead);
    s3Client_.putObject(request);

    // create identified blob with the key as the id
    IdentifiedBlob ret = new IdentifiedBlob();
    ret.setId(key);
    ret.setX(getX());
    return ret;
  }

  @Override
  public Blob find_(X x, Object id) {
    InputStream is = null;
    ByteArrayOutputStream os = null;

    try {
      String key = (String) id;
      GetObjectRequest request = new GetObjectRequest(bucket_, key);
      S3Object result = s3Client_.getObject(request);
      ObjectMetadata metadata = result.getObjectMetadata();

      is = result.getObjectContent();
      os = new ByteArrayOutputStream();

      int read = 0;
      int count = 0;
      long length = metadata.getContentLength();

      byte[] buffer = new byte[BUFFER_SIZE];
      while ( (read = is.read(buffer, 0, BUFFER_SIZE) ) != -1 && count <= length ) {
        os.write(buffer, 0, read);
        count += read;
      }

      return new ByteArrayBlob(os.toByteArray());
    } catch (Throwable t) {
      t.printStackTrace();
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(os);
      IOUtils.closeQuietly(is);
    }
  }

  @Override
  public String urlFor_(X x, Blob blob) {
    throw new UnsupportedOperationException("Unsupported operation: urlFor_");
  }
}