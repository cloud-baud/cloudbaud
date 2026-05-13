
import { useEffect, useState } from 'react';
import { PersonaSwitcher } from '@common/features/dev/PersonaSwitcher'; // Adjust import as needed

const DevPersonaSwitcher = () => {
  const isDev = import.meta.env.DEV;
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    if (!isDev) return;
    fetch('/dev-personas.json')
      .then(res => res.json())
      .then(setPersonas)
      .catch(() => setPersonas([]));
  }, [isDev]);

  if (!isDev || personas.length === 0) return null;

  return (
    <PersonaSwitcher position="bottom-right" extraPersonas={personas} />
  );
};

export default DevPersonaSwitcher;
