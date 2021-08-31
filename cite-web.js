class CiteWeb extends HTMLElement {
  static get observedAttributes() { return ["data-refid"]; }

  constructor() {
    self = super();

    const shadow = this.attachShadow({ mode: "open" });

    const default_css = document.createElement("style");
    default_css.textContent = 
      "[slot=\"style\"] {"
    +   "display: none;"
    + "}";
    shadow.appendChild(default_css);
  }

  attributeChangedCallback(name, old_value, new_value) {
    const reflist = document.querySelector("references-list");

    const sup = document.createElement("sup");
      const anchor = document.createElement("a");
      anchor.setAttribute("href", `#ref${new_value}`);
      // TODO: wiki-like clickable ↑ or a,b,c's in citations to go back to text
      // anchor.setAttribute("id", `cite${new_value}`);
      anchor.textContent = `[${new_value}]`;
      anchor.onclick = e => {
        const citation = reflist.shadowRoot.getElementById(`ref${new_value}`);
        citation.scrollIntoView(true);
        citation.focus();
      };
    sup.appendChild(anchor);
    // For some reason, `self` here is <references-list>; so we use `this` instead
    this.shadowRoot.appendChild(sup);

    // If <references-list> has a style within it, add it to this as well
    const css = reflist.shadowRoot.querySelector('[slot="style"]');
    if(css) this.shadowRoot.appendChild(css.cloneNode(true));
  }
}

customElements.define("cite-web", CiteWeb);