import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ONBOARDING_BG_START, ONBOARDING_BG_END } from '../utils/hqConstants';
import WelcomeStep       from '../components/onboarding/WelcomeStep';
import OrgSnapshotStep   from '../components/onboarding/OrgSnapshotStep';
import OrientationStep   from '../components/onboarding/OrientationStep';
import CTAStep           from '../components/onboarding/CTAStep';

const ORIENTATION_STEPS = [
  {
    key:       'notes',
    eyebrow:   'Notes',
    headline:  "Your best tool in a client meeting isn't a notepad.",
    body:      "Hit record when the conversation starts, or recap in your own words when it ends. Either way, Allez turns it into a structured summary — key details, action items, moments that matter. You stay present with your client. The notes take care of themselves.",
    feature:   'Notes — every conversation, captured your way.',
    illustration: 'notes',
  },
  {
    key:       'profiles',
    eyebrow:   'Profiles',
    headline:  'Your client relationship is your most valuable asset.',
    body:      "Every preference, every life moment, every detail that makes someone feel truly known — Allez keeps it all in one place. The more you capture, the richer the picture becomes. So every interaction feels personal, because it is.",
    feature:   'Profiles — knowledge that compounds.',
    illustration: 'profiles',
  },
  {
    key:       'brief',
    eyebrow:   'Daily Brief',
    headline:  "Act before you're asked.",
    body:      "Allez surfaces who deserves a call this week, what's coming up, and where to focus — so you can be proactive without having to think about it.",
    feature:   'Daily Brief — your week, before it begins.',
    illustration: 'brief',
  },
];

function buildSteps(isFlowB) {
  const steps = ['welcome'];
  if (isFlowB) steps.push('snapshot');
  steps.push('orientation-0', 'orientation-1', 'orientation-2');
  steps.push('cta');
  return steps;
}

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [member,   setMember]   = useState(null);
  const [orgName,  setOrgName]  = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [isFlowB,  setIsFlowB]  = useState(false);
  const [steps,    setSteps]    = useState(buildSteps(false));
  const [stepIdx,  setStepIdx]  = useState(0);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/sign-in', { replace: true }); return; }

      const userId = session.user.id;

      const { data: memberRow, error: memberErr } = await supabase
        .from('org_members')
        .select('id, org_id, first_name, onboarding_complete')
        .eq('user_id', userId)
        .single();

      if (cancelled) return;

      if (memberErr || !memberRow) {
        setLoading(false);
        return;
      }

      setMember(memberRow);

      const { data: orgRow } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', memberRow.org_id)
        .single();

      if (!cancelled && orgRow) setOrgName(orgRow.name);

      const [{ count: clientCount }, { count: noteCount }] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('org_id', memberRow.org_id),
        supabase.from('notes').select('id',   { count: 'exact', head: true }).eq('org_id', memberRow.org_id),
      ]);

      if (cancelled) return;

      const flowB = (clientCount > 0) || (noteCount > 0);
      setIsFlowB(flowB);
      setSteps(buildSteps(flowB));

      if (flowB) {
        const [{ count: colleagues }, { count: clients }, { count: notes }] = await Promise.all([
          supabase.from('org_members')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', memberRow.org_id)
            .eq('is_active', true)
            .neq('user_id', userId),
          supabase.from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', memberRow.org_id),
          supabase.from('notes')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', memberRow.org_id),
        ]);

        if (!cancelled) setSnapshot({ colleagues, clients, notes });
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [navigate]);

  function next() { setStepIdx(i => Math.min(i + 1, steps.length - 1)); }
  function back() { setStepIdx(i => Math.max(i - 1, 0)); }

  async function complete(destination) {
    if (!member) return;
    setSaving(true);
    setSaveError(false);

    const { error } = await supabase
      .from('org_members')
      .update({ onboarding_complete: true })
      .eq('id', member.id);

    if (error) {
      setSaving(false);
      setSaveError(true);
      return;
    }

    navigate(destination, { replace: true });
  }

  const currentStep    = steps[stepIdx];
  const isFirst        = stepIdx === 0;
  const orientationIdx = currentStep?.startsWith('orientation-')
    ? parseInt(currentStep.split('-')[1], 10)
    : null;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.gradient} />
      </div>
    );
  }

  if (!member) {
    return (
      <div style={styles.container}>
        <div style={styles.gradient} />
        <div style={styles.holdingWrap}>
          <p style={styles.holdingText}>Your account is being set up.</p>
          <p style={styles.holdingSubtext}>
            Reach out if you need access — <a href="mailto:support@allezhq.com" style={styles.holdingLink}>support@allezhq.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.gradient} />
      <div style={styles.content}>

        {currentStep === 'welcome' && (
          <WelcomeStep isFlowB={isFlowB} orgName={orgName} onNext={next} />
        )}

        {currentStep === 'snapshot' && (
          <OrgSnapshotStep snapshot={snapshot} onNext={next} onBack={back} />
        )}

        {currentStep?.startsWith('orientation-') && (
          <OrientationStep
            content={ORIENTATION_STEPS[orientationIdx]}
            dotIndex={orientationIdx}
            isFirst={isFirst}
            onNext={next}
            onBack={back}
          />
        )}

        {currentStep === 'cta' && (
          <CTAStep
            saving={saving}
            saveError={saveError}
            onNote={() => complete('/hq/notes')}
            onApp={()  => complete('/hq')}
            onBack={back}
          />
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    position:   'relative',
    minHeight:  '100dvh',
    width:      '100%',
    overflow:   'hidden',
  },
  gradient: {
    position: 'fixed',
    inset:    0,
    background: `linear-gradient(135deg, ${ONBOARDING_BG_START} 0%, ${ONBOARDING_BG_END} 100%)`,
    zIndex:   0,
  },
  content: {
    position:   'relative',
    zIndex:     1,
    width:      '100%',
    minHeight:  '100dvh',
  },
  holdingWrap: {
    position:       'absolute',
    top:            '50%',
    left:           '50%',
    transform:      'translate(-50%, -50%)',
    zIndex:         1,
    textAlign:      'center',
  },
  holdingText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize:   '20px',
    fontWeight: '300',
    color:      '#1A1410',
    margin:     '0 0 8px',
  },
  holdingSubtext: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize:   '14px',
    fontWeight: '300',
    color:      '#7A7068',
    margin:     0,
  },
  holdingLink: {
    color:          '#1A9E5F',
    textDecoration: 'none',
  },
};