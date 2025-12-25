import React from "react";

const TermsPage = () => {
  return React.createElement(
    "div",
    { className: "terms container" },
    [
      React.createElement("h1", { key: "h1" }, "Terms & Conditions"),

      React.createElement("h3", { key: "h3-1" }, "1. No Refund Policy"),
      React.createElement(
        "p",
        { key: "p1" },
        "PKC CAG follows a strict NO REFUND POLICY. Once an order is placed and payment is made, no refund will be issued under any circumstances."
      ),

      React.createElement("h3", { key: "h3-2" }, "2. Service Time"),
      React.createElement(
        "p",
        { key: "p2" },
        "Delivery time may slightly vary depending on demand and queue."
      ),

      React.createElement("h3", { key: "h3-3" }, "3. Account Safety"),
      React.createElement(
        "p",
        { key: "p3" },
        "We use safe and premium methods, but we are not responsible for actions taken by social media platforms."
      )
    ]
  );
};

export default TermsPage;
