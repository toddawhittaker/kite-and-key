(function(){
const { ProjectCard, FilterPill } = window.KiteKeyITDesignSystem_95b706;

const PROJECTS = [
  { status: 'success', statusLabel: 'Completed', icon: 'terminal', category: 'Non-Profit Sector', title: 'Community Health Portal', description: 'Developed a secure patient communication platform for local healthcare providers, enhancing accessibility for under-served communities.', tags: ['React', 'Node.js', 'AWS'], timeline: 'Q3 2023 - Q1 2024' },
  { status: 'info', statusLabel: 'In Progress', icon: 'database', category: 'Government Agency', title: 'Traffic Flow Analysis AI', description: 'Leveraging computer vision and machine learning to optimize urban traffic patterns and reduce carbon emissions in the downtown district.', tags: ['Python', 'PyTorch', 'Edge Computing'], timeline: 'Estimated Q4 2024' },
  { status: 'pending', statusLabel: 'Seeking Team', icon: 'security', category: 'FinTech Startup', title: 'Blockchain Audit Engine', description: 'Building an automated security audit tool for Ethereum smart contracts to identify vulnerabilities before deployment.', tags: ['Solidity', 'Hardhat', 'Security'], timeline: 'Opening Fall 2024' },
  { status: 'success', statusLabel: 'Completed', icon: 'cloud', category: 'Local Education', title: 'Hybrid Cloud Migration', description: 'Orchestrated a seamless transition of legacy school district servers to a secure, scalable hybrid cloud infrastructure.', tags: ['Azure', 'Docker', 'Kubernetes'], timeline: 'Q1 2023 - Q4 2023' },
  { status: 'info', statusLabel: 'In Progress', icon: 'language', category: 'Retail Partner', title: 'E-Commerce SEO Engine', description: 'Developing a custom analytics dashboard for a regional retailer to monitor and optimize search engine visibility in real-time.', tags: ['Next.js', 'GraphQL', 'BigQuery'], timeline: 'Estimated Q3 2024' },
  { status: 'success', statusLabel: 'Completed', icon: 'shield', category: 'University Admin', title: 'Zero-Trust Authentication', description: 'Designed and implemented a Zero-Trust security model for administrative access, significantly reducing credential theft risk.', tags: ['IAM', 'MFA', 'CyberOps'], timeline: 'Q4 2023' },
];

const FILTERS = ['All', 'Web & App Development', 'Data & Analytics', 'Cybersecurity', 'Cloud & Infrastructure', 'Emerging Technology'];

function ProjectsScreen() {
  const [filter, setFilter] = React.useState('All');
  return (
    <main style={{ paddingTop: 128, paddingBottom: 80 }}>
      <header style={{ maxWidth: 'var(--content-max)', margin: '0 auto 64px', padding: '0 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
          <div style={{ maxWidth: 640 }}>
            <span style={{ display: 'inline-block', padding: '4px 16px', marginBottom: 16, background: 'var(--surface-container-highest)', fontFamily: 'var(--font-headline)', fontStyle: 'italic', fontSize: 14, borderRadius: 999, color: 'var(--text-body)' }}>Our Portfolio</span>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 56, fontWeight: 700, color: 'var(--brand-ink)', letterSpacing: 'var(--tracking-tight)', margin: '0 0 24px' }}>Our Work</h1>
            <p style={{ color: 'var(--text-body)', fontSize: 20, lineHeight: 1.6, margin: 0 }}>Student teams working on real technology problems for real organizations. We bridge the gap between academic theory and industry excellence.</p>
          </div>
          <div style={{ width: 96, height: 96, background: 'var(--brand-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--brand-gold-ink)' }}>auto_awesome</span>
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto 48px', padding: '0 32px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterPill>)}
      </section>

      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {PROJECTS.map((p) => <ProjectCard key={p.title} {...p} />)}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--content-max)', margin: '96px auto 0', padding: '0 32px' }}>
        <div style={{ position: 'relative', background: 'var(--brand-ink)', borderRadius: 'var(--radius-lg)', padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, overflow: 'hidden' }}>
          <div style={{ maxWidth: 520, position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 34, color: '#fff', margin: '0 0 16px', lineHeight: 1.3 }}>Ready to launch your next project with student talent?</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, margin: '0 0 32px' }}>We bring fresh perspectives and the latest technical knowledge to solve your organization's unique challenges.</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button style={{ background: 'var(--brand-gold)', color: 'var(--brand-gold-ink)', border: 'none', padding: '16px 32px', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer' }}>Start a Partnership</button>
              <button style={{ background: 'var(--brand-navy-panel)', color: '#fff', border: '1px solid rgba(196,198,205,.2)', padding: '16px 32px', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer' }}>View FAQ</button>
            </div>
          </div>
          <div style={{ width: 220, height: 220, borderRadius: '50%', border: '4px solid var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 96, color: 'var(--brand-gold)' }}>handshake</span>
          </div>
        </div>
      </section>
    </main>
  );
}

window.ProjectsScreen = ProjectsScreen;

})();
