import { validate } from "uuid";

export const sendRequest = async (path: string, options: any) => {
    try {
      const response = await fetch(
        path,
        options
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.log(error);
    }
}