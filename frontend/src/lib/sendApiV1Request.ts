export const sendApiV1Request = async (path: string, options: RequestInit) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}` + path,
      options
    );
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
