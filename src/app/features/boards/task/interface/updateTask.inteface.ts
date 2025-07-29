import { TaskType } from "./type.enum";

export interface UpdateTask{
    id?: string;
    titulo?: string;
    descripcion?: string;
    type?:TaskType;
    startDate?: Date;
    endDate?:Date;
}