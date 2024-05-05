export class DevServerClient {
  constructor(private host: string){}

  readyCheck() {
    return this.host + '/rdycheck'
  }
  
  echoHeaders() {
    return this.host + '/echo-headers'
  }

  echoBody() {
    return this.host + '/echo-body'
  }

  throwError(error: number, payload?: string) {
    return this.host + '/throw-error'
  }

  emulateTimeout() {
    return this.host + '/timeout-error'
  }
}

export class Cookie {
  #raw: string;
  #payload: string;

  constructor(key: string, val: string){
    this.#payload = `${key}=${val}`;
    this.#raw = `${this.#payload};SameSite=None;domain=localhost;path=/;Secure`;
    document.cookie = this.#raw;
  }
  
  destroy() {
    document.cookie = `${this.#raw};expires=Thu, 01 Jan 1970 00:00:01`;
  }

  get value() {
    return this.#payload;
  }

}