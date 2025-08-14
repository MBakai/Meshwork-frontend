import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ColaboradorResponse } from "../../core/auth-service/interface/colaborador-response.interface";

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

    buscarUsuariosPorCorreo(email: string): Observable<ColaboradorResponse[]> {
        return this.http.get<ColaboradorResponse[]>(`${this.apiUrl}/colaboradores/search-user?email=${email}`);
    }

    enviarSolicitud(destinatarioId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/colaboradores/enviar`, { destinatarioId });
    }

    aceptarSolicitud(solicitudId: string): Observable<any> {
      return this.http.patch(`${this.apiUrl}/colaboradores/aceptar/${solicitudId}`, {});
    }
    rechazarSolicitud(solicitudId: string): Observable<any>{
      return this.http.patch(`${this.apiUrl}/colaboradores/rechazar/${ solicitudId }`, {});
    }

    obtenerSolicitudesEnviadas(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/colaboradoressolicitudes/enviadas`);
    }

}
