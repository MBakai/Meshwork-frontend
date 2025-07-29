export interface UpdateSubTask{
    id?:string;
    titulo?: string;
    id_estado?: number; 
    descripcion?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    asignados?: string[];
    quitarAsignados?: string[];
}