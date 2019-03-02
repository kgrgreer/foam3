package net.nanopay.bench;

import foam.nanos.bench.Benchmark;
import foam.util.SecurityUtil;

import java.math.BigInteger;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.AlgorithmParameterSpec;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.RSAKeyGenParameterSpec;

public abstract class SignatureBenchmark
    implements Benchmark
{
  protected KeyPair keypair_;
  protected String sigAlgo_;

  public SignatureBenchmark(String keypairAlgorithm, String hashingAlgorithm) {
    try {
      SecureRandom srand = SecurityUtil.GetSecureRandom();
      KeyPairGenerator keygen = KeyPairGenerator.getInstance(keypairAlgorithm);
      AlgorithmParameterSpec spec = null;

      switch ( keypairAlgorithm ) {
        case "RSA":
          spec = new RSAKeyGenParameterSpec(2048, new BigInteger("10001", 16));
          sigAlgo_ = hashingAlgorithm + "withRSA";
          break;
        case "EC":
          spec = new ECGenParameterSpec("secp256k1");
          sigAlgo_ = hashingAlgorithm + "withECDSA";
          break;
        default:
          throw new NoSuchAlgorithmException();
      }

      keygen.initialize(spec, srand);
      keypair_ = keygen.generateKeyPair();
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }
}
