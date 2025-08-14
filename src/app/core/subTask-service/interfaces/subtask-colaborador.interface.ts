export interface SubtaskColaborador{
    taskId: string,
    taskTitulo: string,
    taskCreador: string,
    taskDescripcion: string,

    subtaskId: string;
    subtaskTitulo: string,
    subtaskDescripcion: string,
    subtaskEstadoId: number,
    subtaskAsignados: string[],
    subtaskStartDate: string,
    subtaskEndDate: string,
    subtaskCompletedAt: string,

}