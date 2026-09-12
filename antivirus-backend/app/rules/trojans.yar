/*
 * trojans.yar — Android & cross-platform Trojan detection rules
 *
 * Rule metadata convention:
 *   threat_name  : Human-readable name matched against ThreatTypeEnum
 *   threat_type  : "trojan" | "adware" | "spyware" | "ransomware" | "pup" | "riskware"
 *   severity     : "safe" | "warning" | "danger"
 *   description  : Explanation of what the rule detects
 *   recommendation : User-facing remediation advice
 */

rule Android_Trojan_SpySMS {
    meta:
        threat_name    = "Android.Trojan.SpySMS.AKN"
        threat_type    = "trojan"
        severity       = "danger"
        description    = "Detects Android Trojan that intercepts SMS OTP codes and forwards them to C2 servers."
        recommendation = "Uninstall the application immediately and change all account passwords."

    strings:
        // Known C2 callback patterns
        $sms_forward1  = "forwardSMS" ascii nocase
        $sms_forward2  = "onSmsReceived" ascii nocase
        $sms_forward3  = "SMS_RECEIVED" ascii nocase
        $c2_exfil1     = "sendToServer" ascii nocase
        $c2_exfil2     = "uploadSms" ascii nocase
        // Hardcoded C2 domains seen in AKN malware campaign
        $domain1       = "smsstealer.xyz" ascii
        $domain2       = "otpgrab.net" ascii
        $domain3       = "akn-c2.online" ascii

    condition:
        2 of ($sms_forward*) and 1 of ($c2_exfil*) or
        any of ($domain*)
}


rule Android_Trojan_BankingOverlay {
    meta:
        threat_name    = "Android.Trojan.Overlay.Banking"
        threat_type    = "trojan"
        severity       = "danger"
        description    = "Detects overlay-style banking Trojan that draws fake UI over legitimate apps."
        recommendation = "Remove immediately and perform a factory reset if device admin was granted."

    strings:
        $overlay1  = "SYSTEM_ALERT_WINDOW" ascii
        $overlay2  = "TYPE_APPLICATION_OVERLAY" ascii
        $overlay3  = "WindowManager.LayoutParams" ascii
        $admin     = "DevicePolicyManager" ascii
        $phish     = "loginOverlay" ascii nocase
        $phish2    = "fakeLogin" ascii nocase

    condition:
        ($overlay1 or $overlay2) and $overlay3 and ($admin or $phish or $phish2)
}


rule Android_Trojan_DropperInstaller {
    meta:
        threat_name    = "Android.Trojan.Dropper.AKN"
        threat_type    = "trojan"
        severity       = "danger"
        description    = "Detects a dropper that downloads and silently installs secondary APK payloads."
        recommendation = "Delete this application; audit recently installed apps for secondary drops."

    strings:
        $install1  = "installPackage" ascii
        $install2  = "PackageInstaller" ascii
        $download1 = "downloadApk" ascii nocase
        $download2 = "DexClassLoader" ascii
        $download3 = "PathClassLoader" ascii
        $remote1   = "http://" ascii
        $remote2   = "https://" ascii

    condition:
        ($install1 or $install2) and
        ($download1 or $download2 or $download3) and
        ($remote1 or $remote2)
}


rule Win32_Trojan_SpySMS {
    meta:
        threat_name    = "Win32.Trojan.SpySMS"
        threat_type    = "trojan"
        severity       = "danger"
        description    = "Detects Windows PE Trojan mimicking legitimate software while performing data exfiltration."
        recommendation = "Delete the file and run a full system scan."

    strings:
        $mz        = { 4D 5A }          // MZ header (PE file)
        $spy1      = "keylogger" ascii nocase wide
        $spy2      = "GetAsyncKeyState" ascii
        $spy3      = "SetWindowsHookEx" ascii
        $exfil     = "POST" ascii
        $c2        = "upload" ascii nocase

    condition:
        $mz at 0 and
        2 of ($spy*) and ($exfil or $c2)
}
