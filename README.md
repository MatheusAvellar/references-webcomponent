# References Web Component

Experiment on Web Components to figure out how they work!

Demo: https://lab.avl.la/references-webcomponent/

This repo contains two Web Components:

* `<cite-web>` for inline citations;
* `<references-list>` at the bottom to generate the list.

## Issues

* Inline citations don't auto-scroll on click. Because elements with corresponding ID's are in the shadow DOM, apparently anchors outside it don't link to them;
* Outer styles aren't inherited by the inner anchors. Ideally, anchors inside the custom elements would look like anchors outside it.

I need to research more into Web Components to figure these out (if they are even solvable).
