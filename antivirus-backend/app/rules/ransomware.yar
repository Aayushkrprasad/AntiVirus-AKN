/*
 * ransomware.yar — Ransomware detection rules
 *
 * Covers: Windows PE ransomware droppers, script-based encryptors,
 *         ransom note patterns, and crypto API misuse indicators.
 */

rule Win32_Dropper_RansomAKN {
    meta:
        threat_name    = "Win32.Dropper.RansomAKN"
        threat_type    = "ransomware"
        severity       = "danger"
        description    = "Detects the RansomAKN ransomware dropper disguised with double extensions (e.g. .pdf.exe)."
        recommendation = "Delete this file immediately. Do NOT open it. Isolate the device from the network."

    strings:
        $mz           = { 4D 5A }           // MZ PE header
        // Ransom note strings common to the AKN family
        $note1        = "YOUR FILES ARE ENCRYPTED" ascii nocase wide
        $note2        = "send bitcoin" ascii nocase wide
        $note3        = "decrypt your files" ascii nocase wide
        $note4        = "ransom" ascii nocase wide
        $note5        = "pay within" ascii nocase wide
        // Crypto API calls used for file encryption
        $crypto1      = "CryptEncrypt" ascii
        $crypto2      = "CryptGenKey" ascii
        $crypto3      = "BCryptEncrypt" ascii
        // File extension enumeration (iterating victim files)
        $ext_enum1    = ".docx" ascii
        $ext_enum2    = ".xlsx" ascii
        $ext_enum3    = ".pdf" ascii
        $ext_enum4    = ".jpg" ascii
        // Shadow copy deletion — wipes backup/recovery
        $shadow1      = "vssadmin delete shadows" ascii nocase
        $shadow2      = "wbadmin DELETE" ascii nocase
        $shadow3      = "bcdedit /set {default} recoveryenabled No" ascii nocase

    condition:
        $mz at 0 and (
            2 of ($note*) or
            2 of ($crypto*) or
            ($shadow1 or $shadow2 or $shadow3) or
            (1 of ($note*) and 1 of ($crypto*))
        )
}


rule Script_Ransomware_PowerShell {
    meta:
        threat_name    = "Script.Ransomware.PowerShell"
        threat_type    = "ransomware"
        severity       = "danger"
        description    = "Detects PowerShell-based ransomware scripts using AES/RSA encryption and shadow deletion."
        recommendation = "Delete the script and restore from offline backup."

    strings:
        $ps1          = "powershell" ascii nocase wide
        $aes          = "AesManaged" ascii nocase
        $rsa          = "RSACryptoServiceProvider" ascii nocase
        $key_gen      = "GenerateKey" ascii nocase
        $shadow_del   = "vssadmin" ascii nocase
        $encrypt_loop = "GetFiles" ascii nocase
        $ransom_ext   = ".locked" ascii nocase
        $ransom_ext2  = ".encrypted" ascii nocase
        $ransom_ext3  = ".akncrypt" ascii nocase

    condition:
        $ps1 and
        ($aes or $rsa) and
        $key_gen and
        ($shadow_del or $encrypt_loop) and
        1 of ($ransom_ext*)
}


rule Android_Ransomware_Locker {
    meta:
        threat_name    = "Android.Ransomware.Locker.AKN"
        threat_type    = "ransomware"
        severity       = "danger"
        description    = "Detects Android screen-locker ransomware that demands payment to restore device access."
        recommendation = "Boot into safe mode, revoke device admin privileges, then uninstall."

    strings:
        $lock1        = "DevicePolicyManager" ascii
        $lock2        = "lockNow" ascii
        $lock3        = "setMaximumFailedPasswordsForWipe" ascii
        $demand1      = "sendPayment" ascii nocase
        $demand2      = "PaymentActivity" ascii nocase
        $bitcoin_addr = /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/  // BTC address regex

    condition:
        ($lock1 and $lock2) and
        ($demand1 or $demand2 or $bitcoin_addr)
}


rule Generic_RansomNote_Text {
    meta:
        threat_name    = "Generic.RansomNote.Dropped"
        threat_type    = "ransomware"
        severity       = "warning"
        description    = "Detects a dropped ransom note text file containing payment instructions."
        recommendation = "Do not pay. Restore files from a clean backup and scan all devices."

    strings:
        $note_a       = "YOUR FILES HAVE BEEN ENCRYPTED" ascii wide nocase
        $note_b       = "HOW TO RESTORE YOUR FILES" ascii wide nocase
        $note_c       = "bitcoin" ascii wide nocase
        $note_d       = "Tor browser" ascii wide nocase
        $note_e       = "unique ID" ascii wide nocase

    condition:
        3 of them
}
