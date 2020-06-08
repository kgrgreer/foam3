/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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

foam.CLASS({
  package: 'net.nanopay.blob',
  name: 'AmazonS3BlobStore',
  extends: 'foam.blob.AbstractBlobService',

  javaImports: [
    'com.amazonaws.auth.AWSStaticCredentialsProvider',
    'com.amazonaws.auth.BasicAWSCredentials',
    'com.amazonaws.services.s3.AmazonS3ClientBuilder',
    'com.amazonaws.services.s3.model.*',
    'foam.blob.HashingOutputStream',
    'foam.blob.IdentifiedBlob',
    'foam.blob.InputStreamBlob',
    'foam.nanos.app.AppConfig',
    'org.apache.commons.io.IOUtils',
    'org.apache.commons.codec.binary.Hex',

    'java.io.File',
    'java.io.FileInputStream',
    'java.io.FileOutputStream',
    'java.io.InputStream'
  ],

  properties: [
    {
      class: 'String',
      name: 'region',
      documentation: 'S3 region'
    },
    {
      class: 'String',
      name: 'bucket',
      documentation: 'S3 bucket'
    },
    {
      class: 'String',
      name: 'accessKeyId',
      documentation: 'S3 access key id'
    },
    {
      class: 'String',
      name: 'secretKeyId',
      documentation: 'S3 secret key id'
    },
    {
      class: 'Object',
      name: 's3Client',
      documentation: 'Amazon S3 client',
      javaType: 'com.amazonaws.services.s3.AmazonS3',
      hidden: true,
      transient: true,
      javaFactory:
`BasicAWSCredentials credentials = new BasicAWSCredentials(getAccessKeyId(), getSecretKeyId());
return AmazonS3ClientBuilder.standard()
  .withCredentials(new AWSStaticCredentialsProvider(credentials))
  .withRegion(getRegion())
  .build();`
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
`if ( blob instanceof IdentifiedBlob ) {
  return blob;
}

// TODO: add a BlobInputStream as an adapter which
// implements the InputStream interface against the
// Blob interface. Then we can easily interface with
// any existing APIs that expect streams.

HashingOutputStream os = null;

try {
  File tmp = File.createTempFile("blob", ".tmp");
  os = new HashingOutputStream(new FileOutputStream(tmp));
  blob.read(os, 0, blob.getSize());
  os.close();

  // generate digest, create input stream, create metadata
  AppConfig config = (AppConfig) getX().get("appConfig");
  String key = config.getMode().name() + "/" + Hex.encodeHexString(os.digest());
  InputStream is = new FileInputStream(tmp);
  ObjectMetadata metadata = new ObjectMetadata();
  metadata.setContentLength(tmp.length());

  // send file
  PutObjectRequest request = new PutObjectRequest(getBucket(), key, is, metadata)
    .withCannedAcl(CannedAccessControlList.PublicRead);
  getS3Client().putObject(request);

  // create identified blob with the key as the id
  IdentifiedBlob ret = new IdentifiedBlob();
  ret.setId(key);
  ret.setX(getX());
  return ret;
} catch (Throwable t) {
  throw new RuntimeException(t);
} finally {
  IOUtils.closeQuietly(os);
}`
    },
    {
      name: 'find_',
      javaCode:
`String key = (String) id;
GetObjectRequest request = new GetObjectRequest(getBucket(), key);
S3Object result = getS3Client().getObject(request);
ObjectMetadata metadata = result.getObjectMetadata();
return new AmazonS3InputStreamBlob(result, metadata.getContentLength());`
    },
    {
      name: 'urlFor_',
      javaCode:
`if ( !(blob instanceof IdentifiedBlob) ) {
  return null;
}
return getS3Client().getUrl(getBucket(), ((IdentifiedBlob) blob).getId()).toString();`
    }
  ]
});
