// src/components/public/mockups/MockWindow.js
import { FONT_BODY } from '../../../utils/publicConstants';

export default function MockWindow({ children, label }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid rgba(0,0,0,0.10)',
      borderRadius: '12px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      overflow: 'hidden', width: '100%',
    }}>
      <div style={{ background: '#f5f5f3', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        {label && <span style={{ marginLeft: '10px', fontSize: '11px', color: 'rgba(0,0,0,0.35)', fontFamily: FONT_BODY }}>{label}</span>}
      </div>
      {children}
    </div>
  );
}