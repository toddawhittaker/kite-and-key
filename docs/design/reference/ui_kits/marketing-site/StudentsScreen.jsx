(function(){
const { StudentCard, Select } = window.KiteKeyITDesignSystem_95b706;

const STUDENTS = [
  { image: 'PLACEHOLDER', tag: 'New Role', name: 'Aisha Thompson', year: '2023', program: 'Full-Stack Development', quote: 'From codebase to lead architect in six months.', description: 'Aisha leveraged her training at Kite & Key to secure a Senior Dev role at a leading FinTech startup, specializing in scalable cloud infrastructures.' },
  { image: 'PLACEHOLDER', tag: 'Career Change', name: 'Marcus Rivera', year: '2024', program: 'Data Engineering', quote: 'Transitioning from humanities to high-stakes data.', description: 'Marcus brought his analytical background in history to the world of Big Data, landing a position as a lead ETL developer.' },
  { image: 'PLACEHOLDER', tag: 'Promotion', name: 'Diane Kowalski', year: '2022', program: 'Advanced Cybersecurity', quote: 'Securing the enterprise through strategic insight.', description: 'After completing our capstone program, Diane was promoted to CISO at her organization, overseeing a team of 40 security specialists.' },
];

function StudentsScreen() {
  return (
    <main style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '64px 32px' }}>
      <header style={{ maxWidth: 640, marginBottom: 80 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 'var(--tracking-widest)', color: 'var(--on-tertiary-container)', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Success Narratives</span>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 48, fontWeight: 700, color: 'var(--brand-ink)', lineHeight: 1.15, margin: '0 0 24px' }}>Student Highlights</h1>
        <p style={{ fontFamily: 'var(--font-headline)', fontStyle: 'italic', fontSize: 20, color: 'var(--text-body)', margin: '0 0 32px' }}>Meet the people behind the work — and where the work took them.</p>
        <div style={{ height: 4, width: 96, background: 'var(--brand-gold)', marginBottom: 32 }} />
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>Our consultancy thrives on the intersection of academic curiosity and technical excellence. These individuals represent the pinnacle of our student-led initiatives, having bridged the gap between theoretical study and enterprise-grade IT implementation.</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, marginBottom: 48, paddingBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, flex: 1 }}>
          <Select label="Program" options={['All Programs', 'Advanced Cybersecurity', 'Full-Stack Development', 'Data Engineering']} />
          <Select label="Outcome Type" options={['All Outcomes', 'New Role', 'Career Change', 'Promotion']} />
          <Select label="Class Year" options={['All Years', '2024', '2023', '2022']} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-sunken)', padding: 4, borderRadius: 8 }}>
          <button style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.08)', border: 'none', padding: 8, borderRadius: 4, display: 'flex', color: 'var(--brand-ink)' }}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span></button>
          <button style={{ background: 'none', border: 'none', padding: 8, borderRadius: 4, display: 'flex', color: 'var(--text-body)' }}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>view_list</span></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px 32px' }}>
        {STUDENTS.map((s) => <StudentCard key={s.name} {...s} />)}
      </div>

      <div style={{ marginTop: 80, display: 'flex', justifyContent: 'center' }}>
        <button style={{ padding: '16px 40px', background: 'var(--brand-navy-panel)', color: '#fff', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Load More Highlights</button>
      </div>
    </main>
  );
}

window.StudentsScreen = StudentsScreen;

})();
