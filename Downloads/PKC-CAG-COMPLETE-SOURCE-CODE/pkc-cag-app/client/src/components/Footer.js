import React from "react";
import "./Footer.css";

const Footer = () => {
  return React.createElement(
    "footer",
    { className: "footer" },
    React.createElement(
      "div",
      { className: "container" },
      [
        React.createElement(
          "div",
          { key: "content", className: "footer-content" },
          [
            React.createElement(
              "div",
              { key: "brand", className: "footer-brand" },
              [
                React.createElement("h3", { key: "h3" }, "PKC CAG"),
                React.createElement("p", { key: "p" }, "India's Leading Digital Marketing Agency")
              ]
            ),

            React.createElement(
              "div",
              { key: "links", className: "footer-links" },
              [
                React.createElement(
                  "div",
                  { key: "col1", className: "footer-column" },
                  [
                    React.createElement("h4", { key: "h4" }, "Quick Links"),
                    React.createElement("ul", { key: "list1" },
                      [
                        React.createElement("li", { key: "l1" }, React.createElement("a", { href: "/services" }, "Services")),
                        React.createElement("li", { key: "l2" }, React.createElement("a", { href: "/dashboard" }, "Dashboard")),
                        React.createElement("li", { key: "l3" }, React.createElement("a", { href: "/terms" }, "Terms & Conditions"))
                      ]
                    )
                  ]
                ),

                React.createElement(
                  "div",
                  { key: "col2", className: "footer-column" },
                  [
                    React.createElement("h4", { key: "h4b" }, "Contact"),
                    React.createElement("ul", { key: "list2" }, [
                      React.createElement("li", { key: "c1" },
                        React.createElement("a", { href: "https://wa.me/919481513621" }, "+91 94815 13621")
                      ),
                      React.createElement("li", { key: "c2" },
                        React.createElement("a", { href: "mailto:pkccag@gmail.com" }, "pkccag@gmail.com")
                      ),
                      React.createElement("li", { key: "c3" },
                        React.createElement("a", { href: "https://instagram.com/pkc_cag" }, "@pkc_cag")
                      )
                    ])
                  ]
                )
              ]
            )
          ]
        ),

        React.createElement(
          "div",
          { key: "bot", className: "footer-bottom" },
          React.createElement("p", null, "© 2024 PKC CAG. All rights reserved.")
        )
      ]
    )
  );
};

export default Footer;
