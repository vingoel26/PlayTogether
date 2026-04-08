import React from 'react';

export default function QueuePanel() {
    return (
        <div style={{
            width: '100%', height: '100%',
            borderLeft: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column', 
            color: 'var(--color-text-on-dark)'
        }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Up Next</h3>
            </div>
            
            <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
                <p style={{ margin: 0, color: 'var(--color-text-on-dark-dim)', fontSize: 13 }}>
                    Queue is empty.
                </p>
            </div>
        </div>
    );
}
