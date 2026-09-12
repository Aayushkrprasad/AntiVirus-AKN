antivirus-backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── scan.py
│   │   │   │   ├── definitions.py
│   │   │   │   └── stats.py
│   │   │   └── api_router.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── engine/
│   │   ├── yara_engine.py       # YARA compiler & rule matcher
│   │   ├── hash_matcher.py      # Rapid hash lookup service
│   │   ├── apk_inspector.py     # Androguard manifest & permission analyzer
│   │   └── entropy.py           # File entropy and binary anomaly calculator
│   ├── models/
│   │   ├── schemas.py           # Pydantic request/response models
│   │   └── db_models.py         # SQLAlchemy database models
│   ├── rules/
│   │   ├── trojans.yar          # Default starter YARA rules
│   │   ├── webshells.yar
│   │   └── ransomware.yar
│   └── main.py
├── tests/
├── Dockerfile
├── requirements.txt
└── README.md