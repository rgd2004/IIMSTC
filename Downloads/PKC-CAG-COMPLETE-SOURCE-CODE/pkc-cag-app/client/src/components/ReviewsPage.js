import React from "react";

const ReviewsPage = () => {
  return React.createElement(
    "div",
    { className: "reviews-page container" },
    [
      React.createElement("h1", { key: "h1" }, "Client Reviews"),
      React.createElement(
        "p",
        { key: "p" },
        "Here are some verified reviews from our happy customers."
      ),
      React.createElement(
        "div",
        { key: "reviews", className: "review-box" },
        [
          React.createElement(
            "div",
            { key: "r1", className: "review-card" },
            [
              React.createElement("h3", { key: "n" }, "Ramesh Gowda"),
              React.createElement("p", { key: "t" },
                "Amazing service! My GMB reviews were delivered on time."
              )
            ]
          ),
          React.createElement(
            "div",
            { key: "r2", className: "review-card" },
            [
              React.createElement("h3", { key: "n" }, "Meghana Shetty"),
              React.createElement("p", { key: "t" },
                "Premium followers are real and stable. Highly recommended!"
              )
            ]
          )
        ]
      )
    ]
  );
};

export default ReviewsPage;
