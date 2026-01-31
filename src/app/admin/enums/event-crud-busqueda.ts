import { TipoFiltro } from "./tipo-filtro";

export interface EventCrudBusqueda {
    filtro?: TipoFiltro;
    texto?: string;
}