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
    <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-2xl font-bold text-blue-800">Buscar Calle</h3>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="streetId">
          ID de la Calle
        </label>
        <input 
          className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" 
          id="streetId" 
          type="text" 
          value={streetId}
          onChange={(e) => setStreetId(e.target.value)}
          placeholder="Introduce el ID de la calle"
        />
      </div>
      <button 
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline" 
        onClick={handleSearch}
      >
        Buscar
      </button>
      {streetData && (
        <div className="mt-4 text-lg text-gray-700">
          <p>Nombre de la Calle: {streetData.nombre_calle}</p>
          <p>Número de la Sección: {streetData.seccion}</p>
        </div>
      )}
      {error && <p className="mt-4 text-lg text-red-500">{error}</p>}
    </div>
  );
}