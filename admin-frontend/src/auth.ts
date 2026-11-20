export type Administrator = {
  id: number;
  korisnickoIme: string;
  ime: string;
  email: string;
};

type Csrf = { headerName: string; token: string };

async function authRequest(path: string, options?: RequestInit) {
  try {
    return await fetch('/api/admin/auth/' + path, {
      ...options,
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new Error('Veza s backendom nije dostupna. Pokušajte ponovo.');
  }
}

async function post(path: string, body?: object) {
  const response = await authRequest('csrf');
  if (!response.ok) throw new Error('Backend nije dostupan. Pokušajte ponovo.');

  const { headerName, token }: Csrf = await response.json();
  return authRequest(path, {
    method: 'POST',
    headers: body
      ? { [headerName]: token, 'Content-Type': 'application/json' }
      : { [headerName]: token },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function provjeriSesiju(): Promise<Administrator | null> {
  const response = await authRequest('me');
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Provjera sesije nije uspjela. Provjerite radi li backend.');
  return response.json();
}

export async function prijaviSe(korisnickoIme: string, lozinka: string): Promise<Administrator> {
  const response = await post('login', { korisnickoIme, lozinka });
  if (response.status === 401) throw new Error('Pogrešno korisničko ime ili lozinka.');
  if (response.status === 400) throw new Error('Provjerite korisničko ime i lozinku.');
  if (!response.ok) throw new Error('Prijava nije uspjela. Pokušajte ponovo.');
  return response.json();
}

export async function odjaviSe() {
  const response = await post('logout');
  if (!response.ok && response.status !== 401) {
    throw new Error('Odjava nije uspjela. Pokušajte ponovo.');
  }
}
