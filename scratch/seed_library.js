const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initLibrary() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS library_books (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      book_code VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(250) NOT NULL,
      author VARCHAR(150) NOT NULL,
      publisher VARCHAR(150),
      isbn VARCHAR(50),
      edition VARCHAR(50) DEFAULT '1st Edition',
      category VARCHAR(100) NOT NULL,
      language VARCHAR(50) DEFAULT 'English',
      class_grade VARCHAR(50) DEFAULT 'Grade 1-5',
      rack_location VARCHAR(100) NOT NULL DEFAULT 'Rack A-02, Shelf 3',
      price NUMERIC(10,2) DEFAULT 450.00,
      total_copies INTEGER DEFAULT 5,
      available_copies INTEGER DEFAULT 5,
      cover_image_url TEXT,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS library_book_copies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
      accession_number VARCHAR(50) UNIQUE NOT NULL,
      barcode_qr VARCHAR(100) NOT NULL,
      copy_number INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'Available',
      rack_location VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS library_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      transaction_code VARCHAR(50) UNIQUE NOT NULL,
      book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
      copy_id UUID REFERENCES library_book_copies(id) ON DELETE CASCADE,
      accession_number VARCHAR(50) NOT NULL,
      book_title VARCHAR(250) NOT NULL,
      borrower_type VARCHAR(50) DEFAULT 'Student',
      student_id UUID REFERENCES students(id) ON DELETE SET NULL,
      student_name VARCHAR(150),
      class_name VARCHAR(50),
      staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
      staff_name VARCHAR(150),
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      status VARCHAR(50) DEFAULT 'Issued',
      renewal_count INTEGER DEFAULT 0,
      fine_amount NUMERIC(10,2) DEFAULT 0.00,
      fine_status VARCHAR(50) DEFAULT 'None',
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS library_reservations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
      borrower_type VARCHAR(50) DEFAULT 'Student',
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      student_name VARCHAR(150) NOT NULL,
      class_name VARCHAR(50) NOT NULL,
      reservation_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'Pending',
      expiry_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_books_cat ON library_books(category);
    CREATE INDEX IF NOT EXISTS idx_copies_acc ON library_book_copies(accession_number);
    CREATE INDEX IF NOT EXISTS idx_trans_status ON library_transactions(status);
  `);

  console.log('✅ Created library tables successfully!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // 1. Seed Sample Books
  const books = [
    {
      code: 'BK-2026-0041',
      title: 'Science Encyclopedia for Young Explorers',
      author: 'Dr. Sarah Jenkins',
      publisher: 'DK Children Publishing',
      isbn: '978-0241385421',
      cat: 'Science',
      lang: 'English',
      grade: 'Grade 3-8',
      rack: 'Rack S-02, Shelf 3',
      price: 650.00,
      total: 5,
      avail: 3,
      desc: 'Comprehensive visual encyclopedia covering physics, chemistry, astronomy, and biology.'
    },
    {
      code: 'BK-2026-0042',
      title: 'Malgudi Days & Swami and Friends',
      author: 'R. K. Narayan',
      publisher: 'Indian Thought Publications',
      isbn: '978-8185986005',
      cat: 'Story Books',
      lang: 'English',
      grade: 'Grade 4-10',
      rack: 'Rack F-04, Shelf 1',
      price: 299.00,
      total: 6,
      avail: 4,
      desc: 'Timeless Indian classic stories capturing childhood adventures and rural life in Malgudi.'
    },
    {
      code: 'BK-2026-0043',
      title: 'Oxford Illustrated Primary English Dictionary',
      author: 'Oxford University Press',
      publisher: 'OUP India',
      isbn: '978-0192756862',
      cat: 'Reference',
      lang: 'English',
      grade: 'Grade 1-6',
      rack: 'Rack R-01, Shelf 2',
      price: 499.00,
      total: 8,
      avail: 6,
      desc: 'Over 50,000 vocabulary words with illustrated example sentences and etymology.'
    },
    {
      code: 'BK-2026-0044',
      title: 'Panchatantra: Illustrated Moral Tales for Kids',
      author: 'Vishnu Sharma',
      publisher: 'Amar Chitra Katha',
      isbn: '978-8184820126',
      cat: 'Hindi',
      lang: 'Hindi',
      grade: 'Grade 1-5',
      rack: 'Rack H-01, Shelf 4',
      price: 250.00,
      total: 10,
      avail: 7,
      desc: 'Ancient animal fables teaching ethics, wit, leadership, and friendship.'
    },
    {
      code: 'BK-2026-0045',
      title: 'Maths Olympiad Champion: Brain Teasers & Puzzles',
      author: 'P. K. Garg',
      publisher: 'Arihant Publications',
      isbn: '978-9313192881',
      cat: 'Mathematics',
      lang: 'English',
      grade: 'Grade 4-8',
      rack: 'Rack M-03, Shelf 2',
      price: 380.00,
      total: 4,
      avail: 2,
      desc: 'Advanced problem solving, mental mathematics tricks, and international Olympiad questions.'
    }
  ];

  let copySeq = 1001;
  const bookMap = {};

  for (const b of books) {
    const res = await client.query(`
      INSERT INTO library_books (
        campus_id, book_code, title, author, publisher, isbn, category,
        language, class_grade, rack_location, price, total_copies, available_copies, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (book_code) DO UPDATE SET available_copies = EXCLUDED.available_copies
      RETURNING id, title;
    `, [
      campusId, b.code, b.title, b.author, b.publisher, b.isbn, b.cat,
      b.lang, b.grade, b.rack, b.price, b.total, b.avail, b.desc
    ]);

    const bookId = res.rows[0].id;
    bookMap[b.code] = { id: bookId, title: b.title, copies: [] };

    // Create physical copies
    for (let c = 1; c <= b.total; c++) {
      const accNum = `ACC-${copySeq++}`;
      const status = c <= b.avail ? 'Available' : (c === b.total ? 'Overdue' : 'Issued');
      const copyRes = await client.query(`
        INSERT INTO library_book_copies (
          book_id, accession_number, barcode_qr, copy_number, status, rack_location
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (accession_number) DO UPDATE SET status = EXCLUDED.status
        RETURNING id, accession_number, status;
      `, [bookId, accNum, `QR-${accNum}`, c, status, b.rack]);

      bookMap[b.code].copies.push(copyRes.rows[0]);
    }
  }

  // 2. Seed Sample Active Transactions for Aarav Sharma
  const todayStr = '2026-08-21';
  const stuRes = await client.query(`SELECT id, first_name, last_name FROM students LIMIT 2;`);
  if (stuRes.rows.length > 0) {
    const s1 = stuRes.rows[0];
    const sciBook = bookMap['BK-2026-0041'];
    const issuedCopy = sciBook.copies.find(c => c.status === 'Issued') || sciBook.copies[0];

    await client.query(`
      INSERT INTO library_transactions (
        campus_id, transaction_code, book_id, copy_id, accession_number, book_title,
        borrower_type, student_id, student_name, class_name, issue_date, due_date, status, fine_amount
      ) VALUES (
        $1, 'LIB-TX-2026-0012', $2, $3, $4, $5,
        'Student', $6, $7, 'Grade 5-A',
        '2026-08-14', '2026-08-21', 'Issued', 0.00
      )
      ON CONFLICT (transaction_code) DO NOTHING;
    `, [
      campusId, sciBook.id, issuedCopy.id, issuedCopy.accession_number,
      sciBook.title, s1.id, s1.first_name + ' ' + (s1.last_name || '')
    ]);

    // Overdue transaction
    const mathBook = bookMap['BK-2026-0045'];
    const overdueCopy = mathBook.copies.find(c => c.status === 'Overdue') || mathBook.copies[0];
    await client.query(`
      INSERT INTO library_transactions (
        campus_id, transaction_code, book_id, copy_id, accession_number, book_title,
        borrower_type, student_id, student_name, class_name, issue_date, due_date, status, fine_amount, fine_status, remarks
      ) VALUES (
        $1, 'LIB-TX-2026-0008', $2, $3, $4, $5,
        'Student', $6, $7, 'Grade 5-A',
        '2026-08-05', '2026-08-12', 'Overdue', 180.00, 'Pending', '9 Days Overdue (₹20/day)'
      )
      ON CONFLICT (transaction_code) DO NOTHING;
    `, [
      campusId, mathBook.id, overdueCopy.id, overdueCopy.accession_number,
      mathBook.title, s1.id, s1.first_name + ' ' + (s1.last_name || '')
    ]);
  }

  console.log('✅ Seeded library books, accession copies, and borrowing transactions successfully!');
  await client.end();
}

initLibrary().catch(console.error);
