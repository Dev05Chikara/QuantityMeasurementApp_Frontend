import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type GoogleCredentialCallback = (response: GoogleCredentialResponse) => void;

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: GoogleCredentialCallback;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
}

interface GoogleAccountsId {
  initialize(config: GoogleIdConfiguration): void;
  renderButton(parent: HTMLElement, options: GoogleButtonConfiguration): void;
  prompt(): void;
}

interface GoogleWindow {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleWindow;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  async renderButton(element: HTMLElement, onCredential: (credential: string) => void): Promise<void> {
    const google = await this.waitForGoogle();
    const clientId = this.getClientId();

    google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => onCredential(credential),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    element.innerHTML = '';
    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'continue_with',
      shape: 'pill',
      logo_alignment: 'left',
      width: 320
    });
  }

  private getClientId(): string {
    const clientId = environment.googleClientId?.trim();

    if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID_HERE')) {
      throw new Error('Google Client ID is missing. Update googleClientId in src/environments/environment.ts.');
    }

    return clientId;
  }

  private async waitForGoogle(): Promise<GoogleWindow> {
    const attempts = 40;

    for (let i = 0; i < attempts; i += 1) {
      if (window.google?.accounts?.id) {
        return window.google;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error('Google Identity script failed to load.');
  }
}
