package net.nanopay.security.receipt;

public class MerkleTreeReceiptGenerator
  extends net.nanopay.security.receipt.AbstractReceiptGenerator
{
  protected byte[][] tree_ = null;
  protected final String algorithm_;
  protected final net.nanopay.security.MerkleTree builder_;

  protected ThreadLocal<java.security.MessageDigest> md_ =
    new ThreadLocal<java.security.MessageDigest>() {
      @Override
      protected java.security.MessageDigest initialValue() {
        try {
          return java.security.MessageDigest.getInstance(algorithm_);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      }

      @Override
      public java.security.MessageDigest get() {
        java.security.MessageDigest md = super.get();
        md.reset();
        return md;
      }
    };

  public MerkleTreeReceiptGenerator() {
    this("SHA-256");
  }

  public MerkleTreeReceiptGenerator(String algorithm) {
    algorithm_ = algorithm;
    builder_ = new net.nanopay.security.MerkleTree(algorithm);
  }

  protected void add_(foam.core.FObject obj) {
    builder_.addHash(obj.hash(md_.get()));
  }

  @Override
  public void build() {
    tree_ = builder_.buildTree();
  }
}
