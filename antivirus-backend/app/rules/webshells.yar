/*
 * webshells.yar — Web shell and script-based backdoor detection
 *
 * Covers: PHP webshells, Python/bash reverse shells, eval/exec exploit chains,
 *         base64-obfuscated payloads, and shell script root escalation.
 */

rule PHP_Webshell_Generic {
    meta:
        threat_name    = "PHP.Webshell.Generic"
        threat_type    = "riskware"
        severity       = "danger"
        description    = "Detects PHP web shell providing remote command execution on web servers."
        recommendation = "Delete this file immediately, rotate all server credentials, and audit access logs."

    strings:
        $php_tag       = "<?php" ascii nocase
        // Classic PHP webshell patterns
        $exec1         = "system(" ascii nocase
        $exec2         = "exec(" ascii nocase
        $exec3         = "shell_exec(" ascii nocase
        $exec4         = "passthru(" ascii nocase
        $exec5         = "popen(" ascii nocase
        $eval          = "eval(" ascii nocase
        $base64        = "base64_decode(" ascii nocase
        $assert        = "assert(" ascii nocase
        // User-input derived execution (combining eval+input = webshell)
        $get_input     = "$_GET" ascii
        $post_input    = "$_POST" ascii
        $request_input = "$_REQUEST" ascii
        $cookie_input  = "$_COOKIE" ascii

    condition:
        $php_tag and
        (1 of ($exec*) or $eval or $assert) and
        1 of ($get_input, $post_input, $request_input, $cookie_input) and
        ($base64 or 2 of ($exec*))
}


rule PHP_Webshell_B374k {
    meta:
        threat_name    = "PHP.Webshell.B374k"
        threat_type    = "riskware"
        severity       = "danger"
        description    = "Detects the B374k PHP webshell — a popular feature-rich backdoor."
        recommendation = "Remove immediately and audit all uploaded files on the server."

    strings:
        $sig1 = "b374k" ascii nocase
        $sig2 = "b374k shell" ascii nocase
        $sig3 = "$auth_pass" ascii
        $sig4 = "FilesMan" ascii nocase
        $sig5 = "encode_php" ascii nocase

    condition:
        2 of them
}


rule Shell_Exploit_RootElevate {
    meta:
        threat_name    = "Shell.Exploit.RootElevate"
        threat_type    = "riskware"
        severity       = "warning"
        description    = "Detects shell scripts attempting privilege escalation via sudo or SUID exploitation."
        recommendation = "Delete the script. Review sudo configuration and file permissions on your system."

    strings:
        $shebang       = "#!/bin/" ascii
        $sudo          = "sudo" ascii nocase
        $chmod_suid    = "chmod +s" ascii nocase
        $chmod_suid2   = "chmod 4755" ascii nocase
        $suid_exploit  = "SUID" ascii nocase
        $reverse1      = "/dev/tcp/" ascii
        $reverse2      = "bash -i" ascii nocase
        $reverse3      = "nc -e" ascii nocase
        $mkfifo        = "mkfifo" ascii
        $su_root       = "su root" ascii nocase

    condition:
        $shebang and (
            ($sudo and ($chmod_suid or $chmod_suid2)) or
            ($reverse1 or ($reverse2 and $reverse3)) or
            ($mkfifo and $reverse2) or
            $su_root
        )
}


rule Python_Reverse_Shell {
    meta:
        threat_name    = "Script.Python.ReverseShell"
        threat_type    = "riskware"
        severity       = "danger"
        description    = "Detects Python-based reverse shell scripts commonly used for post-exploitation access."
        recommendation = "Delete immediately. Check for persistence mechanisms (cron, rc.local, systemd)."

    strings:
        $import_socket = "import socket" ascii
        $import_sub    = "import subprocess" ascii
        $connect       = ".connect(" ascii
        $dup2          = "os.dup2" ascii
        $spawn_shell   = "os.system" ascii
        $exec_shell    = "subprocess.call" ascii
        $bash_flag     = '"/bin/bash"' ascii
        $sh_flag       = '"/bin/sh"' ascii

    condition:
        $import_socket and ($import_sub or $dup2) and
        $connect and
        ($bash_flag or $sh_flag) and
        ($dup2 or $exec_shell or $spawn_shell)
}


rule Obfuscated_Base64_Exec {
    meta:
        threat_name    = "Generic.Obfuscated.Base64Exec"
        threat_type    = "riskware"
        severity       = "warning"
        description    = "Detects multi-layer base64-encoded payload execution chains used to evade static AV."
        recommendation = "Decode and inspect manually; delete if payload is malicious."

    strings:
        // Multiple base64 alphabet strings of significant length
        $b64_1    = /[A-Za-z0-9+\/]{60,}={0,2}/ ascii
        $b64_2    = /[A-Za-z0-9+\/]{60,}={0,2}/ ascii
        $decode1  = "base64_decode" ascii nocase
        $decode2  = "atob(" ascii nocase
        $decode3  = "base64.b64decode" ascii nocase
        $exec1    = "eval(" ascii nocase
        $exec2    = "exec(" ascii nocase
        $exec3    = "execl(" ascii nocase

    condition:
        (#b64_1 >= 3 or #b64_2 >= 3) and
        1 of ($decode*) and
        1 of ($exec*)
}
