import React from "react";
import "./FloatingContact.css";

const FloatingContact = () => {
  return React.createElement(
    "div",
    { className: "floating-contact" },
    [
      // WhatsApp Button
      React.createElement(
        "a",
        {
          key: "wa",
          href: "https://wa.me/919481513621",
          className: "floating-btn whatsapp",
          target: "_blank",
          rel: "noopener noreferrer"
        },
        React.createElement("i", { className: "fab fa-whatsapp" })
      ),

      // Email Button
      React.createElement(
        "a",
        {
          key: "mail",
          href: "mailto:pkccag@gmail.com",
          className: "floating-btn email"
        },
        React.createElement("i", { className: "fas fa-envelope" })
      )
    ]
  );
};

export default FloatingContact;
