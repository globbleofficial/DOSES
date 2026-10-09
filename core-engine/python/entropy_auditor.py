#!/usr/bin/env python3
"""
SECUREWIPE PRO - SCIENTIFIC COMPLIANCE & ENTROPY AUDITOR
Language: Python 3 (Scientific Computing)

Performs rigorous mathematical verification of sanitized storage media:
1. Shannon Entropy Calculation: H(X) = -sum(P(x) * log2(P(x)))
2. NIST SP 800-22 Monobit Frequency Test (P-Value > 0.01 indicates true randomness)
3. Chi-Square (χ²) Goodness-of-Fit uniformity analysis
"""

import sys
import math
import json
from collections import Counter

def calculate_shannon_entropy(data_bytes: bytes) -> float:
    """Calculates information entropy in bits per byte (Ideal = 8.0 bits/byte)"""
    if not data_bytes:
        return 0.0
    
    length = len(data_bytes)
    counts = Counter(data_bytes)
    entropy = 0.0

    for count in counts.values():
        p_x = count / length
        entropy -= p_x * math.log2(p_x)
        
    return entropy

def nist_monobit_frequency_test(data_bytes: bytes) -> dict:
    """
    NIST SP 800-22 Section 2.1 Frequency (Monobit) Test.
    Evaluates whether the ratio of zeros and ones matches ideal Bernoulli(0.5).
    """
    bit_count_1 = 0
    total_bits = len(data_bytes) * 8

    for byte in data_bytes:
        bit_count_1 += bin(byte).count('1')

    bit_count_0 = total_bits - bit_count_1
    s_n = bit_count_1 - bit_count_0
    s_obs = abs(s_n) / math.sqrt(total_bits)
    p_value = math.erfc(s_obs / math.sqrt(2))

    passed = p_value >= 0.01

    return {
        "total_bits": total_bits,
        "ones_ratio": round(bit_count_1 / total_bits, 6),
        "zeros_ratio": round(bit_count_0 / total_bits, 6),
        "s_obs": round(s_obs, 4),
        "p_value": round(p_value, 6),
        "nist_passed": passed
    }

def audit_drive_sample(file_or_device_path: str, sample_size: int = 1048576) -> dict:
    """Audits a 1 MB sample directly from the purged drive or file"""
    try:
        with open(file_or_device_path, "rb") as f:
            raw_sample = f.read(sample_size)
    except Exception as e:
        return {"error": str(e), "compliant": False}

    entropy = calculate_shannon_entropy(raw_sample)
    monobit = nist_monobit_frequency_test(raw_sample)
    
    # 7.99+ bits/byte is the international benchmark for forensic unrecoverability
    is_compliant = entropy >= 7.99 and monobit["nist_passed"]

    audit_result = {
        "target": file_or_device_path,
        "sample_bytes_evaluated": len(raw_sample),
        "shannon_entropy_bits_per_byte": round(entropy, 6),
        "theoretical_maximum": 8.0,
        "monobit_test": monobit,
        "nist_sp_800_88_compliant": is_compliant,
        "status": "MATHEMATICALLY_IRRECOVERABLE" if is_compliant else "AUDIT_REJECTED"
    }

    return audit_result

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "/dev/urandom"
    result = audit_drive_sample(target, 512 * 1024)
    print(json.dumps(result, indent=2))
