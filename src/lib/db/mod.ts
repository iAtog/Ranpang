abstract class Database {
    public abstract get(key: string): Promise<string>;
}