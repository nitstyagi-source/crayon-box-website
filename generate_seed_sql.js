const fs = require('fs');

const MOCK_CMS_DB = {
  global: {
    brand: {
      logo_primary_url: "/logo-uploaded.png",
      logo_inverse_url: "/logo-uploaded.png",
      primary_brand_color: "#0F172A"
    },
    contact: {
      phone: "+91 9811102008",
      email: "admissions@crayonbox.edu",
      address: "Kh. No. 6/20, D-Block, Shastri Park Extension, Phool Bagh Road, Nathupura, Burari, New Delhi - 110084"
    },
    footer: {
      description: "A modern, holistic learning ecosystem designed to help your child thrive in a rapidly evolving world. Inspiring Excellence, Nurturing Tomorrow.",
      visitor_notice: "All campus visits must be pre-registered via our Smart Visitor Kiosk."
    }
  },
  global_theme: {
    primary_color: "#1e3a8a",
    secondary_color: "#059669",
    accent_color: "#ea580c",
    font_family_heading: "Playfair Display",
    font_family_body: "Inter",
    announcement_banner_active: "true",
    announcement_banner_text: "Admissions for the 2026-2027 academic year are now open. Apply today!"
  },
  home: {
    hero: {
      headline: "Inspiring Excellence.",
      subtext: "Nurturing Tomorrow.",
      description: "Welcome to Crayon Box School—a modern, holistic learning ecosystem designed to help your child thrive in a rapidly evolving world.",
      image_url: "https://crayonboxpreschool.in/wp-content/uploads/2020/07/84346916_177865773623747_828072988908716032_n.jpg"
    },
    growth_announcement: {
      title: "Growing Alongside Your Child.",
      description: "Crayon Box School is currently a premier Kindergarten through Grade 8 (K-8) institution, providing a foundational environment where young minds feel secure, challenged, and deeply understood.",
      vision_quote: "“We are expanding our horizons. Crayon Box School is actively upgrading our infrastructure, faculty, and curriculum to become a comprehensive K-12 institution in the near future. Students joining us today will have the seamless opportunity to complete their entire high school journey within the campus they know and love.”"
    },
    why_us: {
      heading: "Why Choose Us",
      feature_1_title: "Future-Ready Academics",
      feature_1_desc: "A dynamic curriculum blending traditional rigor with AI-integrated tools, coding, and critical thinking.",
      feature_2_title: "Safe & Smart Campus",
      feature_2_desc: "Equipped with real-time digital visitor logs, automated gate security, and comprehensive CCTV monitoring for absolute peace of mind.",
      feature_3_title: "360° Parent Transparency",
      feature_3_desc: "Stay connected with our live transport tracking, digital daily diaries, and seamless in-app fee management."
    },
    admissions_cta: {
      headline: "Begin Your Child's Journey With Us.",
      description: "Admissions for the upcoming academic year are now open. Experience our paperless, hassle-free digital enrollment process.",
      button_text: "Start Application"
    },
    testimonials: {
      heading: "What Our Parents Say",
      t1_quote: "\"The teaching quality is outstanding, but what really impressed us is the absolute safety of the campus. The live bus tracking feature on the school app gives us incredible peace of mind every single day.\"",
      t1_author: "Priya Sharma",
      t1_role: "Parent of Grade 4 Student",
      t2_quote: "\"Moving from paper forms to their digital enrollment and fee payment was seamless. Crayon Box truly operates like a modern, transparent institution that values parent time as much as student education.\"",
      t2_author: "David & Emma Wilson",
      t2_role: "Parents of Grade 7 Student"
    }
  },
  about: {
    hero: {
      headline: "Shaping Minds.",
      subtext: "Coloring the Future.",
      description: "More than a school—a canvas where every student discovers their unique potential.",
      image_url: "https://crayonboxpreschool.in/wp-content/uploads/2021/02/Group-3-Copy-6.jpg"
    },
    philosophy: {
      heading: "Why \"Crayon Box\"?",
      quote: "“A crayon box holds an array of distinct colors, each unique, yet together capable of creating masterpieces. At Crayon Box School, we view our students through this exact lens. We don't believe in a one-size-fits-all education. Whether a child is an analytical thinker, a creative artist, or a natural athlete, our ecosystem is designed to nurture their individual brilliance and equip them for a dynamic world.”"
    },
    vision_mission: {
      vision_headline: "Our Vision",
      vision_description: "To be a globally recognized institution that blends technological innovation with deep-rooted human values, empowering students to lead with empathy and intellect.",
      vision_bg_color: "#1e3a8a",
      mission_headline: "Our Mission",
      mission_description: "To provide a secure, inclusive, and challenging K-12 environment where modern pedagogy, robust infrastructure, and dedicated mentorship converge to build the leaders of tomorrow.",
      mission_bg_color: "#ffffff"
    },
    director: {
      headline: "A Message from the Director",
      p1: "Welcome to Crayon Box School.",
      p2: "Education is not merely about imparting knowledge; it is about discovering the unique potential within every child. When we envisioned Crayon Box School, our goal was to create a vibrant, dynamic ecosystem—much like a box of crayons—where diverse talents, thoughts, and abilities are nurtured to create something truly extraordinary.",
      p3: "Currently, as a premier K-8 institution, we take immense pride in laying a robust foundation for our students during their most formative years. We have cultivated an environment that balances academic rigor with socio-emotional well-being, ensuring our primary and middle schoolers feel secure, challenged, and deeply understood. Through our integration of modern technology, experiential learning, and dedicated mentorship, we ensure every child is equipped with the critical thinking skills needed for a rapidly evolving world.",
      p4: "But our journey, much like your child’s, continues to grow. I am thrilled to share our active vision of expanding into a comprehensive K-12 institution. We are currently scaling our infrastructure, developing advanced scientific and digital laboratories, and broadening our exceptional faculty to accommodate senior secondary education. This strategic evolution ensures that the students who join our family today will enjoy a seamless, uninterrupted transition through high school, right here in the environment they trust.",
      p5: "We consider it a profound privilege to partner with parents in this educational journey. Together, let us continue to shape resilient, compassionate minds and color the future with purpose and brilliance.",
      author_name: "Nitin Tyagi",
      author_role: "Director, Crayon Box School",
      image_url: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1974&auto=format&fit=crop"
    },
    journey: {
      headline: "Our Journey & The Road to K-12",
      description: "A legacy of excellence, rooted in primary education, expanding to shape the leaders of tomorrow.",
      past_title: "The Foundation",
      past_desc: "Crayon Box School opens its doors with a mission to redefine early and primary education, establishing a reputation for safety, care, and foundational excellence.",
      present_title: "Mastering Middle School",
      present_desc: "Currently operating as a premier K-8 institution. We have integrated smart classrooms, AI-driven learning tools, and comprehensive sports facilities to nurture pre-teens during their most crucial developmental years.",
      future_title: "K-12 Campus Expansion",
      future_desc: "Actively upgrading our infrastructure, advanced science laboratories, and senior faculty recruitment. Students joining us today will have the distinct advantage of seamlessly transitioning into high school within the ecosystem they trust."
    },
    pillars: {
      headline: "How We Teach",
      p1_title: "Experiential Learning",
      p1_desc: "Moving beyond textbooks with hands-on labs, robotics, and project-based assessments.",
      p2_title: "Tech-Enabled Campus",
      p2_desc: "From our Parent App to Smart Boards, we use technology to enhance transparency and learning, not replace human connection.",
      p3_title: "Holistic Well-being",
      p3_desc: "Dedicated focus on socio-emotional health, physical fitness, and the arts.",
      p4_title: "Exceptional Faculty",
      p4_desc: "Rigorously selected educators who undergo continuous professional development to stay ahead of global teaching standards."
    },
    cta: {
      headline: "Come See the Difference Yourself.",
      description: "Words can only say so much. We invite you to walk our corridors, meet our faculty, and experience the energy of Crayon Box School.",
      button_1_text: "Book a Campus Tour",
      button_2_text: "Begin Admissions Process",
      image_url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
    }
  },
  academics: {
    hero: {
      headline: "A Curriculum Designed for the Future.",
      description: "We don't just teach students what to think; we teach them how to think. Blending academic rigor with critical thinking and creativity to prepare your child for a dynamic world.",
      image_url: "https://crayonboxpreschool.in/wp-content/uploads/2020/07/day_care_img_16.png"
    }
  },
  contact: {
    hero: {
      headline: "Let’s Start a",
      subtext: "Conversation.",
      description: "Whether you are exploring admissions for your child or need assistance from our administrative team, we are here to help.",
      image_url: "https://crayonboxpreschool.in/wp-content/uploads/2020/07/Virtual-tour.png"
    }
  },
  faculty: {
    hero: {
      headline: "The Mentors Behind the",
      subtext: "Masterpieces.",
      description: "Meet the dedicated educators, innovators, and guides who bring the colors of Crayon Box School to life every single day.",
      image_url: "https://crayonboxpreschool.in/wp-content/uploads/2020/08/jess-watters-483666-unsplash.jpg"
    }
  },
  "campus-life": {
    hero: {
      headline: "A Canvas for",
      subtext: "Every Talent.",
      description: "At Crayon Box School, education doesn't stop when the bell rings. Discover a vibrant, secure, and inclusive campus where every student finds their space to shine."
    }
  },
  news: {
    hero: {
      tag: "Campus Expansion",
      headline: "Breaking Ground: The Road to our K-12 Senior Wing Begins.",
      description: "Director Nitin Tyagi officially laid the foundation stone for our new state-of-the-art Senior Secondary Science and Robotics Block, marking the beginning of our highly anticipated K-12 expansion.",
      image_url: "https://crayonboxpreschool.in/wp-content/uploads/2021/02/blocks-bg.jpg"
    }
  },
  admissions: {
    hero: {
      headline: "Begin Your Child’s",
      subtext: "Journey.",
      description: "Welcome to a paperless, transparent, and seamless admissions experience. We are currently accepting applications for the 2026–27 academic year.",
      image_url: "https://crayonboxpreschool.in/wp-content/uploads/2021/02/shapes-bg-1.png"
    }
  },
  alumni: {
    hero: {
      headline: "Our",
      subtext: "Alumni",
      description: "Connect with past graduates of Crayon Box School who are making waves across the globe."
    }
  }
};

