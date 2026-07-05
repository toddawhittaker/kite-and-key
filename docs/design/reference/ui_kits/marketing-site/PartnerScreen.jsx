(function(){
const { Input, Select, Textarea, StatTile, StepItem, IconTile } = window.KiteKeyITDesignSystem_95b706;

const OFFERS = [
  { icon: 'account_tree', title: 'Scoped Projects', body: 'Every engagement is strictly defined with clear milestones and deliverables. From web apps to data migration, we ensure transparency and timely execution.' },
  { icon: 'verified_user', title: 'Professional & Supervised', body: 'Our student-led teams are overseen by Franklin University faculty and industry veterans, guaranteeing enterprise-grade quality and reliability.' },
  { icon: 'diversity_3', title: 'Community-Serving Model', body: 'We prioritize impact over profit. Our tiered pricing model ensures that small businesses and nonprofits can access high-level IT talent without breaking the bank.' },
];

const AUDIENCE = [
  { title: 'Nonprofits & NGOs', body: 'Organizations looking to scale their digital impact with limited resources.' },
  { title: 'Small Businesses', body: 'Local enterprises needing modern web presences or automated internal systems.' },
  { title: 'Civic Organizations', body: 'Local government initiatives and community-driven tech projects.' },
];

const STEPS = [
  { title: 'Discovery', body: 'Submit your project idea. We evaluate feasibility and alignment.' },
  { title: 'Consultation', body: 'Deep dive into requirements and technical specifications.' },
  { title: 'Proposal', body: 'Receive a detailed project charter, timeline, and tiered pricing.' },
  { title: 'Development', body: 'Agile student teams build your solution with weekly check-ins.' },
  { title: 'Handover', body: 'Final testing, deployment, and documentation delivery.' },
];

function PartnerScreen() {
  return (
    <main style={{ paddingTop: 96 }}>
      <section style={{ position: 'relative', padding: '96px 32px', background: 'var(--brand-ink)', color: '#fff', overflow: 'hidden' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'inline-block', padding: '4px 16px', marginBottom: 24, background: 'var(--brand-navy-panel)', color: 'var(--brand-gold)', fontSize: 11, fontWeight: 700, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', borderRadius: 999 }}>Partnerships</span>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 56, fontWeight: 700, lineHeight: 1.2, maxWidth: 720, margin: '0 0 32px' }}>Fostering Innovation through <span style={{ fontStyle: 'italic', color: 'var(--brand-gold)' }}>Academic Excellence.</span></h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,.7)', maxWidth: 560, lineHeight: 1.6, margin: 0 }}>Kite &amp; Key IT bridges the gap between ambitious students and organizations seeking professional technical solutions. Together, we build the future.</p>
        </div>
      </section>

      <section style={{ padding: '96px 32px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--brand-ink)', margin: '0 0 16px' }}>What We Offer</h2>
          <div style={{ width: 80, height: 4, background: 'var(--brand-gold)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
          {OFFERS.map((o) => (
            <div key={o.title} style={{ padding: 32, borderRadius: 8, background: 'var(--surface-card)' }}>
              <IconTile icon={o.icon} shape="square" tone="navy" style={{ marginBottom: 24 }} />
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-ink)', margin: '0 0 16px' }}>{o.title}</h3>
              <p style={{ color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>{o.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--surface-sunken)', padding: '96px 32px' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'flex', gap: 64, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--brand-ink)', margin: '0 0 32px' }}>Who We Work With</h2>
            <p style={{ fontSize: 18, color: 'var(--text-body)', margin: '0 0 48px' }}>We seek partners who value innovation, education, and social responsibility. Our ideal collaborators include:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {AUDIENCE.map((a) => (
                <div key={a.title} style={{ display: 'flex', gap: 16 }}>
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--brand-gold-hover)', marginTop: 4 }}>check_circle</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: 'var(--brand-ink)' }}>{a.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-body)' }}>{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ height: 200, borderRadius: 12, background: 'var(--surface-sunken-strong)', boxShadow: 'var(--shadow-pop)' }} />
              <StatTile value="100%" label="Student Driven" tone="navy" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 48 }}>
              <StatTile value="50+" label="Projects Shipped" tone="gold" />
              <div style={{ height: 200, borderRadius: 12, background: 'var(--surface-sunken-strong)', boxShadow: 'var(--shadow-pop)' }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 32px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--brand-ink)', margin: '0 0 16px' }}>Our Collaborative Process</h2>
          <p style={{ color: 'var(--text-body)', maxWidth: 560, margin: '0 auto' }}>A seamless journey from initial concept to deployment.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32 }}>
          {STEPS.map((s, i) => <StepItem key={s.title} number={i + 1} title={s.title} description={s.body} />)}
        </div>
      </section>

      <section style={{ padding: '96px 32px', background: 'var(--brand-ink)' }}>
        <div style={{ maxWidth: 'var(--content-max-narrow)', margin: '0 auto', background: 'var(--surface-card)', borderRadius: 12, padding: 48, boxShadow: 'var(--shadow-pop)' }}>
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 34, color: 'var(--brand-ink)', margin: '0 0 16px' }}>Start a Partnership</h2>
            <p style={{ color: 'var(--text-body)', margin: 0 }}>Tell us about your organization and the challenges you're looking to solve. Our team will review your inquiry within 3 business days.</p>
          </div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <Input label="Org Name" placeholder="e.g. Acme Community Foundation" />
              <Select label="Org Type" options={['Nonprofit', 'Small Business', 'Government/Civic', 'Education', 'Other']} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <Input label="Contact Name" placeholder="Jane Doe" />
              <Input label="Email" type="email" placeholder="jane@example.org" />
            </div>
            <Textarea label="Description" placeholder="What are the goals of this project?" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <Select label="Timeline" options={['ASAP (Next 1-2 months)', 'Upcoming Semester', 'No rush (Flexible)']} />
              <Input label="Referral" placeholder="How did you hear about us?" />
            </div>
            <button type="button" style={{ width: '100%', background: 'var(--brand-gold)', color: 'var(--brand-gold-ink)', border: 'none', padding: '16px', borderRadius: 4, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>Send Us Your Project Idea</button>
          </form>
        </div>
      </section>
    </main>
  );
}

window.PartnerScreen = PartnerScreen;

})();
