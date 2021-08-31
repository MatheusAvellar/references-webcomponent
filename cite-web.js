class CiteWeb extends HTMLElement {
  static get observedAttributes() { return ["data-refid"]; }

  constructor() {
    self = super();

    const shadow = this.attachShadow({ mode: "open" });
    const css = document.createElement("style");
    css.textContent = `
a[href] { text-decoration: none; }
a[href]:hover, a[href]:focus { text-decoration: underline; }`;
    shadow.appendChild(css);
  }

  attributeChangedCallback(name, old_value, new_value) {
    const sup = document.createElement("sup");
      const anchor = document.createElement("a");
      anchor.setAttribute("href", `#ref${new_value}`);
      anchor.setAttribute("id", `#a${new_value}`);
      anchor.textContent = `[${new_value}]`;
    sup.appendChild(anchor);
    // For some reason, `self` here is <references>; so we use `this` instead
    this.shadowRoot.appendChild(sup);
  }
}

customElements.define("cite-web", CiteWeb);