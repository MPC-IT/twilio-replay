import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import styles from '@/styles/ManageUsers.module.css';

interface User {
  id: number;
  name?: string;
  email: string;
  role: 'user' | 'admin';
  isSuspended: boolean;
}

function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setError('Unable to load users');
      });
  }, []);

  const createUser = async () => {
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Failed to create user');
      return;
    }

    const newUser = await res.json();
    setUsers(prev => [...prev, newUser]);
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
  };

  const toggleSuspend = async (id: number, suspended: boolean) => {
    await fetch(`/api/users/${id}/suspend`, { method: 'PATCH' });
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, isSuspended: !suspended } : u))
    );
  };

  const resetPassword = async (id: number) => {
    await fetch(`/api/users/${id}/reset-password`, { method: 'POST' });
    alert('Password reset link sent (mocked).');
  };

  return (
    <div className={styles.container}>
      <div className={styles.newUserForm}>
        <h2>Create New User</h2>
        <input
          className={styles.input}
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <select
          className={styles.select}
          value={role}
          onChange={e => setRole(e.target.value as 'user' | 'admin')}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className={styles.button} onClick={createUser}>Create</button>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      <h2>Existing Users</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name || '—'}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isSuspended ? 'Suspended' : 'Active'}</td>
              <td>
                <button
                  className={styles.button}
                  onClick={() => toggleSuspend(u.id, u.isSuspended)}
                >
                  {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>
                <button
                  className={styles.button}
                  onClick={() => resetPassword(u.id)}
                >
                  Reset Password
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ManageUsersPage.pageTitle = 'Manage Users';
export default withAuth(ManageUsersPage, ['admin']);
