import { TypeNotification } from "./type-notification.enum";

export interface Notificaciones{
    id: string;
    titulo: string;
    usuarioId: string;
    tipo: TypeNotification;
    mensaje: string;
    leida?: boolean;
    procesada?:boolean;
    data: {
        solicitudId: string
    },
    createAt: Date | string;

}