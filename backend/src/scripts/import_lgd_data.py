import xml.etree.ElementTree as ET
import glob
import os
import sqlite3
import json

ns = {'ss': 'urn:schemas-microsoft-com:office:spreadsheet'}

def get_row_data(row):
    cells = row.findall('ss:Cell', ns)
    return [
        c.find('ss:Data', ns).text.strip()
        if (c.find('ss:Data', ns) is not None and c.find('ss:Data', ns).text)
        else ''
        for c in cells
    ]

def main():
    download_dir = '/home/yash/Downloads/downloadDir2026_09_03_11_35_07_942'
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/panchayat.db'))
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Drop & recreate tables
    cur.execute('DROP TABLE IF EXISTS gram_panchayats')
    cur.execute('DROP TABLE IF EXISTS talukas')
    cur.execute('DROP TABLE IF EXISTS districts')

    cur.execute('''
    CREATE TABLE districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        name_en TEXT,
        name_mr TEXT
    )
    ''')

    cur.execute('''
    CREATE TABLE talukas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        district_code TEXT,
        name_en TEXT,
        name_mr TEXT
    )
    ''')

    cur.execute('''
    CREATE TABLE gram_panchayats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT,
        subdistrict_code TEXT,
        district_code TEXT,
        name_en TEXT,
        name_mr TEXT,
        wards_json TEXT
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        aadhaar TEXT,
        state TEXT DEFAULT 'Maharashtra',
        district TEXT,
        taluka TEXT,
        gram_panchayat TEXT,
        ward_no TEXT,
        house_no TEXT,
        employee_code TEXT,
        designation TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        application_no TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_phone TEXT NOT NULL,
        applicant_aadhaar TEXT,
        ward_no TEXT,
        house_no TEXT,
        gram_panchayat TEXT,
        taluka TEXT,
        district TEXT,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        applied_date DATE NOT NULL,
        remarks TEXT,
        approved_by TEXT,
        digital_signature TEXT,
        qr_code TEXT,
        document_url TEXT
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS grievances (
        id TEXT PRIMARY KEY,
        token_no TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        citizen_name TEXT NOT NULL,
        citizen_phone TEXT NOT NULL,
        ward_no TEXT,
        location_details TEXT,
        gram_panchayat TEXT,
        taluka TEXT,
        district TEXT,
        status TEXT DEFAULT 'open',
        lodged_date DATE NOT NULL,
        photo_url TEXT,
        assigned_officer TEXT,
        resolution_notes TEXT,
        resolution_date DATE
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS tax_records (
        id TEXT PRIMARY KEY,
        property_no TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        ward_no TEXT,
        gram_panchayat TEXT,
        taluka TEXT,
        district TEXT,
        property_tax REAL DEFAULT 0,
        water_tax REAL DEFAULT 0,
        health_cess REAL DEFAULT 0,
        light_tax REAL DEFAULT 0,
        total_tax REAL DEFAULT 0,
        rebate REAL DEFAULT 0,
        final_amount REAL DEFAULT 0,
        is_paid INTEGER DEFAULT 0,
        paid_date DATE,
        receipt_no TEXT,
        payment_method TEXT,
        transaction_id TEXT
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS notices (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title_mr TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description_mr TEXT,
        description_en TEXT,
        date DATE NOT NULL,
        time TEXT,
        venue TEXT,
        is_urgent INTEGER DEFAULT 0,
        attachment_url TEXT
    )
    ''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name_mr TEXT NOT NULL,
        name_en TEXT NOT NULL,
        ward_no TEXT,
        gram_panchayat TEXT,
        sanctioned_amount REAL,
        spent_amount REAL,
        status TEXT DEFAULT 'in_progress',
        progress_percentage INTEGER DEFAULT 0,
        contractor_name TEXT,
        start_date DATE,
        target_date DATE,
        fund_source TEXT
    )
    ''')

    # 1. Parse Districts
    print("1. Parsing Districts from LGD...")
    dist_files = glob.glob(os.path.join(download_dir, 'districtofSpecificState*.xls'))
    if dist_files:
        tree = ET.parse(dist_files[0])
        rows = tree.getroot().find('ss:Worksheet', ns).find('ss:Table', ns).findall('ss:Row', ns)
        dist_count = 0
        for r in rows[5:]:
            d = get_row_data(r)
            if len(d) >= 5 and d[1]:
                code = d[1]
                name_en = d[3]
                name_mr = d[4] if len(d) > 4 and d[4] else name_en
                cur.execute('INSERT OR REPLACE INTO districts (code, name_en, name_mr) VALUES (?, ?, ?)', (code, name_en, name_mr))
                dist_count += 1
        print(f"Imported {dist_count} districts.")

    # 2. Parse Sub-Districts / Talukas
    print("2. Parsing Sub-districts / Talukas from LGD...")
    subdist_files = glob.glob(os.path.join(download_dir, 'subDistrictofSpecificState*.xls'))
    if subdist_files:
        tree = ET.parse(subdist_files[0])
        rows = tree.getroot().find('ss:Worksheet', ns).find('ss:Table', ns).findall('ss:Row', ns)
        tal_count = 0
        for r in rows[5:]:
            d = get_row_data(r)
            if len(d) >= 7 and d[3]:
                d_code = d[1]
                code = d[3]
                name_en = d[5]
                name_mr = d[6] if len(d) > 6 and d[6] else name_en
                cur.execute('INSERT OR REPLACE INTO talukas (code, district_code, name_en, name_mr) VALUES (?, ?, ?, ?)', (code, d_code, name_en, name_mr))
                tal_count += 1
        print(f"Imported {tal_count} talukas.")

    # 3. Read Marathi names for PRI Local Bodies from priLbSpecificState
    print("3. Indexing Marathi names from PRI Local Bodies...")
    pri_files = glob.glob(os.path.join(download_dir, 'priLbSpecificState*.xls'))
    pri_mr_map = {}
    if pri_files:
        tree = ET.parse(pri_files[0])
        rows = tree.getroot().find('ss:Worksheet', ns).find('ss:Table', ns).findall('ss:Row', ns)
        for r in rows[5:]:
            d = get_row_data(r)
            if len(d) >= 7 and d[3]:
                code = d[3]
                name_mr = d[6] if len(d) > 6 and d[6] else d[5]
                pri_mr_map[code] = name_mr
                pri_mr_map[d[5].lower()] = name_mr

    # 4. Parse Exact District -> Taluka -> Gram Panchayat Mappings
    print("4. Parsing District -> Taluka -> Gram Panchayat from villageGramPanchayatMapping...")
    map_files = glob.glob(os.path.join(download_dir, 'villageGramPanchayatMapping*.xls'))
    default_wards = json.dumps(['Ward 1 (गणपती चौक)', 'Ward 2 (मारुती मंदिर)', 'Ward 3 (बाजारपेठ)', 'Ward 4 (आंबेडकर नगर)', 'Ward 5 (गावठाण)', 'Ward 6 (नवी वस्ती)'], ensure_ascii=False)
    
    seen_gps = set()
    gp_rows = []

    if map_files:
        tree = ET.parse(map_files[0])
        rows = tree.getroot().find('ss:Worksheet', ns).find('ss:Table', ns).findall('ss:Row', ns)
        for r in rows[4:]:
            d = get_row_data(r)
            if len(d) >= 15:
                d_code = d[1]
                sub_code = d[5]
                gp_code = d[13]
                gp_name_en = d[14]

                if gp_code and gp_name_en and sub_code:
                    key = f"{sub_code}_{gp_code}"
                    if key not in seen_gps:
                        seen_gps.add(key)
                        name_mr = pri_mr_map.get(gp_code) or pri_mr_map.get(gp_name_en.lower()) or gp_name_en
                        gp_rows.append((gp_code, sub_code, d_code, gp_name_en, name_mr, default_wards))

        cur.executemany('''
        INSERT INTO gram_panchayats (code, subdistrict_code, district_code, name_en, name_mr, wards_json)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', gp_rows)
        print(f"Imported {len(gp_rows)} uniquely mapped Gram Panchayats with exact Taluka & District linkage.")

    # 5. Create Fast Indexes
    print("5. Creating Database Indexes...")
    cur.execute('CREATE INDEX IF NOT EXISTS idx_tal_dist ON talukas(district_code)')
    cur.execute('CREATE INDEX IF NOT EXISTS idx_gp_subdist ON gram_panchayats(subdistrict_code)')
    cur.execute('CREATE INDEX IF NOT EXISTS idx_gp_dist ON gram_panchayats(district_code)')
    cur.execute('CREATE INDEX IF NOT EXISTS idx_gp_name_en ON gram_panchayats(name_en)')
    cur.execute('CREATE INDEX IF NOT EXISTS idx_gp_name_mr ON gram_panchayats(name_mr)')

    # 6. Seed Demo Users
    print("6. Seeding Demo Users...")
    cur.execute('''
    INSERT OR REPLACE INTO users (id, role, name, phone, email, aadhaar, state, district, taluka, gram_panchayat, ward_no, house_no, employee_code, designation, avatar_url)
    VALUES 
    ('usr-001', 'citizen', 'ज्ञानेश्वर संभाजी मोरे', '9822104523', 'dnyaneshwar.more@gmail.com', 'XXXX-XXXX-8942', 'Maharashtra', 'Pune', 'Haveli', 'Gram Panchayat Shivane', 'Ward 1', 'SHIV-104', NULL, NULL, 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'),
    ('usr-002', 'citizen', 'सुनील रामभाऊ जगताप', '9822156789', 'sunil.jagtap@gmail.com', 'XXXX-XXXX-4512', 'Maharashtra', 'Pune', 'Haveli', 'Gram Panchayat Shivane', 'Ward 2', 'SHIV-045', NULL, NULL, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80'),
    ('usr-003', 'gram_sevak', 'श्री. सतीश रामचंद्र पाटील', '9422001122', 'vdo.shivane@maharapra.gov.in', 'XXXX-XXXX-7788', 'Maharashtra', 'Pune', 'Haveli', 'Gram Panchayat Shivane', NULL, NULL, 'GS-PUN-084', 'ग्रामविकास अधिकारी (Gram Sevak)', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'),
    ('usr-004', 'sarpanch', 'सौ. सविता ज्ञानेश्वर शिंदे', '9822003344', 'sarpanch.shivane@gmail.com', 'XXXX-XXXX-3344', 'Maharashtra', 'Pune', 'Haveli', 'Gram Panchayat Shivane', NULL, NULL, 'SRP-SHIV-01', 'सरपंच (Sarpanch)', 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&auto=format&fit=crop&q=80'),
    ('usr-005', 'tax_clerk', 'राहुल संभाजी मोहिते', '9822005566', 'tax.shivane@gmail.com', 'XXXX-XXXX-9900', 'Maharashtra', 'Pune', 'Haveli', 'Gram Panchayat Shivane', NULL, NULL, 'CLK-SHIV-09', 'कर वसुली लिपिक (Tax Clerk)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80')
    ''')

    # 7. Seed Initial Certificates
    print("7. Seeding Certificates...")
    cur.execute('''
    INSERT OR REPLACE INTO certificates (id, application_no, type, applicant_name, applicant_phone, applicant_aadhaar, ward_no, house_no, gram_panchayat, taluka, district, reason, status, applied_date, remarks, approved_by, digital_signature, qr_code)
    VALUES
    ('cert-001', 'GP-SHIV-2026-0891', 'residence', 'ज्ञानेश्वर संभाजी मोरे', '9822104523', 'XXXX-XXXX-8942', 'Ward 1', 'SHIV-104', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 'महावितरण नवीन वीज जोडणी व रेशनकार्ड नाव नोंदणीसाठी', 'approved', '2026-08-25', 'सर्व कागदपत्रे व नमुना ८अ तपासणी पूर्ण झाली.', 'श्री. सतीश पाटील (ग्रामसेवक)', 'DS-VDO-PUN-084-2026-0891', 'GP-CERT-SHIV-2026-0891-VERIFIED'),
    ('cert-002', 'GP-SHIV-2026-0945', 'income', 'सुनील रामभाऊ जगताप', '9822156789', 'XXXX-XXXX-4512', 'Ward 2', 'SHIV-045', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 'मुलाच्या अभियांत्रिकी शिष्यवृत्ती अर्जासाठी', 'approved', '2026-08-28', 'उत्पन्न पुरावा ₹ ७५,०००/- प्रमाणित करण्यात आला.', 'श्री. सतीश पाटील (ग्रामसेवक)', 'DS-VDO-PUN-084-2026-0945', 'GP-CERT-SHIV-2026-0945-VERIFIED'),
    ('cert-003', 'GP-SHIV-2026-1012', 'birth', 'प्रशांत विठ्ठल गायकवाड', '9890123456', 'XXXX-XXXX-6712', 'Ward 3', 'SHIV-212', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 'शाळा प्रवेश व पासपोर्ट दाखल्यासाठी', 'under_scrutiny', '2026-08-30', 'प्राथमिक आरोग्य केंद्र जन्म नोंद तपासणी सुरू.', NULL, NULL, NULL),
    ('cert-004', 'GP-SHIV-2026-1044', 'nodues', 'रमेश किसन बाबर', '9765432109', 'XXXX-XXXX-1122', 'Ward 1', 'SHIV-088', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 'बँक पीक कर्ज मंजुरीसाठी नाहरकत दाखला', 'pending', '2026-09-01', 'चालू आर्थिक वर्षाचा कर भरणा पडताळणी प्रलंबित.', NULL, NULL, NULL)
    ''')

    # 8. Seed Initial Grievances
    print("8. Seeding Grievances...")
    cur.execute('''
    INSERT OR REPLACE INTO grievances (id, token_no, category, title, description, citizen_name, citizen_phone, ward_no, location_details, gram_panchayat, taluka, district, status, lodged_date, photo_url, assigned_officer)
    VALUES
    ('grv-001', 'GRV-SHIV-2026-401', 'water', 'मुख्य पाण्याच्या पाईपलाईनला मोठी गळती', 'गणपती चौक जवळ पिण्याच्या पाण्याची मुख्य लाईन फुटली असून हजारो लिटर पाणी वाया जात आहे.', 'ज्ञानेश्वर संभाजी मोरे', '9822104523', 'Ward 1', 'गणपती चौक, समर्थ किराणा जवळ', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 'in_progress', '2026-08-29', 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?w=600&auto=format&fit=crop&q=80', 'प्रकाश शिंदे (पाणीपुरवठा विभाग)'),
    ('grv-002', 'GRV-SHIV-2026-402', 'streetlight', 'मारुती मंदिर चौकातील ४ पथदिवे बंद आहेत', 'गेल्या ३ दिवसांपासून मारुती मंदिर रस्त्यावर पूर्ण अंधार असून रात्रीच्या वेळी ज्येष्ठ नागरिकांना त्रास होत आहे.', 'सुनील रामभाऊ जगताप', '9822156789', 'Ward 2', 'मारुती मंदिर मुख्य रस्ता, पोल क्र. १२ ते १५', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 'open', '2026-08-31', 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80', 'अमोल कांबळे (इलेक्ट्रिकल सुपरवायझर)'),
    ('grv-003', 'GRV-SHIV-2026-388', 'sanitation', 'बाजारपेठेतील कचरा कुंडीची वेळेवर स्वच्छता करा', 'आठवडी बाजारानंतर कचरा साचला होता.', 'अनिल वाघमारे', '9822998877', 'Ward 3', 'बाजारपेठ मैदान कॉर्नर', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 'resolved', '2026-08-24', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80', 'संजय जाधव (आरोग्य मुकादम)')
    ''')

    # 9. Seed Tax Records
    print("9. Seeding Tax Records...")
    cur.execute('''
    INSERT OR REPLACE INTO tax_records (id, property_no, owner_name, ward_no, gram_panchayat, taluka, district, property_tax, water_tax, health_cess, light_tax, total_tax, rebate, final_amount, is_paid, paid_date, receipt_no, payment_method, transaction_id)
    VALUES
    ('tax-001', 'SHIV-104', 'ज्ञानेश्वर संभाजी मोरे', 'Ward 1', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 1800, 600, 150, 150, 2700, 270, 2430, 0, NULL, NULL, NULL, NULL),
    ('tax-002', 'SHIV-045', 'सुनील रामभाऊ जगताप', 'Ward 2', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 2200, 800, 200, 200, 3400, 340, 3060, 1, '2026-08-20', 'RCT-2026-SHIV-0045', 'UPI / PhonePe', 'UPI-TXN-984210452399'),
    ('tax-003', 'SHIV-212', 'प्रशांत विठ्ठल गायकवाड', 'Ward 3', 'Gram Panchayat Shivane', 'Haveli', 'Pune', 3100, 1200, 250, 250, 4800, 480, 4320, 0, NULL, NULL, NULL, NULL)
    ''')

    # 10. Seed Notices & Projects
    print("10. Seeding Notices and Projects...")
    cur.execute('''
    INSERT OR REPLACE INTO notices (id, type, title_mr, title_en, description_mr, description_en, date, time, venue, is_urgent)
    VALUES
    ('not-001', 'meeting', 'विशेष ग्रामसभा सूचना - स्वातंत्र्यदिन व वार्षिक विकास आराखडा', 'Special Gram Sabha Meeting Notice', 'सर्व ग्रामस्थांना कळविण्यात येते की वार्षिक विकास आराखडा व १५ व्या वित्त आयोग कामांची मंजुरी यासाठी विशेष ग्रामसभेचे आयोजन केले आहे.', 'All villagers are informed that a Special Gram Sabha meeting is organized for approval of annual development works.', '2026-09-08', 'सकाळी १०:३० वाजता', 'ग्रामपंचायत मुख्य सभागृह, शिवणे', 1),
    ('not-002', 'tax_rebate', 'घरपट्टी व पाणीपट्टी १०% सवलत योजना', 'Property & Water Tax 10% Early Bird Rebate', '३० सप्टेंबर २०२६ पूर्वी चालू वर्षाचा संपूर्ण कर भरणा करणाऱ्या ग्रामस्थांना एकूण बिलावर १०% विशेष सवलत देण्यात येत आहे.', 'Villagers paying their full property and water taxes before 30th Sept 2026 will receive a special 10% rebate on total bill.', '2026-09-30', 'संध्याकाळी ०५:०० पर्यंत', 'ग्रामपंचायत कर संकलन कक्ष / ऑनलाइन ॲप', 0)
    ''')

    cur.execute('''
    INSERT OR REPLACE INTO projects (id, name_mr, name_en, ward_no, gram_panchayat, sanctioned_amount, spent_amount, status, progress_percentage, contractor_name, start_date, target_date, fund_source)
    VALUES
    ('prj-001', 'गणपती चौक ते मारुती मंदिर सिमेंट काँक्रीट रस्ता व भूमिगत गटार', 'Cement Concrete Road & Underground Drainage', 'Ward 1', 'Gram Panchayat Shivane', 1500000, 950000, 'in_progress', 65, 'मे. समर्थ इन्फ्रास्ट्रक्चर प्रा. लि.', '2026-06-15', '2026-10-31', '१५ वा वित्त आयोग (15th Finance Commission)'),
    ('prj-002', '१०,००० लिटर सौर ऊर्जा हायब्रिड पिण्याचे पाणी जलशुद्धीकरण प्रकल्प', 'Solar Hybrid RO Drinking Water Plant', 'Ward 2', 'Gram Panchayat Shivane', 850000, 850000, 'completed', 100, 'मे. जलदूत वॉटर सिस्टिम्स', '2026-04-01', '2026-07-20', 'जल जीवन मिशन (Jal Jeevan Mission)')
    ''')

    conn.commit()
    conn.close()
    print("✅ Maharashtra Database Successfully Generated with Exact District -> Taluka -> Gram Panchayat Mappings!")

if __name__ == '__main__':
    main()