function escapeSql(str) {
    if (typeof str !== 'string') return "''";
    return "'" + str.replace(/'/g, "''") + "'";
}

let sql = `
-- ==========================================
-- SCHEMA: CMS TABLES
-- ==========================================
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug VARCHAR(255) REFERENCES cms_pages(slug) ON DELETE CASCADE,
    block_key VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    content_value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_slug, block_key)
);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view cms_pages" ON cms_pages;
CREATE POLICY "Public can view cms_pages" ON cms_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view cms_blocks" ON cms_blocks;
CREATE POLICY "Public can view cms_blocks" ON cms_blocks FOR SELECT USING (true);

-- Allow anyone to update blocks for the prototype (since we don't have auth fully wired yet)
DROP POLICY IF EXISTS "Allow updates to cms_blocks" ON cms_blocks;
CREATE POLICY "Allow updates to cms_blocks" ON cms_blocks FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- SEED DATA: CMS PAGES
-- ==========================================
`;

const pages = Object.keys(MOCK_CMS_DB);
for (const slug of pages) {
    sql += `INSERT INTO cms_pages (slug, title) VALUES ('${slug}', '${slug.charAt(0).toUpperCase() + slug.slice(1)}') ON CONFLICT (slug) DO NOTHING;\n`;
}

sql += `\n-- ==========================================
-- SEED DATA: CMS BLOCKS
-- ==========================================\n`;

for (const slug of pages) {
    const sections = MOCK_CMS_DB[slug];
    for (const sectionKey of Object.keys(sections)) {
        const fields = sections[sectionKey];
        for (const fieldKey of Object.keys(fields)) {
            const blockKey = sectionKey + "." + fieldKey;
            const contentValue = escapeSql(fields[fieldKey]);
            sql += `INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('${slug}', '${blockKey}', ${contentValue}) ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;\n`;
        }
    }
}

fs.writeFileSync('setup_db.sql', sql);
console.log("SQL generated!");
