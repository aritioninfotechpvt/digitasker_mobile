import React from 'react';
export const Stat=({label,value,icon,sub})=><div className='stat'><div className='statIcon'>{icon}</div><div><div className='statValue'>{value}</div><div className='muted'>{label}</div>{sub&&<small>{sub}</small>}</div></div>;
export const Badge=({children,tone='purple'})=><span className={`badge ${tone}`}>{children}</span>;
export const Card=({children,className=''})=><div className={`card ${className}`}>{children}</div>;
export const SectionTitle = ({ title, action, onAction, onActionClick }) => (
  <div className='sectionTitle'>
    <h2>{title}</h2>
    {action && <button className='linkBtn' onClick={onAction || onActionClick}>{action}</button>}
  </div>
);
