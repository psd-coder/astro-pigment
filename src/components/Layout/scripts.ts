import { focusGroupKeyUX, startKeyUX } from "keyux";

function initKeyUX() {
  startKeyUX(window, [focusGroupKeyUX()]);
}

initKeyUX();
window.addEventListener("page:swap", initKeyUX);
