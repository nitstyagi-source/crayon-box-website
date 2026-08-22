import re
import json
import psycopg2
from datetime import datetime

# Connection string
DB_URL = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby@1008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

def parse_date(d_str):
    if not d_str:
        return None
    d_str = d_str.strip()
    # Try DD/MM/YYYY
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(d_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None

def normalize_class_section(raw_class):
    raw = raw_class.strip()
    # Patterns
    # Nursery Earth / Nursery Mars
    if "Nursery" in raw:
        if "Mars" in raw:
            return "Nursery", "Mars"
        else:
            return "Nursery", "Earth"
    elif "UKG" in raw:
        if "Neptune" in raw:
            return "UKG", "Neptune"
        elif "Uranus" in raw:
            return "UKG", "Uranus"
        elif "Jupiter" in raw:
            return "UKG", "Jupiter"
        else:
            return "UKG", "A"
    elif "Class 1 A" in raw or "Class 1A" in raw or "Class 1-A" in raw:
        return "Grade 1", "A"
    elif "Class-1 B" in raw or "Class 1 B" in raw or "Class 1B" in raw:
        return "Grade 1", "B"
    elif "Class 2" in raw:
        return "Grade 2", "A"
    elif "Class 3" in raw:
        return "Grade 3", "A"
    elif "Class 4" in raw:
        return "Grade 4", "A"
    elif "Class 5" in raw:
        return "Grade 5", "A"
    return raw, "A"

print("Parser module ready.")
