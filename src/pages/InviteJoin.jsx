import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';
import Toast from '../components/Toast';

export default function InviteJoin() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get(`/invites/${token}`)
      .then(res => {
        setInvite(res.data);
        setLoading(false);
      })
      .catch(err => {
        setToast({ type: 'error', title: 'Invalid Invite', message: err.response?.data?.error || 'Invite link is broken or expired.' });
        setLoading(false);
      });
  }, [token]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await API.post('/invites/join', { token });
      setToast({ type: 'success', title: 'Welcome!', message: 'You have successfully joined the team.' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setToast({ type: 'error', title: 'Failed to Join', message: err.response?.data?.error || 'Could not join team.' });
      setJoining(false);
    }
  };

  if (loading) return <div className="auth-page"><LoadingState label="Verifying invite..." /></div>;

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <div className="auth-logo-text">TaskFlow</div>
        </div>

        {invite ? (
          <>
            <h1 className="auth-title">You're Invited!</h1>
            <p className="auth-sub">
              You have been invited to join <strong>{invite.team_name || 'a team'}</strong> 
              {invite.company_name ? ` at ${invite.company_name}` : ''}.
            </p>

            {user ? (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
                  Logged in as <strong>{user.email}</strong>
                </p>
                <button 
                  className="btn-primary" 
                  onClick={handleJoin}
                  disabled={joining}
                >
                  {joining ? 'Joining...' : 'Join Team Now'}
                </button>
                <p style={{ marginTop: 16, fontSize: 12, textAlign: 'center' }}>
                  Not you? <Link to="/login" style={{ color: 'var(--accent2)' }}>Switch account</Link>
                </p>
              </div>
            ) : (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
                  Please sign up or log in to accept this invitation.
                </p>
                <Link 
                  to={`/signup?invite=${token}`} 
                  className="btn-primary" 
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Create Account to Join
                </Link>
                <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
                  Already have an account? <Link to={`/login?redirect=/invite/${token}`} style={{ color: 'var(--accent2)' }}>Log in</Link>
                </p>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 className="auth-title" style={{ color: 'var(--red)' }}>Invalid Invite</h1>
            <p className="auth-sub">This invite link is invalid, expired, or has already been used.</p>
            <Link to="/" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 20 }}>
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
