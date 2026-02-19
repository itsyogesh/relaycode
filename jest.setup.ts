import "@testing-library/jest-dom";

// scrollIntoView polyfill for cmdk (not implemented in jsdom)
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function () {};
