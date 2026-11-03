import sqlite3

conn = sqlite3.connect(r'c:\Users\student.CSELAB\Documents\MINI PROJECT TEAM 1\Mini-Project\backend\hospital.db')
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables in hospital.db:", tables)

