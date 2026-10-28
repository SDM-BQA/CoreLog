export const set_string = (path: string, value: string): void => {
    localStorage.setItem(path, value);
};

export const get_string = (path: string): string | null => {
    return localStorage.getItem(path);
};

export const delete_string = (path: string): void => {
    localStorage.removeItem(path);
};
export const set_json = (path: string, value: any): void => {
    localStorage.setItem(path, JSON.stringify(value));
};

export const get_json = (path: string): any | null => {
    const value = localStorage.getItem(path);
    return value ? JSON.parse(value) : null;
};

// Auth storage: persistent (localStorage) when "keep me signed in", else per-tab session (sessionStorage)
export const set_auth_string = (path: string, value: string, persist: boolean): void => {
    (persist ? sessionStorage : localStorage).removeItem(path);
    (persist ? localStorage : sessionStorage).setItem(path, value);
};

export const get_auth_string = (path: string): string | null => {
    return localStorage.getItem(path) ?? sessionStorage.getItem(path);
};

export const delete_auth_string = (path: string): void => {
    localStorage.removeItem(path);
    sessionStorage.removeItem(path);
};
