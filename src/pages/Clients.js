import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import MeetingModal from '../components/MeetingModal';
import {
  ASSET_LEVEL_OPTIONS,
  COMMUNICATION_FREQUENCY_OPTIONS,
  COMMUNICATION_FREQUENCY_DAYS,
  CADENCE_AMBER_DAYS,
  CONTACT_METHOD_OPTIONS,
  FONT_BODY,
  FONT_DISPLAY,
  FULL_ACCESS_ROLES,
  BRIEF_ROLES,
  PIPELINE_STAGES,
  INVESTMENT_OBJECTIVE_OPTIONS,
  LIQUIDITY_NEEDS_OPTIONS,
  OVERLAY_BG,
  RADIUS_LG,
  RADIUS_MD,
  REFERRAL_SOURCE_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  SHADOW_MD,
  SHADOW_LG,
  STATUS_TEXT_COLORS,
  STATUS_OPTIONS,
  TAX_BRACKET_OPTIONS,
  TIME_HORIZON_OPTIONS,
  pageStyles,
  MOBILE_BREAKPOINT,
  COLOR_ERROR,
  COLOR_WARNING,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  date_of_birth: '', status: 'Prospect', pipeline_stage: 'Lead', asset_level: '',
  risk_tolerance: '', investment_objective: '', time_horizon: '',
  tax_bracket: '', liquidity_needs: '',
  referral_source: '', client_since: '', next_review_date: '',
  preferred_contact_method: '', communication_frequency: '', notes: '',
};

// ── CSV import constants ──────────────────────────────────────────────────────

const IMPORT_FIELDS = [
  { key: 'first_name',              label: 'First Name *',             required: true  },
  { key: 'last_name',               label: 'Last Name *',              required: true  },
  { key: 'date_of_birth',           label: 'Date of Birth *',          required: true  },
  { key: 'email',                   label: 'Email',                    required: false },
  { key: 'phone',                   label: 'Phone',                    required: false },
  { key: 'status',                  label: 'Status',                   required: false },
  { key: 'asset_level',             label: 'Asset Level',              required: false },
  { key: 'risk_tolerance',          label: 'Risk Tolerance',           required: false },
  { key: 'investment_objective',    label: 'Investment Objective',     required: false },
  { key: 'time_horizon',            label: 'Time Horizon',             required: false },
  { key: 'tax_bracket',             label: 'Tax Bracket',              required: false },
  { key: 'liquidity_needs',         label: 'Liquidity Needs',          required: false },
  { key: 'communication_frequency', label: 'Communication Frequency',  required: false },
  { key: 'referral_source',         label: 'Referral Source',          required: false },
  { key: 'client_since',            label: 'Client Since',             required: false },
  { key: 'next_review_date',        label: 'Next Review Date',         required: false },
  { key: 'notes',                   label: 'Notes',                    required: false },
];

// Auto-detect common CSV header synonyms → allez field key
const FIELD_SYNONYMS = {
  first_name:              ['first name', 'firstname', 'fname', 'first', 'given name', 'given_name'],
  last_name:               ['last name', 'lastname', 'lname', 'last', 'surname', 'family name', 'family_name'],
  date_of_birth:           ['dob', 'date of birth', 'birthdate', 'birth date', 'birthday', 'date_of_birth', 'birth_date'],
  email:                   ['email', 'email address', 'e-mail', 'email_address', 'e_mail'],
  phone:                   ['phone', 'phone number', 'mobile', 'cell', 'telephone', 'phone_number', 'cell phone', 'mobile number'],
  status:                  ['status', 'client status', 'client_status'],
  asset_level:             ['asset level', 'assets', 'asset_level', 'aum tier', 'wealth tier', 'aum level'],
  risk_tolerance:          ['risk', 'risk tolerance', 'risk_tolerance', 'risk profile', 'risk_profile'],
  investment_objective:    ['investment objective', 'investment_objective', 'objective', 'inv objective'],
  time_horizon:            ['time horizon', 'time_horizon', 'horizon', 'investment horizon'],
  tax_bracket:             ['tax bracket', 'tax_bracket', 'tax rate', 'tax_rate'],
  liquidity_needs:         ['liquidity', 'liquidity needs', 'liquidity_needs'],
  communication_frequency: ['communication frequency', 'communication_frequency', 'contact frequency', 'review frequency', 'cadence'],
  referral_source:         ['referral', 'referral source', 'referral_source', 'source', 'lead source'],
  client_since:            ['client since', 'client_since', 'start date', 'relationship start', 'inception date'],
  next_review_date:        ['next review', 'next review date', 'next_review_date', 'review date', 'next meeting'],
  notes:                   ['notes', 'note', 'comments', 'comment', 'memo', 'remarks'],
};

function autoDetectMapping(headers) {
  const map = {};
  headers.forEach(h => {
    const normalized = h.toLowerCase().trim();
    for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS)) {
      if (synonyms.includes(normalized) || normalized === field) {
        map[h] = field;
        break;
      }
    }
    if (!map[h]) map[h] = '__skip__';
  });
  return map;
}

