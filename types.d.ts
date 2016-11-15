declare namespace Lokka {
    export type QL = string;
    export interface ITransport {
        send(rawQuery: string, variables: { [index: string]: any }, operationName: string);
    }
    export interface IConfig {
        transport: ITransport;
    }
    export interface IVars { [index: string]: any }
    export type IFragment = string;
    export interface IWatchHandler<T> {
        (err, payload: T): any;
    }
    export interface IStop {
        (): void;
    }
    export interface ICacheConfig {
        cacheExpirationTimeout?: number;
    }
    export interface ICache {
        getItemPayload<T>(query: QL, vars?: IVars): T;
        setItemPayload<T>(query: QL, vars: IVars, payload: T): void;
        fireError(query: QL, vars: IVars, error): void;
        removeItem(query: QL, vars?: IVars): void;
        getItem<T>(query: QL, vars?: IVars): T;
    }
    export class Lokka {
        constructor(config: IConfig);
        query<T>(query: QL, vars?: IVars): Promise<T>;
        mutate<T>(query: QL, vars?: IVars): Promise<T>;
        watchQuery<T>(query: QL, handler?: IWatchHandler<T>): IStop;
        watchQuery<T>(query: QL, vars?: IVars, handler?: IWatchHandler<T>): IStop;
        createFragment(fragment: QL): IFragment;
        refetchQuery(query: QL, vars?: IVars): void;
        cache: ICache;
    }
}
export = Lokka