export const set_string = (path: string, value: string): void => {
    localStorage.setItem(path, value);
};

export const get_string = (path: string): string | null => {
    return localStorage.getItem(path);
};

export const delete_string = (path: string): void => {
    localStorage.removeItem(path);
};

