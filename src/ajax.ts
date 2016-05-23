class Ajax {

    public options = {
        use_json: true,
        use_cors: true
    }

    constructor(public url: string) {
    }

    jsonp<T>(args?: any, url = this.url) {
        return new Promise<T>((resolve, reject) => {

            args["callback"] = "define";
            let uri = url + "?" + Object.keys(args).map(k => `${k}=${args[k]}`).join('&');
            require([uri], (data: T) => resolve(data));
        });

    }

    // http://www.html5rocks.com/en/tutorials/cors/    
    private ajax<T>(method: string, args?: any, url = this.url) {

        let isData = method === "POST" || method === "PUT";
        let isJson = this.options.use_json;
        let isCors = this.options.use_cors;

        let promise = new Promise<T>((resolve, reject) => {

            let client = new XMLHttpRequest();
            if (isCors) client.withCredentials = true;

            let uri = url;
            let data: any = null;

            if (args) {
                if (isData) {
                    data = JSON.stringify(args);
                } else {
                    uri += '?';
                    let argcount = 0;
                    for (let key in args) {
                        if (args.hasOwnProperty(key)) {
                            if (argcount++) {
                                uri += '&';
                            }
                            uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                        }
                    }
                }
            }

            client.open(method, uri, true);
            if (isData && isJson) client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            client.send(data);

            client.onload = () => {
                console.log("content-type", client.getResponseHeader("Content-Type"));
                if (client.status >= 200 && client.status < 300) {
                    isJson = isJson || 0 === client.getResponseHeader("Content-Type").indexOf("application/json");
                    resolve(isJson ? JSON.parse(client.response) : client.response);
                } else {
                    reject(client.statusText);
                }
            };

            client.onerror = function() {
                reject(this.statusText);
            };
        });

        // Return the promise
        return promise;
    }

    get<T>(args?: any) {
        return this.ajax<T>('GET', args);
    }

    post<T>(args?: any) {
        return this.ajax<T>('POST', args);
    }

    put<T>(args?: any) {
        return this.ajax<T>('PUT', args);
    }

    delete(args?: any) {
        return this.ajax('DELETE', args);
    }
}

export = Ajax;