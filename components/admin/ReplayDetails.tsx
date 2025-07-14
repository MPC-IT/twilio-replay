
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Replay = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  prompts: {
    firstName: string;
    lastName: string;
    company: string;
    phoneNumber: string;
  };
};

export default function ReplayDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/replays/${id}`)
        .then(res => res.json())
        .then(data => {
          setReplay(data);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replay) return;
    const { name, value } = e.target;
    if (name.startsWith("prompts.")) {
      const field = name.split(".")[1];
      setReplay({
        ...replay,
        prompts: { ...replay.prompts, [field]: value }
      });
    } else {
      setReplay({ ...replay, [name]: value });
    }
  };

  const handleSave = async () => {
    await fetch(`/api/replays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replay)
    });
    alert("Saved!");
  };

  if (loading || !replay) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Replay Setup – {replay.title}</h2>
      <label>Start Time: <input name="startTime" type="datetime-local" value={replay.startTime} onChange={handleChange} /></label><br /><br />
      <label>End Time: <input name="endTime" type="datetime-local" value={replay.endTime} onChange={handleChange} /></label><br /><br />

      <h3>Caller Prompts</h3>
      <label>First Name Prompt: <input name="prompts.firstName" value={replay.prompts.firstName} onChange={handleChange} /></label><br />
      <label>Last Name Prompt: <input name="prompts.lastName" value={replay.prompts.lastName} onChange={handleChange} /></label><br />
      <label>Company Prompt: <input name="prompts.company" value={replay.prompts.company} onChange={handleChange} /></label><br />
      <label>Phone Number Prompt: <input name="prompts.phoneNumber" value={replay.prompts.phoneNumber} onChange={handleChange} /></label><br /><br />

      <button onClick={handleSave}>Save Replay Settings</button>
    </div>
  );
}
