/**
 * FRONTEND — src/components/ProtectedRoute.jsx
 *
 * Uso en App.jsx o en un router:
 *   <ProtectedRoute session={session} roleRequerido="admin">
 *     <GestionUsuarios />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ session, roleRequerido, children, fallback = null }) {
  if (!session) return fallback

  if (roleRequerido && session.rol !== roleRequerido) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', flexDirection: 'column', gap: 8,
        color: 'var(--color-text-secondary)', fontSize: 14,
      }}>
        <span style={{ fontSize: 32 }}>🔒</span>
        <span>Acceso denegado. Se requiere rol <strong>{roleRequerido}</strong>.</span>
      </div>
    )
  }

  return children
}
