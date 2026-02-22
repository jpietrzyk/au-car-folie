declare global {
  interface Window {
    grecaptcha: {
      execute(siteKey: string, options: { action: string }): Promise<string>;
      ready(callback: () => void): void;
      render(container: string | HTMLElement, options: any): number;
      reset(widgetId?: number): void;
      getResponse(widgetId?: number): string;
    };
  }
}

export {};