function downloadTemplate() {
  const headers = IMPORT_FIELDS.map(f => f.required ? `${f.key} (required)` : f.key);
  const example = [
    'Jane', 'Smith', '03-15-1975', 'jane@example.com', '(555) 123-4567',
    'Active', '$1M – $5M', 'Moderate', 'Balanced', 'Long (10yr+)',
    '32%', 'Low', 'Quarterly', 'Referral', '01-01-2020', '06-01-2026', 'Example client',
  ];
  const csv = headers.join(',') + '\n' + example.join(',') + '\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'allez_hq_client_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Date helpers ──────────────────────────────────────────────────────────────

// Converts MM-DD-YYYY or MM/DD/YYYY → YYYY-MM-DD for Supabase storage.
// Passes through anything already in YYYY-MM-DD format.
function normalizeDate(raw) {
  if (!raw || !raw.trim()) return '';
  const s = raw.trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // MM-DD-YYYY or MM/DD/YYYY
  const match = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  return s; // return as-is and let validation catch it
}

// ── Vocabulary normalization ───────────────────────────────────────────────────

const VOCAB_MAP = {
  risk_tolerance: {
    'conservative':              'Conservative',
    'very conservative':         'Conservative',
    'moderately conservative':   'Moderately Conservative',
    'mod conservative':          'Moderately Conservative',
    'mod. conservative':         'Moderately Conservative',
    'moderate':                  'Moderate',
    'medium':                    'Moderate',
    'moderately aggressive':     'Moderately Aggressive',
    'mod aggressive':            'Moderately Aggressive',
    'mod. aggressive':           'Moderately Aggressive',
    'aggressive':                'Aggressive',
    'very aggressive':           'Aggressive',
    'growth':                    'Aggressive',
  },
  investment_objective: {
    'growth':                    'Growth',
    'capital appreciation':      'Growth',
    'capital growth':            'Growth',
    'long term growth':          'Growth',
    'income':                    'Income',
    'income & preservation':     'Income',
    'current income':            'Income',
    'preservation':              'Preservation',
    'capital preservation':      'Preservation',
    'wealth preservation':       'Preservation',
    'balanced':                  'Balanced',
    'balanced growth':           'Balanced',
    'growth and income':         'Balanced',
    'total return':              'Balanced',
  },
  time_horizon: {
    'short':                     'Short (0–3yr)',
    'short term':                'Short (0–3yr)',
    '0-3':                       'Short (0–3yr)',
    '0-3 years':                 'Short (0–3yr)',
    'medium':                    'Medium (3–10yr)',
    'medium term':               'Medium (3–10yr)',
    'intermediate':              'Medium (3–10yr)',
    '3-10':                      'Medium (3–10yr)',
    '3-10 years':                'Medium (3–10yr)',
    'long':                      'Long (10yr+)',
    'long term':                 'Long (10yr+)',
    '10+':                       'Long (10yr+)',
    '10+ years':                 'Long (10yr+)',
    'long (10yr+)':              'Long (10yr+)',
  },
  liquidity_needs: {
    'low':                       'Low',
    'minimal':                   'Low',
    'medium':                    'Medium',
    'moderate':                  'Medium',
    'high':                      'High',
    'significant':               'High',
  },
  communication_frequency: {
    'monthly':                   'Monthly',
    'every month':               'Monthly',
    'quarterly':                 'Quarterly',
    'every quarter':             'Quarterly',
    'semi-annual':               'Semi-Annual',
    'semi annual':               'Semi-Annual',
    'semiannual':                'Semi-Annual',
    'twice a year':              'Semi-Annual',
    'every 6 months':            'Semi-Annual',
    'annual':                    'Annually',
    'annually':                  'Annually',
    'yearly':                    'Annually',
    'once a year':               'Annually',
    'as needed':                 'As Needed',
    'as required':               'As Needed',
    'on demand':                 'As Needed',
  },
  status: {
    'active':                    'Active',
    'client':                    'Active',
    'current':                   'Active',
    'prospect':                  'Prospect',
    'lead':                      'Prospect',
    'potential':                 'Prospect',
    'inactive':                  'Inactive',
    'former':                    'Inactive',
    'churned':                   'Inactive',
    'lost':                      'Inactive',
  },
};

function normalizeVocab(field, value) {
  if (!value || !value.trim()) return value;
  const map = VOCAB_MAP[field];
  if (!map) return value;
  const key = value.trim().toLowerCase();
  return map[key] || value; // return original if no match — import as-is
}

function getCadenceColor(client, futureMeetingClientIds, t) {
  if (client.status !== 'Active' || !client.next_review_date) return t.ACCENT;
  if (futureMeetingClientIds.has(client.id)) return t.ACCENT;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const review = new Date(client.next_review_date + 'T00:00:00');
  const daysUntil = Math.round((review - today) / 86400000);
  if (daysUntil < 0)                return COLOR_ERROR;
  if (daysUntil <= CADENCE_AMBER_DAYS) return COLOR_WARNING;
  return t.ACCENT;
}

function getCadenceTooltip(client, futureMeetingClientIds) {
  if (client.status !== 'Active' || !client.next_review_date) return null;
  if (futureMeetingClientIds.has(client.id)) return 'Review meeting scheduled';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const review = new Date(client.next_review_date + 'T00:00:00');
  const days = Math.round((review - today) / 86400000);
  if (days < 0)   return `Review overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0)  return 'Review due today';
  return `Review due in ${days} day${days === 1 ? '' : 's'}`;
}

function getCadenceInitialForm(client) {
  const freq = client.communication_frequency;
  const days = COMMUNICATION_FREQUENCY_DAYS[freq] ?? 90;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let suggested = new Date(today);
  if (client.next_review_date) {
    const review = new Date(client.next_review_date + 'T00:00:00');
    suggested = review > today ? review : new Date(today.getTime() + (days || 90) * 86400000);
  } else {
    suggested.setDate(suggested.getDate() + (days || 90));
  }
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${suggested.getFullYear()}-${pad(suggested.getMonth()+1)}-${pad(suggested.getDate())}`;
  let category = 'Quarterly Check-in';
  if (['Annual', 'Annually'].includes(freq)) category = 'Annual Review';
  return { category, meeting_type: 'video', status: 'scheduled', scheduled_date: dateStr, scheduled_time: '12:00', duration_mins: 60, description: '', recurrence: 'none', meeting_link: '' };
}

// ── Asset sort helper ─────────────────────────────────────────────────────────

function assetLevelToNum(level) {
  if (!level) return -1;
  const s = level.toLowerCase();
  if (s.startsWith('under')) return 0;
  if (s.includes('10m+') || s === '$10m+') return 10_000_000;
  const match = s.match(/\$([\d.]+)(k|m)/);
  if (!match) return -1;
  const num = parseFloat(match[1]);
  const unit = match[2];
  return unit === 'k' ? num * 1_000 : num * 1_000_000;
}

// ── Sort helper ───────────────────────────────────────────────────────────────

function sortClients(list, sortConfig, advisorMap) {
  const { col, dir } = sortConfig;
  const f = dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    let av, bv;
    switch (col) {
      case 'name':
        av = `${a.last_name} ${a.first_name}`.toLowerCase();
        bv = `${b.last_name} ${b.first_name}`.toLowerCase();
        break;
      case 'assets':
        return (assetLevelToNum(a.asset_level) - assetLevelToNum(b.asset_level)) * f;
      case 'risk':    av = a.risk_tolerance || '';  bv = b.risk_tolerance || '';  break;
      case 'status':  av = a.status || '';           bv = b.status || '';           break;
      case 'advisor': av = advisorMap[a.id] || '';   bv = advisorMap[b.id] || '';   break;
      case 'review':
        if (!a.next_review_date && !b.next_review_date) return 0;
        if (!a.next_review_date) return 1;
        if (!b.next_review_date) return -1;
        av = a.next_review_date; bv = b.next_review_date; break;
      default: return 0;
    }
    if (av < bv) return -1 * f;
    if (av > bv) return 1 * f;
    return 0;
  });
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Clients() {
  const t = useTokens();
  const { orgId, userId, isAdmin: orgIsAdmin, isPlatformAdmin } = useOrg();
  const windowWidth = useWindowWidth();
  const isCompact = windowWidth < 1050;
  const isMobile  = windowWidth < MOBILE_BREAKPOINT;

  // Data
  const [clients,                setClients]                = useState([]);
  const [futureMeetingClientIds, setFutureMeetingClientIds] = useState(new Set());
  const [loading,                setLoading]                = useState(true);
  const [orgMembers,             setOrgMembers]             = useState([]);
  const [primaryAdvisorMap,      setPrimaryAdvisorMap]      = useState({});
  const [advisorMapLoaded,       setAdvisorMapLoaded]       = useState(false);
  const [userRole,               setUserRole]               = useState(null);

  // New client modal
  const [showModal,       setShowModal]       = useState(false);
  const [modalTab,        setModalTab]        = useState('manual');
  const [formData,        setFormData]        = useState(emptyForm);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState('');

  // CSV import state
  const [csvStep,      setCsvStep]      = useState('upload');
  const [csvHeaders,   setCsvHeaders]   = useState([]);
  const [csvRows,      setCsvRows]      = useState([]);
  const [columnMap,    setColumnMap]    = useState({});
  const [importing,    setImporting]    = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Cadence meeting modal
  const [cadenceClient, setCadenceClient] = useState(null);

  // Table controls
  const [search,        setSearch]        = useState('');
  const [sortConfig,    setSortConfig]    = useState({ col: 'name', dir: 'asc' });
  const [filterStatus,  setFilterStatus]  = useState([]);
  const [filterAdvisor, setFilterAdvisor] = useState([]);
  const [filterAssets,  setFilterAssets]  = useState([]);
  const [filterRisk,    setFilterRisk]    = useState([]);
  const [openDropdown,  setOpenDropdown]  = useState(null);
  const headerRef = useRef(null);

  const canSeeAdvisor   = FULL_ACCESS_ROLES.includes(userRole);
  const isAdmin         = orgIsAdmin || isPlatformAdmin;
  const canCreateClient = isAdmin || BRIEF_ROLES.includes(userRole); // admin, manager, advisor — not associate

  // Close column dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (orgId) { fetchClients(); fetchOrgMembers(); }
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchOrgMembers() {
    const { data } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    setOrgMembers(data || []);
    const { data: { user } } = await supabase.auth.getUser();
    const me = (data || []).find(m => m.user_id === user?.id);
    setUserRole(me?.role || null);
  }

  async function fetchPrimaryAdvisors(clientIds) {
    if (!clientIds.length) return;
    const { data } = await supabase.from('client_advisors').select('client_id, user_id').in('client_id', clientIds).eq('is_primary', true);
    if (!data) return;
    const members = await supabase.rpc('get_org_members', { target_org_id: orgId });
    const memberMap = Object.fromEntries((members.data || []).map(m => [m.user_id, m]));
    const map = {};
    data.forEach(row => {
      const m = memberMap[row.user_id];
      map[row.client_id] = m ? `${m.first_name} ${m.last_name}` : null;
    });
    setPrimaryAdvisorMap(map);
    setAdvisorMapLoaded(true);
  }

  async function fetchClients() {
    setLoading(true);
    const [{ data, error: fetchErr }, { data: futureMtgs }] = await Promise.all([
      supabase.from('clients').select('*').eq('org_id', orgId).is('deleted_at', null).order('last_name', { ascending: true }),
      supabase.from('meetings').select('client_id').eq('org_id', orgId).is('deleted_at', null).gte('scheduled_at', new Date().toISOString()),
    ]);
    if (fetchErr) console.error('Error fetching clients:', fetchErr);
    else {
      setClients(data || []);
      setFutureMeetingClientIds(new Set((futureMtgs || []).map(m => m.client_id)));
      await fetchPrimaryAdvisors((data || []).map(c => c.id));
    }
    setLoading(false);
  }

  // ── Manual add ───────────────────────────────────────────────────────────────

  async function handleAddClient() {
    if (!formData.first_name || !formData.last_name) { setError('First and last name are required.'); return; }
    if (!formData.date_of_birth) { setError('Date of birth is required.'); return; }
    setSaving(true); setError('');
    const { data: existing } = await supabase.from('clients').select('id').eq('org_id', orgId).eq('first_name', formData.first_name.trim()).eq('last_name', formData.last_name.trim()).eq('date_of_birth', formData.date_of_birth).is('deleted_at', null).limit(1);
    if (existing && existing.length > 0) {
      setError(`A client named ${formData.first_name} ${formData.last_name} with that date of birth already exists.`);
      setSaving(false); return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: membersNow } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    const meNow   = (membersNow || []).find(m => m.user_id === user?.id);
    const roleNow = meNow?.role || null;
    const advisorToAssign = selectedAdvisor || (['advisor', 'associate'].includes(roleNow) ? user?.id : null);
    const nv = v => v === '' ? null : v;
    const { error: rpcErr } = await supabase.rpc('create_client_with_advisor', {
      p_org_id: orgId, p_first_name: formData.first_name, p_last_name: formData.last_name,
      p_email: nv(formData.email), p_phone: nv(formData.phone), p_date_of_birth: nv(formData.date_of_birth),
      p_status: nv(formData.status), p_asset_level: nv(formData.asset_level), p_risk_tolerance: nv(formData.risk_tolerance),
      p_investment_objective: nv(formData.investment_objective), p_time_horizon: nv(formData.time_horizon),
      p_tax_bracket: nv(formData.tax_bracket), p_liquidity_needs: nv(formData.liquidity_needs),
      p_referral_source: nv(formData.referral_source), p_client_since: nv(formData.client_since),
      p_next_review_date: nv(formData.next_review_date), p_preferred_contact_method: nv(formData.preferred_contact_method),
      p_communication_frequency: nv(formData.communication_frequency), p_notes: nv(formData.notes),
      p_advisor_user_id: advisorToAssign || null, p_pipeline_stage: formData.pipeline_stage || 'Lead',
    });
    if (rpcErr) { setError('Something went wrong. Please try again.'); console.error(rpcErr); }
    else { closeModal(); fetchClients(); }
    setSaving(false);
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  // ── CSV import ───────────────────────────────────────────────────────────────

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    parseCsvFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) parseCsvFile(file);
  }

  function parseCsvFile(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields || [];
        setCsvHeaders(headers);
        setCsvRows(result.data);
        setColumnMap(autoDetectMapping(headers));
        setCsvStep('map');
      },
      error: () => setError('Could not parse CSV. Please check the file format.'),
    });
  }

  function getMappedRows() {
    const dateFields  = ['date_of_birth', 'client_since', 'next_review_date'];
    const vocabFields = ['risk_tolerance', 'investment_objective', 'time_horizon', 'liquidity_needs', 'communication_frequency', 'status'];
    return csvRows.map(row => {
      const mapped = {};
      Object.entries(columnMap).forEach(([csvHeader, field]) => {
        if (field && field !== '__skip__') {
          let val = row[csvHeader] || '';
          if (dateFields.includes(field))  val = normalizeDate(val);
          if (vocabFields.includes(field)) val = normalizeVocab(field, val);
          mapped[field] = val;
        }
      });
      return mapped;
    });
  }

  function getPreviewValidation(mappedRows) {
    return mappedRows.map(row => {
      const errs = [];
      if (!row.first_name?.trim()) errs.push('Missing first name');
      if (!row.last_name?.trim())  errs.push('Missing last name');
      if (!row.date_of_birth?.trim()) errs.push('Missing date of birth');
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizeDate(row.date_of_birth.trim()))) errs.push('Invalid date (use MM-DD-YYYY)');
      return errs;
    });
  }

  async function handleImport() {
    setImporting(true);
    const rows = getMappedRows();

    // Fetch existing clients for dedup
    const { data: existing } = await supabase
      .from('clients')
      .select('first_name, last_name, date_of_birth')
      .eq('org_id', orgId)
      .is('deleted_at', null);

    const existingSet = new Set(
      (existing || []).map(c =>
        `${c.first_name?.toLowerCase()}|${c.last_name?.toLowerCase()}|${c.date_of_birth || ''}`
      )
    );

    const toInsert = [];
    const skippedList = [];
    const errors = [];

    rows.forEach((row, idx) => {
      const rowNum    = idx + 1;
      const firstName = row.first_name?.trim() || '';
      const lastName  = row.last_name?.trim()  || '';
      const dob       = row.date_of_birth?.trim() || '';
      const name      = `${firstName || '?'} ${lastName || '?'}`;

      if (!firstName) { errors.push({ row: rowNum, name, reason: 'Missing first name'     }); return; }
      if (!lastName)  { errors.push({ row: rowNum, name, reason: 'Missing last name'      }); return; }
      if (!dob)       { errors.push({ row: rowNum, name, reason: 'Missing date of birth'  }); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        errors.push({ row: rowNum, name, reason: `Invalid date format "${dob}" — use YYYY-MM-DD` });
        return;
      }

      const key = `${firstName.toLowerCase()}|${lastName.toLowerCase()}|${dob}`;
      if (existingSet.has(key)) { skippedList.push({ row: rowNum, name }); return; }

      const nv = v => (!v || v.trim() === '') ? null : v.trim();
      toInsert.push({
        org_id:                  orgId,
        first_name:              firstName,
        last_name:               lastName,
        date_of_birth:           dob,
        email:                   nv(row.email),
        phone:                   nv(row.phone),
        status:                  nv(row.status) || 'Prospect',
        asset_level:             nv(row.asset_level),
        risk_tolerance:          nv(row.risk_tolerance),
        investment_objective:    nv(row.investment_objective),
        time_horizon:            nv(row.time_horizon),
        tax_bracket:             nv(row.tax_bracket),
        liquidity_needs:         nv(row.liquidity_needs),
        communication_frequency: nv(row.communication_frequency),
        referral_source:         nv(row.referral_source),
        client_since:            nv(row.client_since),
        next_review_date:        nv(row.next_review_date),
        notes:                   nv(row.notes),
        pipeline_stage:          'Lead',
      });
    });

    // Batch insert in groups of 50
    let importedCount = 0;
    for (let i = 0; i < toInsert.length; i += 50) {
      const batch = toInsert.slice(i, i + 50);
      const { data: inserted, error: insertErr } = await supabase
        .from('clients')
        .insert(batch)
        .select('id');

      if (insertErr) {
        batch.forEach((row, bIdx) => {
          errors.push({ row: i + bIdx + 1, name: `${row.first_name} ${row.last_name}`, reason: insertErr.message });
        });
      } else {
        importedCount += inserted?.length || 0;
      }
    }

    setImportResult({ imported: importedCount, skipped: skippedList.length, skippedList, errors });
    setCsvStep('result');
    fetchClients();
    setImporting(false);
  }

  function resetCsv() {
    setCsvStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMap({});
    setImportResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function closeModal() {
    setShowModal(false);
    setModalTab('manual');
    setFormData(emptyForm);
    setSelectedAdvisor('');
    setError('');
    resetCsv();
  }

  // ── Table helpers ────────────────────────────────────────────────────────────

  function handleSortToggle(col) {
    setSortConfig(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' });
  }

  function toggleFilterStatus(val)  { setFilterStatus(prev  => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }
  function toggleFilterAdvisor(val) { setFilterAdvisor(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }
  function toggleFilterAssets(val)  { setFilterAssets(prev  => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }
  function toggleFilterRisk(val)    { setFilterRisk(prev    => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }

  const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  let displayClients = clients;
  if (search)              displayClients = displayClients.filter(c => `${c.first_name} ${c.last_name} ${c.email || ''}`.toLowerCase().includes(search.toLowerCase()));
  if (filterStatus.length  > 0) displayClients = displayClients.filter(c => filterStatus.includes(c.status));
  if (filterAdvisor.length > 0) displayClients = displayClients.filter(c => filterAdvisor.includes(primaryAdvisorMap[c.id] || 'Unassigned'));
  if (filterAssets.length  > 0) displayClients = displayClients.filter(c => filterAssets.includes(c.asset_level || '—'));
  if (filterRisk.length    > 0) displayClients = displayClients.filter(c => filterRisk.includes(c.risk_tolerance || '—'));
  displayClients = sortClients(displayClients, sortConfig, primaryAdvisorMap);

  const assetOptions   = [...new Set(clients.map(c => c.asset_level).filter(Boolean))].sort((a, b) => assetLevelToNum(a) - assetLevelToNum(b));
  const riskOptions    = [...new Set(clients.map(c => c.risk_tolerance).filter(Boolean))].sort();
  const advisorOptions = advisorMapLoaded ? [...new Set(clients.map(c => primaryAdvisorMap[c.id] || 'Unassigned'))].sort() : [];

  const cols = isMobile  ? '20px 1fr 80px'
             : isCompact ? '20px 1fr 90px 140px'
             : '20px 1fr 130px 160px 90px 150px 120px';

  // ── Styles ───────────────────────────────────────────────────────────────────

  const s = {
    ...pageStyles(t, isMobile),
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0', marginBottom: '28px' },
    addButton: { background: 'transparent', color: t.ACCENT, border: `1px solid ${t.ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '10px 20px', fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
    searchInput: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '9px 14px', fontSize: '14px', width: isMobile ? '100%' : '280px', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box' },
    tableWrap: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, overflow: 'hidden', boxShadow: SHADOW_MD },
    tableHead: { display: 'grid', gridTemplateColumns: cols, padding: '10px 20px', background: t.SURFACE_ALT, borderBottom: `1px solid ${t.BORDER}`, gap: '8px', alignItems: 'center' },
    tableRow: { display: 'grid', gridTemplateColumns: cols, padding: '14px 20px', borderBottom: `1px solid ${t.BORDER}`, background: t.SURFACE, alignItems: 'center', gap: '8px' },
    emptyState: { padding: '48px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '15px', fontWeight: FW_LIGHT },
    emptyLink: { color: t.ACCENT, cursor: 'pointer', textDecoration: 'underline' },
    overlay: { position: 'fixed', inset: 0, background: OVERLAY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: csvStep === 'preview' ? '900px' : '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: SHADOW_LG, transition: 'max-width 0.2s ease' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${t.BORDER}` },
    modalTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em' },
    closeButton: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '4px 8px' },
    tabRow: { display: 'flex', borderBottom: `1px solid ${t.BORDER}`, padding: '0 24px' },
    tab: (active) => ({ padding: '10px 16px', fontSize: '13px', fontWeight: active ? FW_MEDIUM : FW_REGULAR, color: active ? t.TEXT : t.TEXT_MUTED, background: 'none', border: 'none', borderBottom: `2px solid ${active ? t.ACCENT : 'transparent'}`, cursor: 'pointer', fontFamily: FONT_BODY, marginBottom: '-1px' }),
    modalBody: { overflowY: 'auto', padding: '24px', flex: 1, background: t.SURFACE },
    sectionLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.ACCENT, margin: '20px 0 12px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '12px', fontWeight: FW_MEDIUM, color: t.TEXT_MUTED, letterSpacing: '0.02em' },
    input: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 12px', fontSize: '14px', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY },
    textarea: { width: '100%', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px 12px', fontSize: '14px', minHeight: '80px', resize: 'vertical', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box' },
    errorText: { color: COLOR_ERROR, fontSize: '13px', marginTop: '12px' },
    modalFooter: { padding: '16px 24px', borderTop: `1px solid ${t.BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', background: t.SURFACE },
    cancelButton: { padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '14px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    saveButton: { padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
  };

  // ── CSV UI helpers ────────────────────────────────────────────────────────────

  const mappedRows    = csvStep === 'preview' || csvStep === 'result' ? getMappedRows() : [];
  const validations   = csvStep === 'preview' ? getPreviewValidation(mappedRows) : [];
  const hasValidationErrors = validations.some(v => v.length > 0);
  const requiredMapped = ['first_name', 'last_name', 'date_of_birth'].every(req =>
    Object.values(columnMap).includes(req)
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        <div style={s.header}>
          <div>
            <h1 style={s.title}>Clients</h1>
            <p style={s.subtitle}>{clients.length} total · {clients.filter(c => c.status === 'Active').length} active</p>
          </div>
          {canCreateClient && <button style={s.addButton} onClick={() => setShowModal(true)}>+ New Client</button>}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input style={s.searchInput} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.emptyState}>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div style={s.emptyState}>No clients found. {canCreateClient && <span style={s.emptyLink} onClick={() => setShowModal(true)}>Add your first client →</span>}</div>
        ) : (
          <div style={s.tableWrap}>
            <div style={s.tableHead} ref={headerRef}>
              <div />
              <ColumnHeader col="name" label="Name" sortConfig={sortConfig} onSortToggle={handleSortToggle} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />
              {!isMobile && !isCompact && <ColumnHeader col="assets" label="Assets" sortConfig={sortConfig} onSortToggle={handleSortToggle} filterType="checkbox" filterOptions={assetOptions} filterValues={filterAssets} onToggleFilter={toggleFilterAssets} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />}
              {!isMobile && !isCompact && <ColumnHeader col="risk"   label="Risk"   sortConfig={sortConfig} onSortToggle={handleSortToggle} filterType="checkbox" filterOptions={riskOptions}  filterValues={filterRisk}   onToggleFilter={toggleFilterRisk}   openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />}
              <ColumnHeader col="status" label="Status" sortConfig={sortConfig} onSortToggle={handleSortToggle} filterType="checkbox" filterOptions={['Active', 'Prospect', 'Inactive']} filterValues={filterStatus} onToggleFilter={toggleFilterStatus} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />
              {!isMobile && canSeeAdvisor && <ColumnHeader col="advisor" label="Advisor" sortConfig={sortConfig} onSortToggle={handleSortToggle} filterType="checkbox" filterOptions={advisorOptions} filterValues={filterAdvisor} onToggleFilter={toggleFilterAdvisor} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />}
              {!isMobile && !isCompact && <ColumnHeader col="review" label="Next Review" sortConfig={sortConfig} onSortToggle={handleSortToggle} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />}
            </div>

            {displayClients.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px', fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
                No clients match your current filters.
              </div>
            ) : displayClients.map((client, i) => {
              const cadenceColor   = getCadenceColor(client, futureMeetingClientIds, t);
              const cadenceTooltip = getCadenceTooltip(client, futureMeetingClientIds);
              const isLast         = i === displayClients.length - 1;
              const statusColor    = STATUS_TEXT_COLORS[client.status] || t.TEXT_MUTED;
              return (
                <div key={client.id} className="client-row" style={{ ...s.tableRow, borderBottom: isLast ? 'none' : `1px solid ${t.BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button title={cadenceTooltip || 'Schedule meeting'} onClick={() => setCadenceClient(client)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cadenceColor, display: 'block' }} />
                    </button>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/hq/clients/${client.id}`} state={{ from: '/hq/clients' }} className="client-name-link" style={{ textDecoration: 'none' }}>
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: '16px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {client.first_name} {client.last_name}
                      </span>
                    </Link>
                  </div>
                  {!isMobile && !isCompact && <span style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.asset_level || '—'}</span>}
                  {!isMobile && !isCompact && <span style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.risk_tolerance || '—'}</span>}
                  <span style={{ fontSize: '13px', fontWeight: FW_MEDIUM, color: statusColor, whiteSpace: 'nowrap' }}>{client.status || '—'}</span>
                  {!isMobile && canSeeAdvisor && <span style={{ fontSize: '13px', color: advisorMapLoaded ? (primaryAdvisorMap[client.id] ? t.TEXT : t.TEXT_SUBTLE) : t.TEXT_SUBTLE, fontWeight: FW_LIGHT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: advisorMapLoaded && !primaryAdvisorMap[client.id] ? 'italic' : 'normal' }}>{advisorMapLoaded ? (primaryAdvisorMap[client.id] || 'Unassigned') : '—'}</span>}
                  {!isMobile && !isCompact && <span style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, whiteSpace: 'nowrap' }}>{client.next_review_date && client.next_review_date >= todayStr ? new Date(client.next_review_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>}
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
          .client-row:hover { background: ${t.SURFACE_ALT} !important; }
          .client-name-link:hover span { color: ${t.ACCENT} !important; }
          .client-name-link span { transition: color 0.15s; }
          .csv-drop:hover { border-color: ${t.ACCENT} !important; }
        `}</style>

        {/* ── Cadence Meeting Modal ─────────────────────────────────────────── */}
        <MeetingModal
          isOpen={!!cadenceClient}
          onClose={() => setCadenceClient(null)}
          onSaved={() => { fetchClients(); setCadenceClient(null); }}
          editingMeeting={null}
          orgId={orgId}
          userId={userId}
          clientId={cadenceClient?.id}
          initialForm={cadenceClient ? getCadenceInitialForm(cadenceClient) : null}
          isMobile={isMobile}
        />

        {/* ── New Client Modal ──────────────────────────────────────────────── */}
        {showModal && (
          <div style={s.overlay}>
            <div style={s.modal}>

              {/* Header */}
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>New Client</h2>
                <button style={s.closeButton} onClick={closeModal}>✕</button>
              </div>

              {/* Tab row */}
              <div style={s.tabRow}>
                <button style={s.tab(modalTab === 'manual')} onClick={() => { setModalTab('manual'); setError(''); }}>Manual Entry</button>
                <button style={s.tab(modalTab === 'csv')}    onClick={() => { setModalTab('csv');    setError(''); }}>CSV Import</button>
              </div>

              {/* ── Manual Entry tab ───────────────────────────────────────── */}
              {modalTab === 'manual' && (
                <>
                  <div style={s.modalBody}>
                    <p style={s.sectionLabel}>Core Identity</p>
                    <div style={s.formGrid}>
                      <FormField label="First Name *"    name="first_name"    value={formData.first_name}    onChange={handleChange} s={s} />
                      <FormField label="Last Name *"     name="last_name"     value={formData.last_name}     onChange={handleChange} s={s} />
                      <FormField label="Email"           name="email"         type="email" value={formData.email} onChange={handleChange} s={s} />
                      <FormField label="Phone"           name="phone"         value={formData.phone}         onChange={handleChange} s={s} />
                      <FormField label="Date of Birth *" name="date_of_birth" type="date"  value={formData.date_of_birth} onChange={handleChange} s={s} />
                      <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} s={s} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>Pipeline Stage</label>
                        <select name="pipeline_stage" value={formData.pipeline_stage} onChange={handleChange} style={s.input}>
                          {PIPELINE_STAGES.filter(st => st.key !== 'Active').map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <p style={s.sectionLabel}>Financial Profile</p>
                    <div style={s.formGrid}>
                      <SelectField label="Asset Level"          name="asset_level"          value={formData.asset_level}          onChange={handleChange} options={ASSET_LEVEL_OPTIONS}          s={s} />
                      <SelectField label="Risk Tolerance"       name="risk_tolerance"        value={formData.risk_tolerance}        onChange={handleChange} options={RISK_TOLERANCE_OPTIONS}       s={s} />
                      <SelectField label="Investment Objective" name="investment_objective"  value={formData.investment_objective}  onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} s={s} />
                      <SelectField label="Time Horizon"         name="time_horizon"          value={formData.time_horizon}          onChange={handleChange} options={TIME_HORIZON_OPTIONS}         s={s} />
                      <SelectField label="Tax Bracket"          name="tax_bracket"           value={formData.tax_bracket}           onChange={handleChange} options={TAX_BRACKET_OPTIONS}          s={s} />
                      <SelectField label="Liquidity Needs"      name="liquidity_needs"       value={formData.liquidity_needs}       onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS}      s={s} />
                    </div>
                    <p style={s.sectionLabel}>Relationship Management</p>
                    <div style={s.formGrid}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>Advisor</label>
                        <select value={selectedAdvisor} onChange={e => setSelectedAdvisor(e.target.value)} style={s.input}>
                          <option value=''>— Select advisor —</option>
                          {orgMembers.filter(m => m.first_name && m.last_name).map(m => <option key={m.user_id} value={m.user_id}>{m.first_name} {m.last_name}</option>)}
                        </select>
                      </div>
                      <SelectField label="Referral Source"         name="referral_source"          value={formData.referral_source}          onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS}         s={s} />
                      <FormField   label="Client Since"            name="client_since"             type="date" value={formData.client_since}     onChange={handleChange} s={s} />
                      <FormField   label="Next Review Date"        name="next_review_date"         type="date" value={formData.next_review_date} onChange={handleChange} s={s} />
                      <SelectField label="Preferred Contact"       name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange} options={CONTACT_METHOD_OPTIONS}           s={s} />
                      <SelectField label="Communication Frequency" name="communication_frequency"  value={formData.communication_frequency}  onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS}  s={s} />
                    </div>
                    <p style={s.sectionLabel}>Notes</p>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional context about this client..." style={s.textarea} />
                    {error && <p style={s.errorText}>{error}</p>}
                  </div>
                  <p style={{ fontSize: '11px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, margin: '8px 0 0', padding: '0 24px' }}>* Required field</p>
                  <div style={s.modalFooter}>
                    <button style={s.cancelButton} onClick={closeModal}>Cancel</button>
                    <button style={s.saveButton} onClick={handleAddClient} disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button>
                  </div>
                </>
              )}

              {/* ── CSV Import tab ─────────────────────────────────────────── */}
              {modalTab === 'csv' && (
                <>
                  <div style={s.modalBody}>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                      {['upload', 'map', 'preview', 'result'].map((step, i) => {
                        const labels = ['Upload', 'Map', 'Preview', 'Result'];
                        const stepOrder = ['upload', 'map', 'preview', 'result'];
                        const currentIdx = stepOrder.indexOf(csvStep);
                        const thisIdx    = stepOrder.indexOf(step);
                        const isDone     = thisIdx < currentIdx;
                        const isNow      = step === csvStep;
                        return (
                          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: isNow ? t.ACCENT : isDone ? t.ACCENT_MUTED : t.SURFACE_ALT, border: `1px solid ${isNow || isDone ? t.ACCENT_BORDER : t.BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: FW_SEMIBOLD, color: isNow ? t.SURFACE : t.ACCENT, fontFamily: FONT_BODY }}>
                                {isDone ? '✓' : i + 1}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: isNow ? FW_MEDIUM : FW_LIGHT, color: isNow ? t.TEXT : t.TEXT_MUTED, fontFamily: FONT_BODY }}>{labels[i]}</span>
                            </div>
                            {i < 3 && <span style={{ fontSize: '12px', color: t.BORDER }}>›</span>}
                          </div>
                        );
                      })}
                    </div>

                    {error && <p style={{ color: COLOR_ERROR, fontSize: '13px', margin: '0 0 16px' }}>{error}</p>}

                    {/* ── Step 1: Upload ──────────────────────────────────── */}
                    {csvStep === 'upload' && (
                      <div>
                        <p style={{ fontSize: '14px', color: t.TEXT, fontWeight: FW_LIGHT, lineHeight: '1.6', margin: '0 0 20px' }}>
                          Upload a CSV file with your client data. Dates should be in <strong>MM-DD-YYYY</strong> format. Required fields: first name, last name, date of birth.
                        </p>
                        <button
                          onClick={downloadTemplate}
                          style={{ background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 16px', fontSize: '13px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY, marginBottom: '20px' }}
                        >
                          ↓ Download Template CSV
                        </button>
                        <div
                          className="csv-drop"
                          onDrop={handleDrop}
                          onDragOver={e => e.preventDefault()}
                          onClick={() => fileInputRef.current?.click()}
                          style={{ border: `2px dashed ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        >
                          <p style={{ fontSize: '15px', color: t.TEXT, fontWeight: FW_REGULAR, margin: '0 0 6px' }}>Drop CSV here or click to browse</p>
                          <p style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, margin: 0 }}>Supports exports from Wealthbox, Redtail, Salesforce, or any spreadsheet</p>
                          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>
                      </div>
                    )}

                    {/* ── Step 2: Map columns ─────────────────────────────── */}
                    {csvStep === 'map' && (
                      <div>
                        <p style={{ fontSize: '14px', color: t.TEXT, fontWeight: FW_LIGHT, margin: '0 0 16px' }}>
                          Match your CSV columns to Allez HQ fields. Required fields are highlighted. Columns set to "Skip" will not be imported.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {csvHeaders.map(header => {
                            const mapped   = columnMap[header] || '__skip__';
                            const isReq    = ['first_name', 'last_name', 'date_of_birth'].includes(mapped);
                            const isMapped = mapped !== '__skip__';
                            return (
                              <div key={header} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', alignItems: 'center', gap: '12px', padding: '10px 12px', background: t.SURFACE_ALT, borderRadius: RADIUS_MD, border: `1px solid ${isReq ? t.ACCENT_BORDER : t.BORDER}` }}>
                                <div>
                                  <p style={{ margin: 0, fontSize: '13px', color: t.TEXT, fontWeight: FW_REGULAR, fontFamily: FONT_BODY }}>{header}</p>
                                  {csvRows[0]?.[header] && <p style={{ margin: '2px 0 0', fontSize: '11px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>e.g. {csvRows[0][header]}</p>}
                                </div>
                                <span style={{ fontSize: '14px', color: isMapped ? t.ACCENT : t.BORDER, textAlign: 'center' }}>→</span>
                                <select
                                  value={mapped}
                                  onChange={e => setColumnMap(prev => ({ ...prev, [header]: e.target.value }))}
                                  style={{ ...s.input, fontSize: '13px', padding: '6px 10px', color: isMapped ? t.TEXT : t.TEXT_MUTED }}
                                >
                                  <option value="__skip__">— Skip —</option>
                                  {IMPORT_FIELDS.map(f => (
                                    <option key={f.key} value={f.key}>{f.label}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                        {!requiredMapped && (
                          <p style={{ color: COLOR_ERROR, fontSize: '13px', margin: '16px 0 0' }}>
                            Required fields not yet mapped: {['first_name', 'last_name', 'date_of_birth'].filter(req => !Object.values(columnMap).includes(req)).map(k => IMPORT_FIELDS.find(f => f.key === k)?.label).join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Step 3: Preview ─────────────────────────────────── */}
                    {csvStep === 'preview' && (
                      <div>
                        <p style={{ fontSize: '14px', color: t.TEXT, fontWeight: FW_LIGHT, margin: '0 0 4px' }}>
                          {csvRows.length} row{csvRows.length === 1 ? '' : 's'} ready to import.
                          {hasValidationErrors && <span style={{ color: COLOR_ERROR }}> Some rows have errors and will be skipped.</span>}
                        </p>
                        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '50vh', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, marginTop: '12px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, fontSize: '12px' }}>
                            <thead>
                              <tr style={{ background: t.SURFACE_ALT, position: 'sticky', top: 0 }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left', color: t.TEXT_MUTED, fontWeight: FW_SEMIBOLD, borderBottom: `1px solid ${t.BORDER}`, whiteSpace: 'nowrap' }}>#</th>
                                {IMPORT_FIELDS.filter(f => Object.values(columnMap).includes(f.key)).map(f => (
                                  <th key={f.key} style={{ padding: '8px 12px', textAlign: 'left', color: f.required ? t.ACCENT : t.TEXT_MUTED, fontWeight: FW_SEMIBOLD, borderBottom: `1px solid ${t.BORDER}`, whiteSpace: 'nowrap' }}>{f.label}</th>
                                ))}
                                <th style={{ padding: '8px 12px', textAlign: 'left', color: t.TEXT_MUTED, fontWeight: FW_SEMIBOLD, borderBottom: `1px solid ${t.BORDER}`, whiteSpace: 'nowrap' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mappedRows.map((row, i) => {
                                const rowErrors = validations[i] || [];
                                const hasErr    = rowErrors.length > 0;
                                return (
                                  <tr key={i} style={{ background: hasErr ? `${COLOR_ERROR}11` : t.SURFACE, borderBottom: `1px solid ${t.BORDER}` }}>
                                    <td style={{ padding: '8px 12px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT }}>{i + 1}</td>
                                    {IMPORT_FIELDS.filter(f => Object.values(columnMap).includes(f.key)).map(f => (
                                      <td key={f.key} style={{ padding: '8px 12px', color: t.TEXT, fontWeight: FW_LIGHT, whiteSpace: 'nowrap', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {row[f.key] || <span style={{ color: t.TEXT_SUBTLE, fontStyle: 'italic' }}>—</span>}
                                      </td>
                                    ))}
                                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                      {hasErr
                                        ? <span style={{ color: COLOR_ERROR, fontSize: '11px' }}>{rowErrors.join(', ')}</span>
                                        : <span style={{ color: t.ACCENT, fontSize: '11px' }}>✓ Ready</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ── Step 4: Result ──────────────────────────────────── */}
                    {csvStep === 'result' && importResult && (
                      <div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                          {[
                            { label: 'Imported',  value: importResult.imported, color: t.ACCENT        },
                            { label: 'Skipped',   value: importResult.skipped,  color: t.TEXT_MUTED    },
                            { label: 'Failed',    value: importResult.errors?.length || 0, color: importResult.errors?.length > 0 ? COLOR_ERROR : t.TEXT_MUTED },
                          ].map(stat => (
                            <div key={stat.label} style={{ background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '16px 24px', flex: 1, minWidth: '100px' }}>
                              <p style={{ margin: 0, fontSize: '28px', fontWeight: FW_LIGHT, color: stat.color, fontFamily: FONT_BODY }}>{stat.value}</p>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: t.TEXT_MUTED, fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT_BODY }}>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                        {importResult.skipped > 0 && (
                          <p style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, margin: '0 0 12px' }}>
                            {importResult.skipped} client{importResult.skipped === 1 ? '' : 's'} skipped — already exist in your org (matched on name + date of birth).
                          </p>
                        )}
                        {importResult.errors?.length > 0 && (
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLOR_ERROR, margin: '0 0 8px' }}>Failed rows</p>
                            <div style={{ border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, overflow: 'hidden', maxHeight: '200px', overflowY: 'auto' }}>
                              {importResult.errors.map((err, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '12px', padding: '8px 12px', borderBottom: i < importResult.errors.length - 1 ? `1px solid ${t.BORDER}` : 'none', background: t.SURFACE }}>
                                  <span style={{ fontSize: '12px', color: t.TEXT_MUTED, fontFamily: FONT_BODY }}>#{err.row}</span>
                                  <span style={{ fontSize: '12px', color: t.TEXT, fontFamily: FONT_BODY }}>{err.name}</span>
                                  <span style={{ fontSize: '12px', color: COLOR_ERROR, fontFamily: FONT_BODY }}>{err.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* CSV footer */}
                  <div style={s.modalFooter}>
                    {csvStep === 'upload' && <button style={s.cancelButton} onClick={closeModal}>Cancel</button>}

                    {csvStep === 'map' && (
                      <>
                        <button style={s.cancelButton} onClick={resetCsv}>← Back</button>
                        <button style={{ ...s.saveButton, opacity: requiredMapped ? 1 : 0.5 }} disabled={!requiredMapped} onClick={() => setCsvStep('preview')}>Preview →</button>
                      </>
                    )}

                    {csvStep === 'preview' && (
                      <>
                        <button style={s.cancelButton} onClick={() => setCsvStep('map')}>← Back</button>
                        <button style={s.saveButton} disabled={importing} onClick={handleImport}>
                          {importing ? 'Importing…' : `Import ${csvRows.length} client${csvRows.length === 1 ? '' : 's'}`}
                        </button>
                      </>
                    )}

                    {csvStep === 'result' && (
                      <>
                        {(importResult?.errors?.length > 0) && (
                          <button style={s.cancelButton} onClick={resetCsv}>Import another file</button>
                        )}
                        <button style={s.saveButton} onClick={closeModal}>Done</button>
                      </>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Column header component ───────────────────────────────────────────────────

function ColumnHeader({
  col, label, sortConfig, onSortToggle,
  filterType, filterValue, onFilterChange,
  filterOptions, filterValues, onToggleFilter,
  openDropdown, setOpenDropdown, t,
}) {
  const isActive   = sortConfig.col === col;
  const isOpen     = openDropdown === col;
  const hasFilter  = filterType === 'text' || (filterType === 'checkbox' && filterOptions?.length > 0);
  const isFiltered = filterType === 'text' ? !!filterValue : filterValues?.length > 0;
  const btnRef     = useRef(null);
  const [dropPos,  setDropPos] = useState({ top: 0, left: 0 });

  function handleFilterClick() {
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpenDropdown(isOpen ? null : col);
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? t.ACCENT : t.TEXT_MUTED, fontFamily: FONT_BODY }}>
        {label}
      </span>

      {hasFilter && (
        <>
          <button ref={btnRef} onClick={handleFilterClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', lineHeight: 1 }} title={`Filter by ${label}`}>
            <span style={{ display: 'inline-block', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `6px solid ${isFiltered ? t.ACCENT : t.TEXT_SUBTLE}`, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s ease', flexShrink: 0 }} />
          </button>
          {isOpen && (
            <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, zIndex: 1000, boxShadow: SHADOW_LG, minWidth: '180px', padding: '8px' }}>
              {filterType === 'text' && (
                <input autoFocus placeholder={`Filter ${label.toLowerCase()}…`} value={filterValue} onChange={e => onFilterChange(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '6px 10px', fontSize: '13px', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, outline: 'none' }} />
              )}
              {filterType === 'checkbox' && filterOptions.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', cursor: 'pointer', fontSize: '13px', color: t.TEXT, fontFamily: FONT_BODY }}>
                  <input type="checkbox" checked={filterValues.includes(opt)} onChange={() => onToggleFilter(opt)} style={{ cursor: 'pointer', accentColor: t.ACCENT }} />
                  {opt}
                </label>
              ))}
            </div>
          )}
        </>
      )}

      <button onClick={() => onSortToggle(col)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}>
        <span style={{ fontSize: '12px', color: isActive ? t.ACCENT : t.TEXT_SUBTLE, fontWeight: FW_SEMIBOLD }}>
          {isActive ? (sortConfig.dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </button>
    </div>
  );
}

// ── Form helpers ──────────────────────────────────────────────────────────────

function FormField({ label, name, value, onChange, type = 'text', s }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} style={s.input} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, s }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={s.input}>
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}