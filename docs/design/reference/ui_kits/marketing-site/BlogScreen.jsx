(function(){
const { BlogCard, Pagination } = window.KiteKeyITDesignSystem_95b706;

const POSTS = [
  { image: 'PLACEHOLDER', category: 'Technology', authorInitials: 'JD', author: 'Julian Daniels', date: 'Oct 12, 2023', title: 'The Architecture of Resilience: Building Scalable Cloud Solutions', description: 'Exploring how we implement high-availability clusters for our non-profit partners using AWS Lambda and S3.' },
  { image: 'PLACEHOLDER', category: 'Applied Learning', authorInitials: 'SM', author: 'Sarah Miller', date: 'Sep 28, 2023', title: 'Soft Skills in a Hard Tech World: Navigating Client Communication', description: 'Lessons learned from translating complex database migrations into executive-level business value reports.' },
  { image: 'PLACEHOLDER', category: 'Career Paths', authorInitials: 'AK', author: 'Arjun Kapoor', date: 'Sep 15, 2023', title: 'From Classroom to Consultant: My First Quarter at Kite & Key', description: 'Reflecting on the pivot from textbook theory to live production environments and real-world stakes.' },
  { image: 'PLACEHOLDER', category: 'Technology', authorInitials: 'LW', author: 'Lena Wong', date: 'Aug 30, 2023', title: 'Securing the Future: Zero Trust for Small Enterprises', description: 'How our cybersecurity team audits local businesses to implement enterprise-grade security on a budget.' },
];

function BlogScreen() {
  const [filter, setFilter] = React.useState('All Posts');
  const [page, setPage] = React.useState(1);
  return (
    <main style={{ paddingTop: 96, paddingBottom: 80 }}>
      <header style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '64px 32px' }}>
        <span style={{ display: 'inline-block', padding: '6px 16px', marginBottom: 24, background: 'var(--surface-container-highest)', color: 'var(--text-body)', fontFamily: 'var(--font-headline)', fontStyle: 'italic', fontSize: 14, borderRadius: 999 }}>Insights from our digital atelier</span>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 64, color: 'var(--brand-ink)', letterSpacing: 'var(--tracking-tight)', margin: '0 0 24px' }}>From the Field</h1>
        <p style={{ color: 'var(--text-body)', fontSize: 20, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>Student perspectives on technology, careers, and applied learning. Bridging the gap between theory and industry excellence.</p>
      </header>

      <section style={{ background: 'var(--surface-sunken)', marginBottom: 64 }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '24px 32px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: 700, color: 'var(--text-body)' }}>Filter By:</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['All Posts', 'Technology', 'Applied Learning', 'Career Paths'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ background: 'none', border: 'none', borderBottom: filter === f ? '2px solid var(--brand-ink)' : '2px solid transparent', color: filter === f ? 'var(--brand-ink)' : 'var(--text-body)', fontWeight: filter === f ? 700 : 400, paddingBottom: 4, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14 }}>{f}</button>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
          {POSTS.map((p) => <BlogCard key={p.title} {...p} />)}
          <article style={{ gridColumn: 'span 2', background: 'var(--brand-navy-panel)', borderRadius: 8, padding: 40, display: 'flex', gap: 32, alignItems: 'center', color: '#fff' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--on-primary-container, #8192a7)', display: 'block', marginBottom: 16 }}>Subscribe to Insights</span>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 28, margin: '0 0 16px', letterSpacing: 'var(--tracking-tight)' }}>Get the latest student perspectives delivered weekly.</h3>
              <p style={{ color: 'var(--on-primary-container, #8192a7)', margin: '0 0 32px', maxWidth: 400 }}>Stay ahead of the curve with our curated digest of emerging tech and academic research applied to industry.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <input placeholder="Email Address" style={{ flex: 1, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 4, padding: '12px 16px', color: '#fff' }} />
                <button style={{ background: 'var(--brand-gold)', color: 'var(--brand-gold-ink)', border: 'none', padding: '12px 32px', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>Join Now</button>
              </div>
            </div>
            <div style={{ width: '33%', aspectRatio: '1/1', background: 'var(--surface-sunken-strong)', borderRadius: 8, flexShrink: 0 }} />
          </article>
        </div>

        <div style={{ marginTop: 80, paddingTop: 48, borderTop: '1px solid var(--surface-sunken-strong)' }}>
          <Pagination page={page} pageCount={3} onChange={setPage} />
        </div>
      </div>
    </main>
  );
}

window.BlogScreen = BlogScreen;

})();
