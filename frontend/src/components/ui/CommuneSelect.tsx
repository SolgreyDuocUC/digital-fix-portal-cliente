import React, { useEffect, useState } from "react";
import { Comuna, Region, fetchCommunes, fetchRegions } from "@/services/locationService";
import { errorMessage } from "@/services/api";

export interface CommuneValue {
  communeId?: number;
  commune?: string;
  region?: string;
}

interface CommuneSelectProps {
  value: CommuneValue;
  onChange: (value: CommuneValue) => void;
  required?: boolean;
  idPrefix?: string;
}

/** Región y comuna desde el catálogo de ms-workorders. Preselecciona la región por nombre si ya hay comuna. */
export const CommuneSelect: React.FC<CommuneSelectProps> = ({ value, onChange, required, idPrefix = "ubicacion" }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [communes, setCommunes] = useState<Comuna[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegions()
      .then((list) => {
        setRegions(list);
        const actual = value.region && list.find((r) => r.nombre.toLowerCase() === value.region!.toLowerCase());
        if (actual) setRegionId(actual.idRegion);
      })
      .catch((err) => setError(errorMessage(err, "No pudimos cargar las regiones")));
    // Solo al montar: la región inicial sale del valor que trae el perfil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (regionId == null) {
      setCommunes([]);
      return;
    }
    let vigente = true;
    setLoadingCommunes(true);
    fetchCommunes(regionId)
      .then((list) => vigente && setCommunes(list))
      .catch((err) => vigente && setError(errorMessage(err, "No pudimos cargar las comunas")))
      .finally(() => vigente && setLoadingCommunes(false));
    return () => {
      vigente = false;
    };
  }, [regionId]);

  const regionName = regions.find((r) => r.idRegion === regionId)?.nombre;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor={`${idPrefix}-region`} className="label">
          Región{required && " *"}
        </label>
        <select
          id={`${idPrefix}-region`}
          className="input"
          required={required}
          value={regionId ?? ""}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            setRegionId(id);
            onChange({ region: regions.find((r) => r.idRegion === id)?.nombre });
          }}
        >
          <option value="">{regions.length === 0 && !error ? "Cargando..." : "Selecciona"}</option>
          {regions.map((r) => (
            <option key={r.idRegion} value={r.idRegion}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-comuna`} className="label">
          Comuna{required && " *"}
        </label>
        <select
          id={`${idPrefix}-comuna`}
          className="input"
          required={required}
          disabled={regionId == null || loadingCommunes}
          value={value.communeId ?? ""}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : undefined;
            onChange({
              communeId: id,
              commune: communes.find((c) => c.idComuna === id)?.nombre,
              region: regionName,
            });
          }}
        >
          <option value="">{loadingCommunes ? "Cargando..." : "Selecciona"}</option>
          {communes.map((c) => (
            <option key={c.idComuna} value={c.idComuna}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="sm:col-span-2 text-xs text-red-600">{error}</p>}
    </div>
  );
};
