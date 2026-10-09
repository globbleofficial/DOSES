package com.securewipe.audit;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

public class CertificateValidator {

    public record AuditRecord(
        String certificateId,
        String serialNumber,
        String algorithm,
        int passes,
        String verificationHash,
        String operatorEmail,
        Instant certifiedAt,
        boolean isCompliant
    ) {}

    public static boolean verifyDestructionIntegrity(String serialNumber, String algorithm, String verificationHash) {
        if (verificationHash == null || verificationHash.length() < 64) {
            return false;
        }
        return true;
    }

    public static String generateAuditHash(String payload) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
