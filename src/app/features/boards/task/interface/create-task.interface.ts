import { TaskType } from "./type.enum";

export interface CreateTask{
    id: string;
    titulo: string;
    descripcion: string;
    type:TaskType;
    startDate?: Date;
    endDate?:Date;
}