import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export type PaisCode = 'EC' | 'PE';
export type TipoIdentificacion = 'RUC' | 'CEDULA' | 'PASAPORTE';

function modulo10EC(v: string): boolean {
  if (!/^\d{10}$/.test(v)) return false;
  const prov = parseInt(v.substring(0, 2), 10);
  if (prov < 1 || prov > 24) return false;
  if (parseInt(v[2], 10) >= 6) return false;
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let d = parseInt(v[i], 10) * coef[i];
    if (d >= 10) d -= 9;
    sum += d;
  }
  const res = sum % 10;
  const dv = res === 0 ? 0 : 10 - res;
  return dv === parseInt(v[9], 10);
}

function modulo11EC(v: string, coef: number[], dvPos: number): boolean {
  let sum = 0;
  for (let i = 0; i < coef.length; i++) sum += parseInt(v[i], 10) * coef[i];
  let dv = 11 - (sum % 11);
  if (dv === 10) dv = 0;
  if (dv === 11) dv = 1;
  return dv === parseInt(v[dvPos], 10);
}

function cedulaEC(v: string): boolean {
  return modulo10EC(v);
}

function rucEC(v: string): boolean {
  if (!/^\d{13}$/.test(v)) return false;
  const t = parseInt(v[2], 10);
  if (t < 6) {
    // Persona natural: primeros 10 = cédula válida, últimos 3 > 0
    return modulo10EC(v.substring(0, 10)) && parseInt(v.substring(10), 10) > 0;
  }
  if (t === 6) {
    // Entidad pública: coef [3,2,7,6,5,4,3,2], dv en posición 8, últimos 4 > 0
    return modulo11EC(v, [3, 2, 7, 6, 5, 4, 3, 2], 8) && parseInt(v.substring(9), 10) > 0;
  }
  if (t === 9) {
    // Persona jurídica privada: coef [4,3,2,7,6,5,4,3,2], dv en posición 9, últimos 3 > 0
    return modulo11EC(v, [4, 3, 2, 7, 6, 5, 4, 3, 2], 9) && parseInt(v.substring(10), 10) > 0;
  }
  return false;
}

function rucPE(v: string): boolean {
  if (!/^\d{11}$/.test(v)) return false;
  const prefix = parseInt(v.substring(0, 2), 10);
  if (![10, 15, 16, 17, 20].includes(prefix)) return false;
  const coef = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(v[i], 10) * coef[i];
  let dv = 11 - (sum % 11);
  if (dv >= 10) dv -= 10;
  return dv === parseInt(v[10], 10);
}

function dniPE(v: string): boolean {
  return /^\d{8}$/.test(v);
}

function pasaporte(v: string): boolean {
  return /^[A-Z0-9]{5,20}$/.test(v);
}

export function validarIdentificacion(valor: string, tipo: TipoIdentificacion, pais: PaisCode): boolean {
  const v = valor.trim().toUpperCase();
  if (!v) return true;
  switch (pais) {
    case 'EC':
      switch (tipo) {
        case 'CEDULA':    return cedulaEC(v);
        case 'RUC':       return rucEC(v);
        case 'PASAPORTE': return pasaporte(v);
      }
      break;
    case 'PE':
      switch (tipo) {
        case 'CEDULA':    return dniPE(v);
        case 'RUC':       return rucPE(v);
        case 'PASAPORTE': return pasaporte(v);
      }
      break;
  }
  return true;
}

/**
 * Valida identificacion leyendo tipoIdentificacion del control hermano en el mismo FormGroup.
 * Uso: identificacion: ['', [Validators.required, identificacionValidator('EC')]]
 */
export function identificacionValidator(pais: PaisCode): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const grupo = control.parent;
    if (!grupo) return null;
    const tipo = grupo.get('tipoIdentificacion')?.value as TipoIdentificacion | null;
    const valor = control.value as string | null;
    if (!tipo || !valor) return null;
    return validarIdentificacion(valor, tipo, pais)
      ? null
      : { identificacionInvalida: { tipo, pais } };
  };
}

/**
 * Valida un campo RUC independiente (sin tipoIdentificacion hermano).
 * Uso: ruc: ['', [Validators.required, rucValidator('EC')]]
 */
export function rucValidator(pais: PaisCode): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string | null;
    if (!valor) return null;
    return validarIdentificacion(valor, 'RUC', pais)
      ? null
      : { rucInvalido: { pais } };
  };
}
