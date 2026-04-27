import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import { environment } from './environments/environment';

ModuleRegistry.registerModules([AllEnterpriseModule]);

if (environment.agGridLicenseKey) {
  LicenseManager.setLicenseKey(environment.agGridLicenseKey);
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
