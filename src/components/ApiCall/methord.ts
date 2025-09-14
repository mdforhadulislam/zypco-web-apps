type RequestResponse<T> = {
  data: T | null;
  message: string;
  status: number;
};

export const getRequestSend = async <T>(
  url: string,
  header?: Record<string, string>
): Promise<RequestResponse<T>> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...header,
      },
    });
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Request failed:", message);
    return { message, status: 500, data: null };
  }
};

export const postRequestSend = async <Req, Res>(
  url: string,
  header?: Record<string, string>,
  dataSend?: Req
): Promise<RequestResponse<Res>> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...header,
      },
      body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Request failed:", message);
    return { message, status: 500, data: null };
  }
};

export const putRequestSend = async <Req, Res>(
  url: string,
  header?: Record<string, string>,
  dataSend?: Req
): Promise<RequestResponse<Res>> => {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...header,
      },
      body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Request failed:", message);
    return { message, status: 500, data: null };
  }
};

export const deleteRequestSend = async <T>(
  url: string,
  header?: Record<string, string>
): Promise<RequestResponse<T>> => {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...header,
      },
    });
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Request failed:", message);
    return { message, status: 500, data: null };
  }
};
