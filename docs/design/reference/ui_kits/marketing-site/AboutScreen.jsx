(function(){
const { IconTile, Card } = window.KiteKeyITDesignSystem_95b706;

function AboutScreen() {
  const values = [
    { icon: 'work', title: 'Real Work', body: 'We don\'t do "practice" projects. Our teams manage live deployments, client accounts, and production-ready codebases that drive real business value.' },
    { icon: 'trending_up', title: 'Visible Growth', body: 'Success is measured in milestones. Every student leaves with a portfolio of verified impact, showing a clear trajectory from apprentice to expert.' },
    { icon: 'groups', title: 'Professional Community', body: 'We foster an ecosystem of mentorship where alumni, students, and faculty collaborate to solve the industry\'s most pressing challenges.' },
  ];
  const steps = [
    { icon: 'school', label: 'Community', tone: 'outline' },
    { icon: 'code', label: 'Apprenticeship', tone: 'square' },
    { icon: 'stars', label: 'Consultancy', tone: 'active' },
    { icon: 'rocket_launch', label: 'Careers', tone: 'gold' },
  ];

  return (
    <main style={{ paddingTop: 96 }}>
      <section style={{ padding: '80px 32px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '4px 16px', marginBottom: 24, background: 'var(--surface-container-highest)', color: 'var(--brand-ink)', fontFamily: 'var(--font-headline)', fontStyle: 'italic', borderRadius: 999, fontSize: 14 }}>Our Mission</span>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 52, color: 'var(--brand-ink)', lineHeight: 1.15, letterSpacing: 'var(--tracking-tight)', margin: '0 0 32px' }}>
              Bridging the gap between <span style={{ fontStyle: 'italic', color: 'var(--on-tertiary-container)' }}>theory</span> and technical <span style={{ fontStyle: 'italic' }}>mastery</span>.
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, color: 'var(--text-body)', fontSize: 17, lineHeight: 1.7, maxWidth: 520 }}>
              <p style={{ margin: 0 }}>Kite &amp; Key IT isn't just a consultancy; it's a living laboratory. As a student-driven initiative at Franklin University, we provide a launchpad for the next generation of technology leaders through rigorous applied learning.</p>
              <p style={{ margin: 0 }}>We believe that the best way to master a craft is to practice it at scale. Our engineers tackle real-world digital transformations, working alongside industry veterans to deliver enterprise-grade solutions while refining their own professional DNA.</p>
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card-soft)' }}>
            <img src="https://lh3.googleusercontent.com/aida-public/PLACEHOLDER" alt="Students collaborating" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', mixBlendMode: 'multiply', opacity: 0.9 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,22,39,0.4), transparent)' }} />
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--surface-sunken)', padding: '96px 32px' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--brand-ink)', margin: '0 0 16px' }}>Core Principles</h2>
            <p style={{ color: 'var(--on-secondary-container, #656464)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontSize: 11, fontWeight: 700, margin: 0 }}>The Foundation of Kite &amp; Key</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {values.map((v) => (
              <Card key={v.title} padding={40}>
                <IconTile icon={v.icon} shape="square" tone="navy" style={{ marginBottom: 32 }} />
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--brand-ink)', margin: '0 0 16px' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>{v.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 32px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 64, alignItems: 'center' }}>
          <div style={{ flex: '0 0 33%' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--brand-ink)', margin: '0 0 24px' }}>The Success Ecosystem</h2>
            <p style={{ color: 'var(--text-body)', fontSize: 18, margin: '0 0 32px' }}>Our pathway is designed to accelerate professional maturity, taking high-potential students and refining them into industry-ready leaders.</p>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--brand-ink)', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
              Join the Pathway <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'center' }}>
            {steps.map((s, i) => (
              <div key={s.label} style={{ aspectRatio: '1/1', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, transform: s.tone === 'active' ? 'scale(1.1)' : 'scale(1)', boxShadow: s.tone === 'active' ? 'var(--shadow-pop)' : 'none',
                background: s.tone === 'outline' ? 'transparent' : s.tone === 'square' ? 'var(--surface-sunken-strong)' : s.tone === 'active' ? 'var(--brand-navy-panel)' : 'var(--brand-gold)',
                border: s.tone === 'outline' ? '4px dashed var(--outline-variant)' : 'none',
                color: s.tone === 'active' || s.tone === 'gold' ? '#fff' : 'var(--brand-ink)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, marginBottom: 8, color: s.tone === 'active' ? 'var(--brand-gold)' : 'inherit' }}>{s.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 32px', borderTop: '1px solid var(--surface-sunken-strong)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: 0.4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>account_balance</span>
              <span style={{ fontFamily: 'var(--font-headline)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--brand-ink)' }}>FRANKLIN UNIVERSITY</span>
            </div>
            <p style={{ color: 'var(--on-secondary-container, #656464)', lineHeight: 1.6, margin: 0 }}>Kite &amp; Key IT is a student-led consultancy and part of the Franklin University ecosystem. Our projects are supported by the university's commitment to lifelong learning and academic excellence in technical education.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

window.AboutScreen = AboutScreen;

})();
