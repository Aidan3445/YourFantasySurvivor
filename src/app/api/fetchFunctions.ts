export const basicGet = async <returnType>(endpoint: URL | string): Promise<returnType> => {
    const response = await fetch(endpoint.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Error!');

    const data = await response.json() as returnType;

    return data;
};

export const basicPost = async <returnType>(endpoint: URL | string, body: unknown): Promise<returnType> => {
    const response = await fetch(endpoint.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Error!');

    const data = await response.json() as returnType;

    return data;
}
