// tailwind.config.js
module.exports = {
    variants: {
      extend: {
        backgroundColor: ["focus","even"],
      },
      nightwind: ["focus","even"], // Add any Tailwind variant
    },
    darkMode: "media",
    plugins: [require("nightwind")],
  }