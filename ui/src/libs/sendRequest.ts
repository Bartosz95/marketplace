export const SendRequest =
  (host?: string) => async (path: string, options: RequestInit) => {
    try {
      const response = await fetch(host + path, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      if (text) {
        return JSON.parse(text);
      }
    } catch (error) {
      console.log(error);
    }
  };
