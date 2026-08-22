import React from 'react';
import logoImg from '../assets/logo.jpg';

export default function LogoBanner({ height = '48px', useVector = true }) {
  if (!useVector) {
    return (
      <img
        src={logoImg}
        alt="STOP & GO Total Tyre Care Centre"
        style={{
          height,
          maxWidth: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8))',
          borderRadius: '4px'
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      userSelect: 'none',
      padding: '4px 8px'
    }}>
      {/* Top Main Logo Row: Brackets + STOP & GO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        lineHeight: 1
      }}>
        {/* Left Industrial Chevron Bracket */}
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
          <path d="M20 4L6 16L20 28H14L0 16L14 4H20Z" fill="#FACC15" />
        </svg>

        {/* STOP & GO Typography */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: '900',
          fontSize: '1.75rem',
          letterSpacing: '1px',
          color: '#FFFFFF'
        }}>
          <span>ST</span>
          
          {/* O with Hexagon Nut */}
          <div style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            border: '4px solid #FFFFFF',
            borderRadius: '50%',
            margin: '0 1px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#FACC15',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }} />
          </div>

          <span>P</span>

          {/* Yellow & Sign Badge */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 3px'
          }}>
            <span style={{ color: '#FACC15', fontSize: '1.2rem', fontWeight: '900', lineHeight: 1 }}>&</span>
            <div style={{ width: '14px', height: '3px', backgroundColor: '#FACC15', marginTop: '2px' }} />
          </div>

          <span>GO</span>
        </div>

        {/* Right Industrial Chevron Bracket */}
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
          <path d="M4 4L18 16L4 28H10L24 16L10 4H4Z" fill="#FACC15" />
        </svg>
      </div>

      {/* Subtitle: TOTAL TYRE CARE CENTRE */}
      <div style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontStyle: 'italic',
        fontWeight: '800',
        fontSize: '0.68rem',
        letterSpacing: '2.5px',
        color: '#FFFFFF',
        marginTop: '5px',
        textTransform: 'uppercase',
        opacity: 0.95
      }}>
        TOTAL TYRE CARE CENTRE
      </div>
    </div>
  );
}
