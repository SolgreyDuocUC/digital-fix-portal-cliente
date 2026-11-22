import { api } from "./api";

export interface Region {
  idRegion: number;
  nombre: string;
  numeroRomano?: string;
}

export interface Comuna {
  idComuna: number;
  nombre: string;
}

/** Regiones y comunas del catálogo de ms-workorders (la OT exige una comuna válida del ERP). */
export const fetchRegions = (): Promise<Region[]> => api<Region[]>("/ubicaciones/regiones", { auth: false });

export const fetchCommunes = (idRegion: number): Promise<Comuna[]> =>
  api<Comuna[]>(`/ubicaciones/regiones/${idRegion}/comunas`, { auth: false });
