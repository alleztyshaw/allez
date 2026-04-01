import {
  FONT_BODY, FONT_DISPLAY,
  FW_MEDIUM, FW_SEMIBOLD,
  PUB_ACCENT,
  PUB_BG, PUB_TEXT, PUB_BODY_MUTED,
  PUB_BORDER, PUB_CARD_BG,
  PUB_TIER_STARTER,
  MOBILE_BREAKPOINT,
} from '../utils/publicConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import PublicHelmet from '../components/public/PublicHelmet';

const CHECKS = [
  { label: 'TLS encryption in transit',                done: true  },
  { label: 'AES-256 encryption at rest',               done: true  },
  { label: 'US-based data residency (AWS us-east-1)',   done: true  },
  { label: 'Row-level data isolation per firm',        done: true  },
  { label: 'Role-based access controls',               done: true  },
  { label: 'Tamper-evident audit logging',             done: true  },
  { label: 'Sub-processor data processing agreements', done: true  },
  { label: 'Security incident response policy',        done: true  },
  { label: 'SOC 2 Type II examination',                done: false },
  { label: 'Third-party penetration testing',          done: false },
  { label: 'Vanta trust portal',                       done: false },
];

export default function SecurityPage() {
  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;

  const sectionStyle = {
    borderTop: `1px solid ${PUB_BORDER}`,
    paddingTop: 56,
    marginTop: 56,
  };

  const h2Style = {
    fontFamily: FONT_DISPLAY,
    fontSize: isMobile ? 22 : 26,
    fontWeight: FW_MEDIUM,
    color: PUB_TEXT,
    marginBottom: 16,
    lineHeight: 1.3,
  };

  const h3Style = {
    fontFamily: FONT_BODY,
    fontSize: 13,
    fontWeight: FW_SEMIBOLD,
    color: PUB_TEXT,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: 32,
    marginBottom: 8,
  };

  const pStyle = {
    fontFamily: FONT_BODY,
    fontSize: 15,
    lineHeight: 1.75,
    color: PUB_BODY_MUTED,
    margin: '0 0 16px',
  };

  const noteStyle = {
    fontFamily: FONT_BODY,
    fontSize: 13,
    lineHeight: 1.7,
    color: PUB_BODY_MUTED,
    fontStyle: 'italic',
    borderLeft: `3px solid ${PUB_BORDER}`,
    paddingLeft: 16,
    margin: '24px 0',
  };

  const linkStyle = {
    color: PUB_ACCENT,
    textDecoration: 'none',
    fontFamily: FONT_BODY,
    fontSize: 14,
  };

  return (
    <div style={{ background: PUB_BG, minHeight: '100vh' }}>
      <PublicHelmet title="Security & Compliance | Allez HQ" />
      <PublicHeader />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: isMobile ? '48px 20px 80px' : '80px 24px 120px' }}>

        {/* ── Eyebrow + Headline ──────────────────────────────── */}
        <p style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: FW_SEMIBOLD, letterSpacing: '0.1em', textTransform: 'uppercase', color: PUB_ACCENT, margin: '0 0 16px' }}>
          Security &amp; Compliance
        </p>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: isMobile ? 32 : 42, fontWeight: FW_MEDIUM, color: PUB_TEXT, margin: '0 0 20px', lineHeight: 1.2 }}>
          Built for advisors who answer to regulators
        </h1>
        <p style={{ fontFamily: FONT_BODY, fontSize: isMobile ? 15 : 17, lineHeight: 1.75, color: PUB_BODY_MUTED, margin: '0 0 40px', maxWidth: 640 }}>
          Allez HQ is designed specifically for RIA firms operating under SEC and state oversight. This page explains exactly how we handle your data — and your clients' — so you can make an informed decision about bringing us into your practice.
        </p>

        {/* ── Plain Language Summary ──────────────────────────── */}
        <div style={{ background: PUB_CARD_BG, borderRadius: '10px', padding: isMobile ? '20px' : '28px 32px', marginBottom: 16 }}>
          <p style={{ ...pStyle, color: PUB_TEXT, marginBottom: 0 }}>
            Your client data is encrypted, isolated to your firm, and never used to train AI models. You own it entirely and can export it at any time. If you leave, it's deleted. Our AI features process data transiently — nothing is retained by third-party providers after output is generated. Every action taken in the platform is logged. Your compliance officer has their own access tier. And if something goes wrong, we'll tell you promptly.
          </p>
          <p style={{ ...pStyle, marginTop: 12, marginBottom: 0, fontSize: 14 }}>
            That's the short version. Everything below is the detail.
          </p>
        </div>

        {/* ── Section 1: Data Security ────────────────────────── */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Your data is encrypted, isolated, and never shared.</h2>
          <p style={pStyle}>
            All data transmitted between your browser and Allez HQ is encrypted in transit using TLS 1.2 or higher. All data stored at rest is encrypted using AES-256, hosted on AWS infrastructure in the United States (us-east-1).
          </p>
          <p style={pStyle}>
            Every firm's data is logically isolated at the database layer using row-level security policies — it is architecturally impossible for one firm's data to be accessed by another, regardless of user permissions.
          </p>
          <p style={pStyle}>
            No client data is stored locally on user devices. Allez HQ personnel do not have access to your client records. Any internal access required for platform support is restricted, requires explicit authorization, and is logged.
          </p>
        </div>

        {/* ── Section 2: AI Pipeline ───────────────────────────── */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>We're specific about what happens when AI touches your data.</h2>
          <p style={pStyle}>
            Allez HQ uses AI to transcribe meetings and generate summaries, action items, and draft follow-up communications. Here's exactly how that pipeline works and what protections apply at every step.
          </p>

          <h3 style={h3Style}>Transcription</h3>
          <p style={pStyle}>
            Meeting audio is transmitted to a SOC 2 certified speech recognition provider for transcription and speaker identification. Audio is processed transiently — it is not retained by the provider after transcription is complete. The provider is contractually prohibited from using your data for any purpose beyond delivering the transcription output, including training or improving any AI model.
          </p>

          <h3 style={h3Style}>Summarization and drafting</h3>
          <p style={pStyle}>
            Transcript text is transmitted to an AI safety-focused language model provider to generate structured summaries, action items, and draft emails. Text is processed transiently — transcripts are not retained by the provider after output is generated. The provider is contractually prohibited from using your data to train any model, public or private.
          </p>

          <h3 style={h3Style}>Allez HQ's own commitments</h3>
          <p style={pStyle}>
            We do not use client data, meeting content, or transcripts to train, fine-tune, or improve any model. All AI-generated output is presented to the advisor for review before use — nothing is automatically distributed to clients. AI output is a drafting aid, not a final work product.
          </p>

          <p style={{ ...pStyle, marginTop: 8 }}>
            A full list of our data sub-processors, including named vendors, is available in our{' '}
            <a href="/legal/privacy-policy" style={linkStyle}>Privacy Policy →</a>
          </p>
        </div>

        {/* ── Section 3: Access Controls ───────────────────────── */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Every action is logged. Your compliance officer has a seat at the table.</h2>

          <h3 style={h3Style}>Access controls</h3>
          <p style={pStyle}>
            Allez HQ uses a five-tier role hierarchy — Admin, Manager, Advisor, Associate, and Compliance — so you control exactly what each person on your team can see and do. Role assignments are managed by firm admins and can be updated or revoked at any time.
          </p>
          <p style={pStyle}>
            The Compliance role provides read-only access across the platform — activity logs, client records, meeting notes, and firm-wide data — without the ability to edit or delete anything. It's designed for a dedicated CCO who needs supervisory visibility without being in every advisor's workflow.
          </p>
          <p style={pStyle}>
            If you're a solo advisor who handles your own compliance, you already have full visibility into everything as an Admin. No separate setup required.
          </p>

          <h3 style={h3Style}>Audit trail</h3>
          <p style={pStyle}>
            Every meaningful action taken in the platform is written to a tamper-evident audit log — including record creation, edits, deletions, note access, login events, and permission changes. Each entry captures the timestamp, the user, the action type, and the affected record.
          </p>
          <p style={pStyle}>
            The audit log is accessible to Compliance role users and Admins at any time. It is not editable or deletable by any user, including platform admins.
          </p>

          <div style={noteStyle}>
            <strong style={{ fontStyle: 'normal' }}>A note on recording consent.</strong> Recording client meetings may be subject to federal and state consent requirements depending on your jurisdiction and client agreements. Compliance with applicable recording consent obligations is the firm's responsibility. We recommend consulting your compliance consultant or legal counsel on your firm's specific obligations before enabling the meeting recording feature.
          </div>
        </div>

        {/* ── Section 4: Your Rights ───────────────────────────── */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Your data belongs to you. Here's what that means in practice.</h2>

          <h3 style={h3Style}>Ownership</h3>
          <p style={pStyle}>
            The subscribing firm owns all client data entered into Allez HQ. We make no claim of ownership over your data and will never use it for commercial purposes beyond delivering the Services to you.
          </p>

          <h3 style={h3Style}>Portability</h3>
          <p style={pStyle}>
            You can export your data at any time in a standard format directly from the platform. No support ticket required.
          </p>

          <h3 style={h3Style}>Termination and deletion</h3>
          <p style={pStyle}>
            Upon cancellation, your data remains available for export for 30 days. After that window closes, all client data is permanently and irreversibly deleted from our systems and those of our sub-processors. We will confirm deletion upon request.
          </p>

          <h3 style={h3Style}>Business continuity</h3>
          <p style={pStyle}>
            In the event that Allez HQ undergoes a material change — including acquisition, dissolution, or cessation of the Services — we will provide affected firms with reasonable advance notice and a full data export prior to any discontinuation of access. Your data will never be transferred to a successor entity without your knowledge.
          </p>

          <h3 style={h3Style}>Incident response</h3>
          <p style={pStyle}>
            In the event of a confirmed security incident that materially affects your firm's data, we will notify you promptly. Notification will include the nature of the incident, the data affected, the steps we have taken to contain it, and any recommended actions on your part. We maintain a written incident response policy and test it on a regular cadence.
          </p>

          <p style={{ ...pStyle, marginTop: 24 }}>
            <a href="/legal/privacy-policy" style={linkStyle}>Privacy Policy →</a>
            <span style={{ margin: '0 12px', color: PUB_BORDER }}>·</span>
            <a href="/legal/terms-of-service" style={linkStyle}>Terms of Service →</a>
          </p>
        </div>

        {/* ── Section 5: Certifications ────────────────────────── */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Where we are today and what's on the roadmap.</h2>
          <p style={{ ...pStyle, marginBottom: 32 }}>
            We believe in stating our security posture honestly rather than overstating it. Here is our current status.
          </p>

          <div style={{ border: `1px solid ${PUB_BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
            {CHECKS.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '12px 16px' : '14px 24px',
                  borderBottom: i < CHECKS.length - 1 ? `1px solid ${PUB_BORDER}` : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                }}
              >
                <span style={{ fontFamily: FONT_BODY, fontSize: isMobile ? 13 : 14, color: PUB_TEXT }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: FONT_BODY,
                  fontSize: 13,
                  fontWeight: FW_MEDIUM,
                  color: item.done ? PUB_TIER_STARTER : PUB_BODY_MUTED,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 80,
                  justifyContent: 'flex-end',
                  flexShrink: 0,
                }}>
                  {item.done ? (
                    <><span style={{ fontSize: 15 }}>✓</span> Active</>
                  ) : (
                    <><span style={{ fontSize: 15 }}>○</span> Planned</>
                  )}
                </span>
              </div>
            ))}
          </div>

          <p style={{ ...pStyle, marginTop: 24, fontSize: 14 }}>
            We are happy to provide current security documentation, including our incident response policy and sub-processor agreements, upon request for vendor due diligence purposes.
          </p>
        </div>

        {/* ── Section 6: CTA ───────────────────────────────────── */}
        <div style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 8 }}>
          <h2 style={{ ...h2Style, textAlign: 'center' }}>Compliance questions get a direct response.</h2>
          <p style={{ ...pStyle, maxWidth: 520, margin: '0 auto 32px', textAlign: 'center' }}>
            Whether you're a CCO completing a vendor review, an advisor evaluating whether Allez HQ fits your compliance program, or a consultant reviewing on behalf of a client — reach out directly. We respond to compliance and security inquiries within one business day.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              background: PUB_ACCENT,
              color: '#ffffff',
              fontFamily: FONT_BODY,
              fontSize: 15,
              fontWeight: FW_MEDIUM,
              padding: '14px 32px',
              borderRadius: '10px',
              textDecoration: 'none',
              marginBottom: 20,
            }}
          >
            Contact our team
          </a>
          <p style={{ ...pStyle, fontSize: 13, marginTop: 16 }}>
            Or email us directly at{' '}
            <a href="mailto:legal@allezhq.com" style={linkStyle}>legal@allezhq.com</a>
          </p>
        </div>

      </div>

      <PublicFooter />
    </div>
  );
}