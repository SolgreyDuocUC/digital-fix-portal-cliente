export function cleanRut(rut: string): string {
  return typeof rut === "string" ? rut.replace(/[^0-9kK]/g, "").toUpperCase() : "";
}

export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
}

export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 8 || clean.length > 9) return false;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvStr = "";
  if (dvEsperado === 11) dvStr = "0";
  else if (dvEsperado === 10) dvStr = "K";
  else dvStr = dvEsperado.toString();

  return dv === dvStr;
}

