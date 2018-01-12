package net.nanopay.blob;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.*;
import foam.blob.*;
import foam.core.X;
import org.apache.commons.io.IOUtils;
import org.apache.geronimo.mail.util.Hex;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Arrays;
import java.util.UUID;

public class AmazonS3BlobStore
    extends AbstractBlobService
{
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
    if ( blob instanceof IdentifiedBlob ) {
      return blob;
    }

    if ( !(blob instanceof InputStreamBlob) ) {
      throw new RuntimeException("Invalid blob");
    }

    // generate random key, get input stream, create metadata
    String key = UUID.randomUUID().toString();
    InputStream is = ((InputStreamBlob) blob).getInputStream();
    ObjectMetadata metadata = new ObjectMetadata();
    metadata.setContentLength(blob.getSize());

    // send file
    PutObjectRequest request = new PutObjectRequest(bucket_, key, is, metadata)
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
    String key = (String) id;
    GetObjectRequest request = new GetObjectRequest(bucket_, key);
    S3Object result = s3Client_.getObject(request);
    ObjectMetadata metadata = result.getObjectMetadata();
    return new InputStreamBlob(result.getObjectContent(), metadata.getContentLength());
  }

  @Override
  public String urlFor_(X x, Blob blob) {
    if ( !(blob instanceof IdentifiedBlob) ) {
      return null;
    }
    return s3Client_.getUrl(bucket_, ((IdentifiedBlob) blob).getId()).toString();
  }
}