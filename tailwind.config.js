// tailwind.config.js
module.exports = {
    variants: {
      extend: {
        backgroundColor: ['even'],
      }
    },
    darkMode: "media",
    plugins: [require("nightwind")],
  }