import { useState } from 'react';

export default function StreetSearch() {
  const [streetId, setStreetId] = useState('');
  const [streetData, setStreetData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/streets/${streetId}`);
      if (!response.ok) {
        throw new Error('Street not found');
      }
      const data = await response.json();
      setStreetData(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setStreetData(null);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 correos-card">
      <h3 className="mb-4 text-2xl correos-title">Buscar Calle</h3>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-bold correos-subtitle" htmlFor="streetId">
          ID de la Calle
        </label>
        <input 
          className="correos-input" 
          id="streetId" 
          type="text" 
          value={streetId}
          onChange={(e) => setStreetId(e.target.value)}
          placeholder="Introduce el ID de la calle"
        />
      </div>
      <button 
        className="correos-btn-primary" 
        onClick={handleSearch}
      >
        Buscar
      </button>
      {streetData && (
        <div className="mt-4 text-lg correos-subtitle">
          <p>Nombre de la Calle: {streetData.nombre_calle}</p>
          <p>Número de la Sección: {streetData.seccion}</p>
        </div>
      )}
      {error && <p className="mt-4 text-lg text-red-400 font-semibold">{error}</p>}
    </div>
  );
}