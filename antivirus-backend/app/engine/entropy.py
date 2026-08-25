"""
app/engine/entropy.py
──────────────────────
Shannon entropy calculator for binary anomaly detection.

High entropy (> ~7.2 bits/byte) strongly indicates that a file payload
is compressed, encrypted, or packed — a common characteristic of
malware obfuscation techniques such as UPX, custom packers, and
ransomware-encrypted drops.

Usage:
    from app.engine.entropy import calculate_shannon_entropy, is_high_entropy

    entropy = calculate_shannon_entropy(file_bytes)
    if is_high_entropy(file_bytes):
        # Flag as suspicious
"""

from __future__ import annotations

import math
from collections import Counter
from typing import Optional

from app.core.config import get_settings

_settings = get_settings()

# Threshold above which entropy is considered suspicious.
# Random / encrypted data approaches 8.0 bits/byte (theoretical max).
HIGH_ENTROPY_THRESHOLD: float = _settings.high_entropy_threshold


def calculate_shannon_entropy(data: bytes) -> float:
    """
    Calculate the Shannon entropy (in bits per byte) of a byte sequence.

    Formula:
        H = -Σ p(x) * log2(p(x))   for each unique byte value x

    Returns a float in [0.0, 8.0]:
      - 0.0  → all bytes are identical (e.g. null file)
      - 8.0  → perfectly uniform distribution (e.g. /dev/urandom output)

    Args:
        data: Raw bytes of the file or buffer to analyse.

    Returns:
        Shannon entropy value rounded to 4 decimal places.
    """
    if not data:
        return 0.0

    total = len(data)
    frequency = Counter(data)
    entropy = 0.0

    for count in frequency.values():
        if count == 0:
            continue
        probability = count / total
        entropy -= probability * math.log2(probability)

    return round(entropy, 4)


def is_high_entropy(data: bytes, threshold: Optional[float] = None) -> bool:
    """
    Return True if the byte sequence entropy exceeds the configured threshold.

    Args:
        data: Raw bytes to test.
        threshold: Override the default threshold (useful in tests).

    Returns:
        True if entropy >= threshold, indicating possible packing/encryption.
    """
    limit = threshold if threshold is not None else HIGH_ENTROPY_THRESHOLD
    return calculate_shannon_entropy(data) >= limit


def entropy_risk_label(entropy: float) -> str:
    """
    Convert a raw entropy value into a human-readable risk descriptor.

    Args:
        entropy: Shannon entropy value in bits/byte.

    Returns:
        'normal', 'elevated', or 'high' risk label string.
    """
    if entropy < 6.0:
        return "normal"
    if entropy < HIGH_ENTROPY_THRESHOLD:
        return "elevated"
    return "high"
