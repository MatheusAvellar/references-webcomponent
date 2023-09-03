// <references-list>
class ReferencesList extends HTMLElement {
	state = {
		name_to_ref_dict: {},
		ref_to_name_dict: {}
	};

	constructor() {
		self = super();

		const shadow = this.attachShadow({ mode: "open" });

		const default_css = document.createElement("style");
		default_css.textContent = `
li:focus, li:focus-within {
	background-color: rgb(150,216,255,.4);
}
[slot="style"] {
	display: none;
}`;
		shadow.appendChild(default_css);

		const custom_css = document.createElement("slot");
		custom_css.setAttribute("name", "style");
		shadow.appendChild(custom_css);

		const ol = document.createElement("ol");
		shadow.appendChild(ol);
	}

	getFromName(name) {
		return self.state.name_to_ref_dict[ref];
	}
	getFromRef(ref) {
		return self.state.ref_to_name_dict[ref];
	}
	incrementFromName(name) {
		const count = ++self.state.name_to_ref_dict[name][0];
		const ref = self.state.name_to_ref_dict[name][1];
		self.state.ref_to_name_dict[ref][0] = count;
		return self.state.name_to_ref_dict[name];
	}
	setFromName(name, ref) {
		self.state.name_to_ref_dict[name] = [ 0, ref ];
		self.state.ref_to_name_dict[ref] = [ 0, name ];
	}
	hasFromName(name) {
		return name in self.state.name_to_ref_dict;
	}

	// Convert numbers to letters incrementally; e.g. 26=>"z", 27=>"aa"
	// Adapted from: stackoverflow.com/a/182924/4824627
	alphabetize(n) {
		const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
		let out = "";
		while(n > 0) {
			const mod = (n-1) % 26;
			out = alphabet[mod] + out;
			n = Math.floor((n - mod) / 26);
		}
		return out;
	}

	connectedCallback() {
		const custom_css = self.querySelector("[slot]");
		if(custom_css)
			self.shadowRoot.appendChild(custom_css);


		const add_citations = [];
		let ref_count = 0;
		[...document.querySelectorAll("cite-web")].forEach(e => {
			const name = e.getAttribute("name");
			// Reference has a name
			if(name) {
				// If it's not on our list yet
				if(!self.hasFromName(name)) {
					// Increment the ID, and link it to the name
					ref_count++;
					self.setFromName(name, ref_count);
					// Add reference to the list
					add_citations.push([e, ref_count]);
				}
				// Get ID linked to the name
				const [ id, ref_id ] = self.incrementFromName(name);
				// Update it on the citation
				e.setAttribute("id", `cite${ref_id}-${self.alphabetize(id)}`);
				e.setAttribute("data-refid", ref_id);
			}
			// If reference doesn't have a name
			else {
				// Just increment ID and update the citation
				ref_count++;
				e.setAttribute("data-refid", ref_count);
				e.setAttribute("id", `cite${ref_count}`);
				// Add reference to the list
				add_citations.push([e, ref_count]);
			}
		});
		for(const cit of add_citations) {
			self.addCitation(...cit);
		}
	}

	addCitation(element, id) {
		const li = document.createElement("li");
		li.setAttribute("id", `ref${id}`);
		li.setAttribute("tabindex", "0");

		// Creates superscript anchors for returning to inline citations
		// For single citation: "^ Citation"; multiple: "^ a b c Citation"
		const ref_sup = document.createElement("sup");
		let ref_count = self.getFromRef(id);
		if(!ref_count) {
			const ref_anchor = document.createElement("a");
			ref_anchor.textContent = "^";
			ref_anchor.href = `#cite${id}`;
			ref_sup.appendChild(ref_anchor);
			ref_sup.appendChild(document.createTextNode(" "));
		} else {
			ref_sup.appendChild(document.createTextNode("^ "));
			ref_count = ref_count[0];
			for(let i = 1; i <= ref_count; i++) {
				const ref_anchor = document.createElement("a");
				const letter = self.alphabetize(i);
				ref_anchor.textContent = letter;
				ref_anchor.href = `#cite${id}-${letter}`;
				ref_sup.appendChild(ref_anchor);
				ref_sup.appendChild(document.createTextNode(" "));
			}
		}
		li.appendChild(ref_sup);

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

// <cite-web>
class CiteWeb extends HTMLElement {
	static get observedAttributes() { return ["data-refid"]; }

	constructor() {
		self = super();
		this.attachShadow({ mode: "open" });
	}

	attributeChangedCallback(name, old_value, new_value) {
		while(this.shadowRoot.firstChild)
			this.shadowRoot.firstChild.remove();

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

		// Default style to prevent whitespace showing up if reflist uses e.g.
		// <span slot="style"> <style>...</style> <link/> </span>
		const default_css = document.createElement("style");
		default_css.textContent = "[slot=\"style\"] { display: none; }";
		this.shadowRoot.appendChild(default_css);
		// If <references-list> has a style within it, add it to this as well
		const css = reflist.shadowRoot.querySelector('[slot="style"]');
		if(css) this.shadowRoot.appendChild(css.cloneNode(true));
	}
}

// Define custom elements
customElements.define("references-list", ReferencesList);
customElements.define("cite-web", CiteWeb);