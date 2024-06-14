import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom, map, tap } from 'rxjs';
import { UserCredentials } from '../../../interfaces/user-credentials';
import { UserRegisterInfo } from '../../../interfaces/user-register-info';
import { JwtService } from '../../jwt.service';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { StrapiArrayResponse, StrapiExtendedUser, StrapiLoginPayload, StrapiLoginResponse, StrapiMe, StrapiRegisterPayload, StrapiRegisterResponse, StrapiResponse, StrapiUploadResponse, StrapiUser } from '../../../interfaces/strapi';
import { User } from '../../../interfaces/user';
import { MediaService } from '../media.service';

/**
 * This service handles media operations using Strapi. Note that this service is not currently being utilized.
 */
export class StrapiMediaService extends MediaService {

  /**
   * Creates an instance of StrapiMediaService.
   * 
   * @param apiSvc Service to make API requests.
   */
  constructor(
    private apiSvc: ApiService
  ) { 
    super();
  }

  /**
   * Uploads a media file to Strapi.
   * 
   * @param blob The media file as a Blob.
   * @returns An observable of the uploaded media IDs.
   */
  public upload(blob: Blob): Observable<number[]> {
    const formData = new FormData();
    formData.append('files', blob);
    return this.apiSvc.post('/upload', formData).pipe(map((response: StrapiUploadResponse) => {
      return response.map(media => media.id);
    }));
  }
}
