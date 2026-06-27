import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { rolesApi } from '../services/api';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Mapa() {
  const [roles, setRoles] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    rolesApi.mapa()
      .then(({ data }) => setRoles(data))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  // Centro padrão: Joinville
  const centro = [-26.3044, -48.8487];

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Mapa de rolês 🗺️</h1>
        <p className="text-sm text-gray-500 mt-1">{roles.length} rolê{roles.length !== 1 ? 's' : ''} com localização</p>
      </div>

      {carregando ? (
        <div className="h-[400px] bg-gray-100 animate-pulse rounded-2xl mx-4"></div>
      ) : (
        <div className="mx-4 rounded-2xl overflow-hidden shadow-md" style={{ height: 400 }}>
          <MapContainer center={centro} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {roles.map((role) => (
              <Marker key={role.id} position={[role.latitude, role.longitude]}>
                <Popup>
                  <div className="min-w-[150px]">
                    <div className="font-bold text-gray-900 mb-1">{role.nome}</div>
                    <div className="text-xs text-gray-500 mb-1">📍 {role.local}</div>
                    <div className="text-xs text-gray-500 mb-2">📅 {role.data} às {role.horario}</div>
                    <div className="text-xs text-gray-500 mb-2">👥 {role.total_inscritos}/{role.limite_participantes}</div>
                    <Link to={`/roles/${role.id}`} className="text-xs text-primary-600 font-semibold hover:underline">
                      Ver detalhes →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Lista abaixo do mapa */}
      <div className="px-4 mt-4 space-y-2">
        {roles.length === 0 && !carregando && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📍</div>
            <p>Nenhum rolê com localização cadastrada</p>
          </div>
        )}
        {roles.map((role) => (
          <Link key={role.id} to={`/roles/${role.id}`} className="card flex items-center gap-3 p-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xl shrink-0">📍</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{role.nome}</div>
              <div className="text-xs text-gray-500">{role.data} às {role.horario}</div>
            </div>
            <div className="text-xs text-gray-400 shrink-0">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
