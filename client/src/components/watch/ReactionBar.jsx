export default function ReactionBar() {
    return (
        <div style={{
            height: 64, background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-control-bar)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-on-dark-dim)',
        }}>
            <span>Reactions (Coming Soon)</span>
        </div>
    );
}
