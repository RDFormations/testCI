import { TestBed } from '@angular/core/testing';

import { AuthenticationApi } from './authentication-api';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AuthenticationApi', () => {
  let service: AuthenticationApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideZonelessChangeDetection()]
    });
    service = TestBed.inject(AuthenticationApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
