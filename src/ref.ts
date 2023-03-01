export class Ref<Type> {
  #ref: Type;

  constructor(value: Type) {
    this.#ref = value;
  }

  public getRef(): Type {
    return this.#ref;
  }

  public setRef(v: Type) {
    this.#ref = v;
  }
}
