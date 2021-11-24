// tailwind.config.js
module.exports = {
    purge: {
      content: [
        "./templates/index.html",
        "./js/custom.js"
      ]
    },
    variants: {
      extend: {
        backgroundColor: ["focus","even"],
      },
      nightwind: ["focus","even"], // Add any Tailwind variant
    },
    darkMode: "media",
    plugins: [require("nightwind")],
  }