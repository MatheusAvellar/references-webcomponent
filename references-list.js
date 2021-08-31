class ReferencesElement extends HTMLElement {
  state = {
    ref_names: {}
  };

  constructor() {
    self = super();

    const shadow = this.attachShadow({ mode: "open" });

    const default_css = document.createElement("style");
    default_css.textContent = 
      "li:focus, li:focus-within {"
    +   "background-color: rgb(150,216,255,.4);"
    + "}"
    + "[slot=\"style\"] {"
    +   "display: none;"
    + "}";
    shadow.appendChild(default_css);

    const custom_css = document.createElement("slot");
    custom_css.setAttribute("name", "style");
    shadow.appendChild(custom_css);

    const ol = document.createElement("ol");
    shadow.appendChild(ol);
  }

  getKey(key) {
    return self.state.ref_names[key];
  }
  setKey(key, value) {
    self.state.ref_names[key] = value;
  }
  hasKey(key) {
    return !!self.getKey(key);
  }

  connectedCallback() {
    const custom_css = self.querySelector("[slot]");
    if(custom_css)
      self.shadowRoot.appendChild(custom_css);

    let ref_count = 0;
    [...document.querySelectorAll("cite-web")].forEach(e => {
      const name = e.getAttribute("name");
      // Reference has a name
      if(name) {
        // If it's not on our list yet
        if(!self.hasKey(name)) {
          // Increment the ID, and link it to the name
          ref_count++;
          self.setKey(name, ref_count);
          // Add reference to the list
          self.addCitation(e, ref_count);
        }
        // Get ID linked to the name
        const ref_id = self.getKey(name);
        // Update it on the citation
        e.setAttribute("data-refid", ref_id);
      }
      // If reference doesn't have a name
      else {
        // Just increment ID and update the citation
        ref_count++;
        e.setAttribute("data-refid", ref_count);
        // Add reference to the list
        self.addCitation(e, ref_count);
      }
    });
  }

  addCitation(element, id) {
    const li = document.createElement("li");
    li.setAttribute("id", `ref${id}`);
    li.setAttribute("tabindex", "0");

    const TITLE_MISSING = "[missing title]";

    const done = {};
    const url = element.getAttribute("url");
    const title = element.getAttribute("title") || TITLE_MISSING;
    const author = element.getAttribute("author");
    const publisher = element.getAttribute("publisher");
    const location = element.getAttribute("location");
    const date = element.getAttribute("date");
    const accessdate = element.getAttribute("access-date");

    if(author) {
      li.appendChild(document.createTextNode(author));
      done["author"] = true;

      if(date) {
        li.appendChild(document.createTextNode(` (${date}). `));
        done["date"] = true;
      } else {
        li.appendChild(document.createTextNode(". "));
      }
    }

    if(url) {
      const b = document.createElement("b");

        const anchor = document.createElement("a");

          anchor.setAttribute("href", url);
          anchor.textContent = title;

        b.appendChild(anchor);

      li.appendChild(b);
      done["anchor"] = done["title"] = true;
    } else {
      const b = document.createElement("b");
      b.textContent = title;
      li.appendChild(b);
      done["title"] = true;
    }
    // If we haven't added the date yet, add it
    if(date && !done["date"]) {
      li.appendChild(document.createTextNode(` (${date}). `));
      done["date"] = true;
    } else {
      // If title doesn't already end with a '.', add it
      if(!title.endsWith("."))
        li.appendChild(document.createTextNode(". "));
    }

    if(publisher) {
      const i = document.createElement("i");
      i.textContent = publisher;
      li.appendChild(i);
      // If publisher doesn't already end with a '.', add it
      if(!publisher.endsWith("."))
        li.appendChild(document.createTextNode(". "));
      // Otherwise, only add a space
      else
        li.appendChild(document.createTextNode(" "));
      done["publisher"] = true;
    }

    if(location) {
      li.appendChild(document.createTextNode(`${location}. `));
      done["location"] = true;
    }

    if(accessdate) {
      li.appendChild(document.createTextNode(`Accessed on ${accessdate}. `));
      done["accessdate"] = true;
    }

    this.shadowRoot.querySelector("ol").appendChild(li);
  }
}

customElements.define("references-list", ReferencesElement);